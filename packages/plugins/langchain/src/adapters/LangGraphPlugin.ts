// plugins/LangGraphPlugin.ts

import { ProviderServiceError } from '../errors/index.js';
import { logger } from '@mintflow/common';
import { ConfigService } from '../services/ConfigService.js';
import { RedisService } from '../services/RedisService.js';
import '@langchain/langgraph';

// Flow interfaces - these would typically be imported from a shared location
interface IFlow {
    id: string;
    name: string;
    definition: {
        nodes: INodeDefinition[];
    };
}

interface IFlowNodeState {
    nodeId: string;
    status: string;
    result?: any;
}

interface IFlowRun {
    id: string;
    flowId: string;
    status: string;
    workingData: Record<string, any>;
    nodeStates: IFlowNodeState[];
}

interface INodeDefinition {
    nodeId: string;
    type: string;
    nextNodes?: string[];
    branches?: {
        condition: string;
        targetNodeId: string;
    }[];
}

// Service interfaces
interface INodeExecutorService {
    executeNode(flow: IFlow, flowRun: IFlowRun, nodeId: string): Promise<void>;
}

interface IFlowService {
    getFlowById(flowId: string): Promise<IFlow | null>;
}

interface IFlowRunService {
    getFlowRunById(runId: string): Promise<IFlowRun | null>;
}

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
export interface GraphState {
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
    private config;
    private redis;
    private nodeExecutor;
    private flowService;
    private flowRunService;

    private constructor(
        configService: ConfigService,
        redisService: RedisService,
        nodeExecutor: INodeExecutorService,
        flowService: IFlowService,
        flowRunService: IFlowRunService
    ) {
        this.config = configService.getConfig();
        this.redis = redisService;
        this.nodeExecutor = nodeExecutor;
        this.flowService = flowService;
        this.flowRunService = flowRunService;
    }

    static getInstance(
        configService?: ConfigService,
        redisService?: RedisService,
        nodeExecutor?: INodeExecutorService,
        flowService?: IFlowService,
        flowRunService?: IFlowRunService
    ): LangGraphManager {
        if (!LangGraphManager.instance) {
            if (!configService) configService = ConfigService.getInstance();
            if (!redisService) redisService = RedisService.getInstance();

            // These services must be provided if instance doesn't exist
            if (!nodeExecutor || !flowService || !flowRunService) {
                throw new Error('Required services must be provided when creating LangGraphManager instance');
            }

            LangGraphManager.instance = new LangGraphManager(
                configService,
                redisService,
                nodeExecutor,
                flowService,
                flowRunService
            );
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
                    } catch (error) {
                        const errorMessage = error instanceof Error ? error.message : String(error);
                        logger.error(`Error executing node ${node.nodeId} in graph:`, { error: errorMessage });
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
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            logger.error(`Error executing graph step for node ${currentNode.id}:`, { error: errorMessage });

            // Update the state with the error
            return this.updateGraphState(flowRunId, {
                error: errorMessage,
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
            const errorMessage = error instanceof Error ? error.message : String(error);
            logger.error(`Error evaluating condition: ${condition}`, { error: errorMessage });
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

    // Services to be injected at runtime
    services: {
        nodeExecutor: { required: true },
        flowService: { required: true },
        flowRunService: { required: true },
        configService: { required: false },
        redisService: { required: false }
    },

    // Initialize the plugin with injected services
    initialize: function (services: {
        nodeExecutor: INodeExecutorService,
        flowService: IFlowService,
        flowRunService: IFlowRunService,
        configService?: ConfigService,
        redisService?: RedisService
    }) {
        // Initialize the LangGraphManager with the injected services
        LangGraphManager.getInstance(
            services.configService,
            services.redisService,
            services.nodeExecutor,
            services.flowService,
            services.flowRunService
        );
    },

    actions: [
        {
            name: 'initializeGraph',
            execute: async function (input: {
                flowRunId: string;
                values?: Record<string, any>;
            }, services: any): Promise<GraphState> {
                // Get the LangGraphManager instance with the injected services
                const manager = LangGraphManager.getInstance();
                return manager.initializeGraphState(
                    input.flowRunId,
                    input.values || {}
                );
            }
        },
        {
            name: 'executeStep',
            execute: async function (input: {
                flowRunId: string;
            }, services: any): Promise<GraphState> {
                const manager = LangGraphManager.getInstance();
                return manager.executeGraphStep(input.flowRunId);
            }
        },
        {
            name: 'runGraph',
            execute: async function (input: {
                flowRunId: string;
                values?: Record<string, any>;
            }, services: any): Promise<GraphState> {
                const manager = LangGraphManager.getInstance();
                return manager.runGraph(
                    input.flowRunId,
                    input.values || {}
                );
            }
        },
        {
            name: 'createCheckpoint',
            execute: async function (input: {
                flowRunId: string;
            }, services: any): Promise<string> {
                const manager = LangGraphManager.getInstance();
                return manager.checkpointGraph(input.flowRunId);
            }
        },
        {
            name: 'restoreCheckpoint',
            execute: async function (input: {
                checkpointId: string;
            }, services: any): Promise<GraphState> {
                const manager = LangGraphManager.getInstance();
                return manager.restoreFromCheckpoint(input.checkpointId);
            }
        }
    ]
};

export default langGraphPlugin;
