// plugins/LangGraphPlugin.ts

import {
    IFlow,
    IFlowNodeState,
    IFlowRun,
    INodeDefinition
} from '../services/FlowInterfaces.js';
import { ConfigService } from '../services/ConfigService.js';
import { RedisService } from '../services/RedisService.js';
import { NodeExecutorService } from '../services/NodeExecutorService.js';
import { FlowRunService } from '../services/FlowRunService.js';
import { FlowService } from '../services/FlowService.js';
import { ProviderServiceError } from '../errors/index.js';
import { logger } from '@mintflow/common';

/**
 * Graph Node interface for LangGraph integration
 */
interface GraphNode {
    id: string;
    type: string;
    handler: (state: any, runId: string) => Promise<any>;
    edges: string[];
    conditional_edges?: {
        condition: string;
        target: string;
    }[];
}

/**
 * Graph State Type
 */
interface GraphState {
    values: Record<string, any>;
    run_id: string;
    current_node: string;
    next_node?: string;
    history: string[];
    completed: boolean;
    error?: string;
}

/**
 * LangGraph Plugin to integrate LangChain's graph orchestration with our workflow engine
 */
export class LangGraphManager {
    private static instance: LangGraphManager;
    private config = ConfigService.getInstance().getConfig();
    private redis = RedisService.getInstance();
    private nodeExecutor = NodeExecutorService.getInstance();
    private flowService = FlowService.getInstance();
    private flowRunService = FlowRunService.getInstance();

    private constructor() { }

    static getInstance(): LangGraphManager {
        if (!LangGraphManager.instance) {
            LangGraphManager.instance = new LangGraphManager();
        }
        return LangGraphManager.instance;
    }

    /**
     * Creates a graph structure from a flow definition
     */
    buildGraphFromFlow(flow: IFlow): { nodes: GraphNode[], startNodeId: string } {
        const nodes: GraphNode[] = [];
        let startNodeId = '';

        // Convert flow nodes to graph nodes
        for (const node of flow.definition.nodes) {
            if (node.type === 'start') {
                startNodeId = node.nodeId;
            }

            const graphNode: GraphNode = {
                id: node.nodeId,
                type: node.type,
                // We'll define the handler to call our node executor
                handler: async (state: any, runId: string) => {
                    try {
                        // Get the flow run
                        const flowRun = await this.flowRunService.getFlowRunById(runId);
                        if (!flowRun) {
                            throw new Error(`Flow run not found: ${runId}`);
                        }

                        // Update flow run working data from graph state
                        flowRun.workingData = {
                            ...flowRun.workingData,
                            ...state.values
                        };

                        // Execute the node
                        await this.nodeExecutor.executeNode(flow, flowRun, node.nodeId);

                        // Get the updated node state
                        const nodeState = flowRun.nodeStates.find(
                            (ns: IFlowNodeState) => ns.nodeId === node.nodeId
                        );

                        // Return the node's result to be incorporated into the graph state
                        return nodeState?.result || null;
                    } catch (error: any) {
                        logger.error(`Error executing node ${node.nodeId} in graph:`, error);
                        throw error;
                    }
                },
                edges: node.nextNodes || [],
                conditional_edges: node.branches?.map(branch => ({
                    condition: branch.condition,
                    target: branch.targetNodeId
                }))
            };

            nodes.push(graphNode);
        }

        if (!startNodeId) {
            throw new Error('No start node found in flow definition');
        }

        return { nodes, startNodeId };
    }

    /**
     * Creates a new graph state for a flow run
     */
    async initializeGraphState(flowRunId: string, initialValues: Record<string, any> = {}): Promise<GraphState> {
        const flowRun = await this.flowRunService.getFlowRunById(flowRunId);
        if (!flowRun) {
            throw new Error(`Flow run not found: ${flowRunId}`);
        }

        const flow = await this.flowService.getFlowById(flowRun.flowId);
        if (!flow) {
            throw new Error(`Flow not found: ${flowRun.flowId}`);
        }

        const { startNodeId } = this.buildGraphFromFlow(flow);

        const state: GraphState = {
            values: {
                ...initialValues,
                ...flowRun.workingData
            },
            run_id: flowRunId,
            current_node: startNodeId,
            history: [],
            completed: false
        };

        // Store the state in Redis for persistence
        await this.redis.setGraphState(flowRunId, state);

        return state;
    }

    /**
     * Updates a graph state with new values
     */
    async updateGraphState(flowRunId: string, updates: Partial<GraphState>): Promise<GraphState> {
        const currentState = await this.getGraphState(flowRunId);
        if (!currentState) {
            throw new Error(`Graph state not found for run: ${flowRunId}`);
        }

        const updatedState: GraphState = {
            ...currentState,
            ...updates,
            values: {
                ...currentState.values,
                ...(updates.values || {})
            }
        };

        await this.redis.setGraphState(flowRunId, updatedState);
        return updatedState;
    }

    /**
     * Gets the current graph state for a flow run
     */
    async getGraphState(flowRunId: string): Promise<GraphState | null> {
        return this.redis.getGraphState(flowRunId);
    }

    /**
     * Executes a step in the graph
     */
    async executeGraphStep(flowRunId: string): Promise<GraphState> {
        const state = await this.getGraphState(flowRunId);
        if (!state) {
            throw new Error(`Graph state not found for run: ${flowRunId}`);
        }

        if (state.completed) {
            return state;
        }

        const flowRun = await this.flowRunService.getFlowRunById(flowRunId);
        if (!flowRun) {
            throw new Error(`Flow run not found: ${flowRunId}`);
        }

        const flow = await this.flowService.getFlowById(flowRun.flowId);
        if (!flow) {
            throw new Error(`Flow not found: ${flowRun.flowId}`);
        }

        const { nodes } = this.buildGraphFromFlow(flow);

        // Find the current node
        const currentNode = nodes.find(node => node.id === state.current_node);
        if (!currentNode) {
            throw new Error(`Node not found in graph: ${state.current_node}`);
        }

        try {
            // Execute the current node's handler
            const result = await currentNode.handler(state, flowRunId);

            // Update the state with the result
            const updatedValues = {
                ...state.values,
                [`${currentNode.id}_result`]: result
            };

            // Update history
            const history = [...state.history, currentNode.id];

            // Determine the next node
            let nextNode = '';

            // Check conditional edges if present
            if (currentNode.conditional_edges?.length) {
                for (const edge of currentNode.conditional_edges) {
                    const conditionMet = await this.evaluateCondition(edge.condition, updatedValues);
                    if (conditionMet) {
                        nextNode = edge.target;
                        break;
                    }
                }
            }

            // If no conditional edge matched, use the first regular edge
            if (!nextNode && currentNode.edges.length > 0) {
                nextNode = currentNode.edges[0];
            }

            // Determine if the graph is completed
            const completed = !nextNode;

            // Update the state
            return this.updateGraphState(flowRunId, {
                values: updatedValues,
                current_node: nextNode,
                history,
                completed
            });
        } catch (error: any) {
            logger.error(`Error executing graph step for node ${currentNode.id}:`, error);

            // Update the state with the error
            return this.updateGraphState(flowRunId, {
                error: error.message,
                completed: true
            });
        }
    }

    /**
     * Evaluates a condition against the current state values
     */
    private async evaluateCondition(condition: string, values: Record<string, any>): Promise<boolean> {
        try {
            // Simple condition evaluation for now
            // This could be expanded to use a proper expression evaluator
            const result = new Function('state', `return ${condition}`)(values);
            return Boolean(result);
        } catch (error) {
            logger.error(`Error evaluating condition: ${condition}`, error);
            return false;
        }
    }

    /**
     * Runs a complete graph execution for a flow
     */
    async runGraph(flowRunId: string, initialValues: Record<string, any> = {}): Promise<GraphState> {
        // Initialize the graph state
        let state = await this.initializeGraphState(flowRunId, initialValues);

        // Keep executing steps until the graph is completed
        while (!state.completed) {
            state = await this.executeGraphStep(flowRunId);

            // Add a small delay to prevent overloading the system
            await new Promise(resolve => setTimeout(resolve, 50));
        }

        return state;
    }

    /**
     * Checkpoints the current state of a graph execution
     */
    async checkpointGraph(flowRunId: string): Promise<string> {
        const state = await this.getGraphState(flowRunId);
        if (!state) {
            throw new Error(`Graph state not found for run: ${flowRunId}`);
        }

        // Generate a checkpoint ID
        const checkpointId = `checkpoint-${flowRunId}-${Date.now()}`;

        // Store the checkpoint
        await this.redis.setGraphCheckpoint(checkpointId, state);

        return checkpointId;
    }

    /**
     * Restores a graph execution from a checkpoint
     */
    async restoreFromCheckpoint(checkpointId: string): Promise<GraphState> {
        const state = await this.redis.getGraphCheckpoint(checkpointId);
        if (!state) {
            throw new Error(`Checkpoint not found: ${checkpointId}`);
        }

        // Restore the state
        await this.redis.setGraphState(state.run_id, state);

        return state;
    }

    /**
     * Cleans up resources
     */
    async cleanup(): Promise<void> {
        // Nothing specific to clean up here
    }
}

// Extend the RedisService to support graph state operations
declare module '../services/RedisService.js' {
    interface RedisService {
        setGraphState(flowRunId: string, state: GraphState): Promise<void>;
        getGraphState(flowRunId: string): Promise<GraphState | null>;
        setGraphCheckpoint(checkpointId: string, state: GraphState): Promise<void>;
        getGraphCheckpoint(checkpointId: string): Promise<GraphState | null>;
    }
}

// Implement the new methods in RedisService
RedisService.prototype.setGraphState = async function (flowRunId: string, state: GraphState): Promise<void> {
    const key = `graph:state:${flowRunId}`;
    await this.client.set(key, JSON.stringify(state));
};

RedisService.prototype.getGraphState = async function (flowRunId: string): Promise<GraphState | null> {
    const key = `graph:state:${flowRunId}`;
    const data = await this.client.get(key);
    if (!data) return null;
    return JSON.parse(data) as GraphState;
};

RedisService.prototype.setGraphCheckpoint = async function (checkpointId: string, state: GraphState): Promise<void> {
    const key = `graph:checkpoint:${checkpointId}`;
    await this.client.set(key, JSON.stringify(state));
    // Set expiration for checkpoints (e.g., 30 days)
    await this.client.expire(key, 60 * 60 * 24 * 30);
};

RedisService.prototype.getGraphCheckpoint = async function (checkpointId: string): Promise<GraphState | null> {
    const key = `graph:checkpoint:${checkpointId}`;
    const data = await this.client.get(key);
    if (!data) return null;
    return JSON.parse(data) as GraphState;
};

// Plugin definition for integration with your workflow engine
const langGraphPlugin = {
    id: "langgraph",
    name: "LangGraph Plugin",
    icon: "GiFlowChart",
    description: "Manages LangGraph execution for workflow orchestration",
    documentation: "https://docs.example.com/langgraph",

    inputSchema: {
        flowId: { type: 'string' },
        flowRunId: { type: 'string' },
        values: { type: 'object' },
        checkpointId: { type: 'string' }
    },

    actions: [
        {
            name: 'initializeGraph',
            execute: async function (input: {
                flowRunId: string;
                values?: Record<string, any>;
            }): Promise<GraphState> {
                return LangGraphManager.getInstance().initializeGraphState(
                    input.flowRunId,
                    input.values || {}
                );
            }
        },
        {
            name: 'executeStep',
            execute: async function (input: {
                flowRunId: string;
            }): Promise<GraphState> {
                return LangGraphManager.getInstance().executeGraphStep(input.flowRunId);
            }
        },
        {
            name: 'runGraph',
            execute: async function (input: {
                flowRunId: string;
                values?: Record<string, any>;
            }): Promise<GraphState> {
                return LangGraphManager.getInstance().runGraph(
                    input.flowRunId,
                    input.values || {}
                );
            }
        },
        {
            name: 'createCheckpoint',
            execute: async function (input: {
                flowRunId: string;
            }): Promise<string> {
                return LangGraphManager.getInstance().checkpointGraph(input.flowRunId);
            }
        },
        {
            name: 'restoreCheckpoint',
            execute: async function (input: {
                checkpointId: string;
            }): Promise<GraphState> {
                return LangGraphManager.getInstance().restoreFromCheckpoint(input.checkpointId);
            }
        }
    ]
};

export default langGraphPlugin;