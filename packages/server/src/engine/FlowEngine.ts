import { Redis } from 'ioredis';
import axios from 'axios';
import { Request } from 'express';
import { ENV } from '../config/env.js';
import { getNodeAction, getPlugin } from '../plugins-register.js';
import { logger } from '@mintflow/common';
import { DatabaseService } from '../services/DatabaseService.js';
import { EventEmitter } from 'events';
import mqtt from 'mqtt';
import { v4 as uuidv4 } from 'uuid';
// Optionally import interfaces if defined externally:
// import { IFlow, IFlowNodeState } from '../interfaces/IFlowState.js';

//
// === INTERFACES & TYPES ===
//

// Flow context stored in Redis (for persistence/recovery)
interface IFlowContext {
    flowId: string;
    tenantId: string;
    data: Record<string, any>;
    startedAt: Date;
    lastUpdatedAt: Date;
}

// Node execution status
export type NodeStatus =
    | 'pending'
    | 'running'
    | 'waiting'
    | 'completed'
    | 'failed'
    | 'manual_wait';

// Execution modes for nodes
export type NodeExecutionMode =
    | 'sync'           // Regular synchronous execution
    | 'auto'           // Automatic execution (with branching)
    | 'manual'         // Wait for manual progression (e.g. forms/wizards)
    | 'wait_for_input' // Wait for user input before proceeding
    | 'mqtt'           // Waits for MQTT message
    | 'http_callback'  // Waits for HTTP callback
    | 'event'          // Waits for a custom event
    | 'external';      // Executes via an external service

// Branch condition for nodes that support branching
interface IBranchCondition {
    condition: string;
    targetNodeId: string;
    evaluator?: (context: any) => boolean;
}

// Unified node definition interface (includes properties from all versions)
export interface INodeDefinition {
    nodeId: string;
    type: string;
    runner: 'node' | 'python';
    executionMode?: NodeExecutionMode; // Optional – fallback logic based on type if not provided.
    input?: any;
    nextNodes?: string[];
    conditions?: { // For decision/switch nodes
        condition: string;
        nextNodeId: string;
    }[];
    branches?: IBranchCondition[];
    manualNextNodes?: string[];  // For manual selection of next node
    waitForHttp?: boolean;
    entry?: {
        url: string;
        method?: string;
        headers?: Record<string, string>;
        timeout?: number;
    };
    mqtt?: {
        topic: string;
        timeout?: number;
    };
    http?: {
        callbackUrl: string;
        timeout?: number;
    };
    event?: {
        eventName: string;
        timeout?: number;
    };
}

// Node state (for logging/recovery)
export interface IFlowNodeState {
    nodeId: string;
    status: NodeStatus;
    result?: any;
    logs: string[];
    startedAt?: Date;
    finishedAt?: Date;
    error?: string;
    selectedBranch?: string;
    availableNextNodes?: string[];
    inputRequirements?: any;
    inputData?: any;
    selectedNext?: string;
}


export interface IFlow {
    tenantId: string;
    flowId: string;
    definition: any;     // e.g., { nodes: [...], edges: [...] }
    overallStatus: 'draft' | 'running' | 'paused' | 'completed' | 'failed';
    nodeStates: IFlowNodeState[];    // track each node’s status/logs
    createdAt: Date;
    updatedAt: Date;
    logs?: string[];                 // store general flow logs
    status: string;                  // e.g., "draft", "running", "completed"
    workingState?: any;
    URL: string;                    // Add any other required properties
    // Add any other required properties to match the Document type
}

//
// === FLOW ENGINE CLASS ===
//

export class FlowEngine {
    // General Redis client (for waiting states, MQTT, callbacks, etc.)
    private static redis = new Redis({
        host: ENV.REDIS_HOST,
        port: ENV.REDIS_PORT,
    });

    // Separate Redis client for persistent flow context (different DB)
    private static contextStore = new Redis({
        host: ENV.REDIS_HOST,
        port: ENV.REDIS_PORT,
        db: 1
    });

    // Event emitter for custom event nodes
    private static eventEmitter = new EventEmitter();

    // MQTT client for MQTT nodes
    private static mqttClient = mqtt.connect('', {
    });

    // -------------------- CONTEXT MANAGEMENT --------------------

    /**
     * Initializes and persists a new flow context.
     */
    public static async initFlowContext(tenantId: string, flowId: string): Promise<void> {
        const context: IFlowContext = {
            flowId,
            tenantId,
            data: {},
            startedAt: new Date(),
            lastUpdatedAt: new Date()
        };
        await this.contextStore.set(
            `flow_context:${tenantId}:${flowId}`,
            JSON.stringify(context),
            'EX',
            86400
        );
    }

    /**
     * Retrieves the persistent flow context.
     */
    private static async getFlowContext(tenantId: string, flowId: string): Promise<IFlowContext | null> {
        const data = await this.contextStore.get(`flow_context:${tenantId}:${flowId}`);
        return data ? JSON.parse(data) : null;
    }

    /**
     * Updates the persistent flow context with provided updates.
     */
    private static async updateFlowContext(
        tenantId: string,
        flowId: string,
        updates: Record<string, any>
    ): Promise<void> {
        const contextKey = `flow_context:${tenantId}:${flowId}`;
        const contextData = await this.contextStore.get(contextKey);
        if (contextData) {
            const context: IFlowContext = JSON.parse(contextData);
            Object.assign(context.data, updates);
            context.lastUpdatedAt = new Date();
            await this.contextStore.set(contextKey, JSON.stringify(context), 'EX', 86400);
        }
    }

    static createNodeState(): IFlowNodeState {
        return {
            nodeId: '',
            status: 'pending',
            logs: [],
        }
    }

    // -------------------- FLOW EXECUTION --------------------

    /**
     * Starts the flow by initializing persistent context, node states, and an in‑memory working state.
     */
    public static async runFlow(tenantId: string, flowId: string): Promise<IFlow> {
        const flow: IFlow = await DatabaseService.getInstance().getFlow(tenantId, flowId);
        if (!flow) {
            throw new Error(`Flow not found: tenant=${tenantId}, flowId=${flowId}`);
        }

        // Initialize persistent context
        await this.initFlowContext(tenantId, flowId);

        // Initialize node states if not already set
        const startNode = flow.definition.nodes.find((n: INodeDefinition) => n.type === 'start');
        if (!startNode) {
            throw new Error('No start node found in flow definition');
        }
        flow.nodeStates = [{
            nodeId: startNode.nodeId,
            status: 'pending',
            logs: []
        }];
        flow.overallStatus = 'running';

        // Initialize the in‑memory working state for fast data passing
        flow.workingState = {};

        await DatabaseService.getInstance().saveFlow(flow);

        return flow;
    }

    /**
     * Executes a specific node based on its definition.
     */
    public static async executeNode(flow: IFlow, nodeId: string, workingData?: any): Promise<void> {
        const nodeDef = flow.definition.nodes.find((n: INodeDefinition) => n.nodeId === nodeId);
        if (!nodeDef) {
            throw new Error(`Node definition not found: ${nodeId}`);
        }

        // Ensure node state exists
        let nodeState = flow.nodeStates.find((ns: IFlowNodeState) => ns.nodeId === nodeId);
        if (!nodeState) {
            nodeState = { nodeId, status: 'pending', logs: [], inputData: workingData };
            flow.nodeStates.push(nodeState);
        }

        try {
            // Dispatch based on executionMode (if provided) or fallback on node type
            if (nodeDef.executionMode) {
                switch (nodeDef.executionMode) {
                    case 'manual':
                        await this.handleManualNode(flow, nodeDef, nodeState);
                        break;
                    case 'wait_for_input':
                        await this.handleWaitForInputNode(flow, nodeDef, nodeState);
                        break;
                    case 'auto':
                        await this.handleAutoNode(flow, nodeDef, nodeState);
                        break;
                    case 'mqtt':
                        await this.executeMqttNode(flow, nodeDef, nodeState);
                        break;
                    case 'http_callback':
                        await this.executeHttpCallbackNode(flow, nodeDef, nodeState);
                        break;
                    case 'event':
                        await this.executeEventNode(flow, nodeDef, nodeState);
                        break;
                    case 'external':
                        await this.executeExternalNode(flow, nodeDef, nodeState);
                        break;
                    case 'sync':
                    default:
                        await this.handleStandardNode(flow, nodeDef, nodeState);
                        break;
                }
            } else {
                // Fallback based on node type
                switch (nodeDef.type) {
                    case 'decision':
                        await this.handleDecisionNode(flow, nodeDef, nodeState);
                        break;
                    case 'switch':
                        await this.handleSwitchNode(flow, nodeDef, nodeState);
                        break;
                    case 'http':
                        await this.handleHttpNode(flow, nodeDef, nodeState);
                        break;
                    case 'httpListener':
                        await this.handleHttpListenerNode(flow, nodeDef, nodeState);
                        break;
                    case 'python':
                        await this.handlePythonNode(flow, nodeDef, nodeState);
                        break;
                    default:
                        await this.handleStandardNode(flow, nodeDef, nodeState);
                        break;
                }
            }
            await DatabaseService.getInstance().saveFlow(flow);
        } catch (error: any) {
            nodeState.status = 'failed';
            nodeState.error = error.message;
            nodeState.logs.push(`Error: ${error.message}`);
            await DatabaseService.getInstance().saveFlow(flow);
            throw error;
        }
    }

    /**
     * Proceeds to the next nodes specified in the current node definition.
     */
    private static async proceedToNextNodes(flow: IFlow, nodeDef: INodeDefinition, nodeState: IFlowNodeState): Promise<void> {
        if (nodeDef.nextNodes && nodeDef.nextNodes.length > 0) {
            for (const nextNodeId of nodeDef.nextNodes) {
                await this.executeNode(flow, nextNodeId);
            }
        }
    }

    // -------------------- NODE HANDLERS --------------------

    /**
     * Standard (synchronous) node execution using the working state.
     * Uses the workingState (in-memory) for node processing and then updates the persistent context.
     */
    private static async handleStandardNode(flow: IFlow, nodeDef: INodeDefinition, nodeState: IFlowNodeState): Promise<void> {
        nodeState.status = 'running';
        nodeState.startedAt = new Date();
        // Use the in-memory working state for faster access.
        const workingState = flow.workingState || {};
        try {
            const result = await this.executeNodeLogic(nodeDef, workingState);
            nodeState.status = 'completed';
            nodeState.result = result;
            nodeState.finishedAt = new Date();
            // Merge the node's result into the working state.
            workingState[`${nodeDef.nodeId}_result`] = result;
            // Also update the persistent flow context for recovery.
            await this.updateFlowContext(flow.tenantId, flow.flowId, { [`${nodeDef.nodeId}_result`]: result });
            await this.proceedToNextNodes(flow, nodeDef, nodeState);
        } catch (error: any) {
            nodeState.status = 'failed';
            nodeState.error = error.message;
            throw error;
        }
    }

    /**
     * Executes node logic via a registered node action.
     * Merges node input with the provided context (working state).
     */
    private static async executeNodeLogic(nodeDef: INodeDefinition, contextData: Record<string, any> = {}): Promise<any> {
        const nodeAction = await getNodeAction(nodeDef.nodeId, nodeDef.type);
        if (!nodeAction?.execute) {
            throw new Error(`No execute function found for node: ${nodeDef.nodeId}`);
        }

        // const flowContext = await FlowEngine.getFlowContext(tenantId, flowId);
        const input = { ...contextData };
        return nodeAction.execute(input, nodeDef);
    }

    /**
     * Decision node execution – evaluates conditions using the working state.
     */
    private static async handleDecisionNode(flow: IFlow, nodeDef: INodeDefinition, nodeState: IFlowNodeState): Promise<void> {
        nodeState.status = 'running';
        // Use working state for condition evaluation.
        const workingState = flow.workingState || {};
        for (const condition of nodeDef.conditions || []) {
            try {
                const safeEval = new Function('context', `return (${condition.condition});`);
                const result = safeEval(workingState);
                if (result) {
                    nodeState.selectedBranch = condition.nextNodeId;
                    nodeState.status = 'completed';
                    await this.executeNode(flow, condition.nextNodeId);
                    return;
                }
            } catch (error) {
                logger.error('Error evaluating condition', { error, condition });
            }
        }
        if (nodeDef.nextNodes?.[0]) {
            await this.executeNode(flow, nodeDef.nextNodes[0]);
        }
    }

    /**
     * Switch node handling – alias for decision.
     */
    private static async handleSwitchNode(flow: IFlow, nodeDef: INodeDefinition, nodeState: IFlowNodeState): Promise<void> {
        await this.handleDecisionNode(flow, nodeDef, nodeState);
    }

    /**
     * HTTP node execution – makes an HTTP request.
     */
    private static async handleHttpNode(flow: IFlow, nodeDef: INodeDefinition, nodeState: IFlowNodeState): Promise<void> {
        if (!nodeDef.entry?.url) {
            throw new Error('HTTP node missing URL configuration');
        }
        const { url, method = 'GET', headers = {}, timeout } = nodeDef.entry;
        const axiosConfig: any = { method, url, headers, data: nodeDef.input };
        if (timeout) axiosConfig.timeout = timeout;

        try {
            const response = await axios(axiosConfig);
            nodeState.result = response.data;
            nodeState.status = 'completed';
            nodeState.logs.push(`HTTP call successful: ${method} ${url}`);
            await this.updateFlowContext(flow.tenantId, flow.flowId, { [`${nodeDef.nodeId}_result`]: response.data });
            await this.proceedToNextNodes(flow, nodeDef, nodeState);
        } catch (error: any) {
            nodeState.status = 'failed';
            nodeState.error = error.message;
            throw new Error(`HTTP call failed: ${error.message}`);
        }
    }

    /**
     * HTTP listener node – waits for an HTTP callback.
     */
    private static async handleHttpListenerNode(flow: IFlow, nodeDef: INodeDefinition, nodeState: IFlowNodeState): Promise<void> {
        nodeState.status = 'waiting';
        nodeState.logs.push('Waiting for HTTP callback');
        const waitKey = `http_wait:${flow.tenantId}:${flow.flowId}:${nodeDef.nodeId}`;
        await this.redis.set(waitKey, 'waiting', 'EX', 86400);
    }

    /**
 * HTTP listener node – waits for an HTTP callback.
 */
    public static async handleHttpRequest(tenantId: string, flowId: string, nodeId: string, req: any): Promise<any> {
        return null
    }


    /**
     * Python node execution – enqueues a Python task.
     */
    private static async handlePythonNode(flow: IFlow, nodeDef: INodeDefinition, nodeState: IFlowNodeState): Promise<void> {
        nodeState.status = 'waiting';
        nodeState.logs.push('Enqueueing Python task');
        const queueKey = `pythonQueue_${flow.tenantId}`;
        await this.redis.rpush(queueKey, JSON.stringify({
            taskName: nodeDef.nodeId,
            input: nodeDef.input,
            flowId: flow.flowId,
            tenantId: flow.tenantId
        }));
    }

    /**
     * Complete node – to be called by external services.
     */
    public static async completeNode(tenantId: string, flowId: string, nodeId: string, result?: any): Promise<void> {
        const flow: IFlow = await DatabaseService.getInstance().getFlow(tenantId, flowId);
        if (!flow) return;
        const nodeState = flow.nodeStates.find((ns: IFlowNodeState) => ns.nodeId === nodeId);
        const nodeDef = flow.definition.nodes.find((n: INodeDefinition) => n.nodeId === nodeId);
        if (nodeState && nodeDef) {
            nodeState.status = 'completed';
            nodeState.result = result;
            nodeState.logs.push('Node completed by external service');
            await this.updateFlowContext(tenantId, flowId, { [`${nodeId}_result`]: result });
            await this.proceedToNextNodes(flow, nodeDef, nodeState);
            await DatabaseService.getInstance().saveFlow(flow);
        }
    }

    // -------------------- ASYNCHRONOUS NODE HANDLERS --------------------
    // (MQTT, HTTP Callback, Event, External)

    /**
     * MQTT node execution – subscribes and waits for a message.
     */
    public static async executeMqttNode(flow: IFlow, nodeDef: INodeDefinition, nodeState: IFlowNodeState): Promise<void> {
        if (!nodeDef.mqtt?.topic) {
            throw new Error('MQTT topic not specified');
        }
        nodeState.status = 'waiting';
        const correlationId = uuidv4();
        await this.redis.set(
            `mqtt_wait:${correlationId}`,
            JSON.stringify({ flow, nodeDef, nodeState }),
            'EX',
            nodeDef.mqtt.timeout || 3600
        );
        this.mqttClient.subscribe(nodeDef.mqtt.topic);
        // this.mqttClient.on('message', async (topic, message) => {
        //     if (topic === nodeDef.mqtt.topic) {
        //         const waitingState = await this.redis.get(`mqtt_wait:${correlationId}`);
        //         if (waitingState) {
        //             const { flow, nodeDef, nodeState } = JSON.parse(waitingState);
        //             nodeState.status = 'completed';
        //             nodeState.result = JSON.parse(message.toString());
        //             await this.proceedToNextNodes(flow, nodeDef, nodeState);
        //             await this.redis.del(`mqtt_wait:${correlationId}`);
        //         }
        //     }
        // });
    }

    /**
     * HTTP callback node execution – stores state and returns a callback URL.
     */
    public static async executeHttpCallbackNode(flow: IFlow, nodeDef: INodeDefinition, nodeState: IFlowNodeState): Promise<any> {
        if (!nodeDef.http?.callbackUrl) {
            throw new Error('HTTP callback URL not specified');
        }
        nodeState.status = 'waiting';
        const callbackId = uuidv4();
        await this.redis.set(
            `http_callback:${callbackId}`,
            JSON.stringify({ flow, nodeDef, nodeState }),
            'EX',
            nodeDef.http.timeout || 3600
        );
        return { callbackUrl: `${nodeDef.http.callbackUrl}?callbackId=${callbackId}` };
    }

    /**
     * Handles an incoming HTTP callback.
     */
    public static async handleHttpCallback(callbackId: string, data: any): Promise<void> {
        const waitingState = await this.redis.get(`http_callback:${callbackId}`);
        if (waitingState) {
            const { flow, nodeDef, nodeState } = JSON.parse(waitingState);
            nodeState.status = 'completed';
            nodeState.result = data;
            await this.proceedToNextNodes(flow, nodeDef, nodeState);
            await this.redis.del(`http_callback:${callbackId}`);
        }
    }

    /**
     * Event node execution – waits for a custom event.
     */
    private static async executeEventNode(flow: IFlow, nodeDef: INodeDefinition, nodeState: IFlowNodeState): Promise<void> {
        if (!nodeDef.event?.eventName) {
            throw new Error('Event name not specified');
        }
        nodeState.status = 'waiting';
        const eventId = uuidv4();
        await this.redis.set(
            `event_wait:${eventId}`,
            JSON.stringify({ flow, nodeDef, nodeState }),
            'EX',
            nodeDef.event.timeout || 3600
        );
        this.eventEmitter.once(nodeDef.event.eventName, async (data) => {
            await this.handleEventCompletion(`event_wait:${eventId}`, data);
        });
    }

    public static async handleEventCompletion(eventKey: string, data: any): Promise<void> {
        const storedState = await this.redis.get(eventKey);
        if (!storedState) return;
        const { flow, nodeDef, nodeState } = JSON.parse(storedState);
        nodeState.status = 'completed';
        nodeState.result = data;
        await this.redis.del(eventKey);
        await this.proceedToNextNodes(flow, nodeDef, nodeState);
        await DatabaseService.getInstance().saveFlow(flow);
    }

    /**
     * External node execution – enqueues a task for an external service.
     */
    public static async executeExternalNode(flow: IFlow, nodeDef: INodeDefinition, nodeState: IFlowNodeState): Promise<void> {
        nodeState.status = 'waiting';
        await this.redis.rpush('external_tasks', JSON.stringify({
            flowId: flow.flowId,
            nodeId: nodeDef.nodeId,
            input: nodeDef.input,
            // Here we pass the workingState as the current context for external processing.
            context: flow.workingState
        }));
    }

    /**
     * Handles external completion notifications.
     */
    public static async handleExternalCompletion(flowId: string, nodeId: string, result: any): Promise<void> {
        const flow: IFlow = await DatabaseService.getInstance().getFlow(flowId);
        if (!flow) return;
        const nodeDef = flow.definition.nodes.find((n: INodeDefinition) => n.nodeId === nodeId);
        const nodeState = flow.nodeStates.find((ns: IFlowNodeState) => ns.nodeId === nodeId);
        if (nodeState && nodeDef) {
            nodeState.status = 'completed';
            nodeState.result = result;
            await this.proceedToNextNodes(flow, nodeDef, nodeState);
        }
    }

    // -------------------- MANUAL & INPUT-BASED PROGRESSION --------------------

    /**
     * Handles nodes that require manual progression.
     */
    private static async handleManualNode(flow: IFlow, nodeDef: INodeDefinition, nodeState: any): Promise<void> {
        nodeState.status = 'manual_wait';
        nodeState.logs.push('Waiting for manual progression');
        if (nodeDef.manualNextNodes?.length) {
            nodeState.availableNextNodes = nodeDef.manualNextNodes;
        }
    }

    /**
     * Progresses a manual node to its next step.
     */
    public static async progressManualNode(tenantId: string, flowId: string, nodeId: string, selectedNextNode: string, userInput?: any): Promise<void> {
        const flow: IFlow = await DatabaseService.getInstance().getFlow(tenantId, flowId);
        if (!flow) return;
        const nodeState = flow.nodeStates.find((ns: IFlowNodeState) => ns.nodeId === nodeId);
        const nodeDef = flow.definition.nodes.find((n: INodeDefinition) => n.nodeId === nodeId);
        if (!nodeState || !nodeDef) return;
        if (!nodeDef.manualNextNodes?.includes(selectedNextNode)) {
            throw new Error(`Invalid next node selection: ${selectedNextNode}`);
        }
        if (userInput) {
            // Update both persistent context and the in-memory working state.
            await this.updateFlowContext(tenantId, flowId, { [`${nodeId}_input`]: userInput });
            flow.workingState = flow.workingState || {};
            flow.workingState[`${nodeId}_input`] = userInput;
        }
        nodeState.status = 'completed';
        nodeState.selectedNext = selectedNextNode;
        await DatabaseService.getInstance().saveFlow(flow);
        await this.executeNode(flow, selectedNextNode);
    }

    /**
     * Handles nodes waiting for user input.
     */
    private static async handleWaitForInputNode(flow: IFlow, nodeDef: INodeDefinition, nodeState: any): Promise<void> {
        nodeState.status = 'waiting';
        nodeState.logs.push('Waiting for user input');
        if (nodeDef.input?.requirements) {
            nodeState.inputRequirements = nodeDef.input.requirements;
        }
    }

    /**
     * Resumes a node waiting for user input.
     */
    public static async resumeWithInput(tenantId: string, flowId: string, nodeId: string, userInput: any): Promise<void> {
        const flow: IFlow = await DatabaseService.getInstance().getFlow(tenantId, flowId);
        if (!flow) return;
        const nodeState = flow.nodeStates.find((ns: IFlowNodeState) => ns.nodeId === nodeId);
        const nodeDef = flow.definition.nodes.find((n: INodeDefinition) => n.nodeId === nodeId);
        if (!nodeState || !nodeDef) return;
        await this.updateFlowContext(tenantId, flowId, { [`${nodeId}_input`]: userInput });
        flow.workingState = flow.workingState || {};
        flow.workingState[`${nodeId}_input`] = userInput;
        await this.handleAutoNode(flow, nodeDef, nodeState);
    }

    /**
     * Automatic node execution – runs node logic and handles branching using the working state.
     */
    private static async handleAutoNode(flow: IFlow, nodeDef: INodeDefinition, nodeState: any): Promise<void> {
        nodeState.status = 'running';
        // Use the in-memory working state for execution.
        const workingState = flow.workingState || {};
        const result = await this.executeNodeLogic(nodeDef, workingState);
        // Merge result into the working state.
        workingState[`${nodeDef.nodeId}_result`] = result;
        await this.updateFlowContext(flow.tenantId, flow.flowId, { [`${nodeDef.nodeId}_result`]: result });
        const nextNodes = await this.handleBranching(flow, nodeDef, nodeState, workingState);
        nodeState.status = 'completed';
        nodeState.result = result;
        for (const nextNodeId of nextNodes) {
            await this.executeNode(flow, nextNodeId, result);
        }
    }

    /**
     * Evaluates branch conditions using the working state and returns the list of next nodes.
     */
    private static async handleBranching(flow: IFlow, nodeDef: INodeDefinition, nodeState: any, workingState: any): Promise<string[]> {
        const nextNodes: string[] = [];
        if (!nodeDef.branches || nodeDef.branches.length === 0) {
            return nodeDef.manualNextNodes || [];
        }
        for (const branch of nodeDef.branches) {
            try {
                let conditionMet = false;
                if (branch.evaluator) {
                    conditionMet = branch.evaluator(workingState);
                } else {
                    const evalFn = new Function('context', `"use strict"; try { return (${branch.condition}); } catch (e) { return false; }`);
                    conditionMet = evalFn(workingState);
                }
                if (conditionMet) {
                    nextNodes.push(branch.targetNodeId);
                    nodeState.logs.push(`Branch condition met: ${branch.condition} -> ${branch.targetNodeId}`);
                }
            } catch (error) {
                logger.error('Branch evaluation error', { error, branch });
            }
        }
        return nextNodes;
    }

    // -------------------- NODE JUMPING --------------------

    /**
     * Jumps to a specific node in the flow (for recovery or manual override).
     */
    public static async jumpToNode(tenantId: string, flowId: string, targetNodeId: string, context?: any): Promise<void> {
        const flow: IFlow = await DatabaseService.getInstance().getFlow(tenantId, flowId);
        if (!flow) throw new Error(`Flow not found: ${flowId}`);
        const targetNode = flow.definition.nodes.find((n: INodeDefinition) => n.nodeId === targetNodeId);
        if (!targetNode) throw new Error(`Target node not found: ${targetNodeId}`);
        if (context) {
            await this.updateFlowContext(tenantId, flowId, context);
            flow.workingState = { ...flow.workingState, ...context };
        }
        flow.nodeStates.forEach((ns: IFlowNodeState) => {
            if (ns.status === 'running') {
                ns.status = 'completed';
                ns.logs.push(`Jumped to node: ${targetNodeId}`);
            }
        });
        let targetState = flow.nodeStates.find((ns: IFlowNodeState) => ns.nodeId === targetNodeId);
        if (!targetState) {
            targetState = { nodeId: targetNodeId, status: 'pending', logs: [] };
            flow.nodeStates.push(targetState);
        }
        await DatabaseService.getInstance().saveFlow(flow);
    }

    /**
 * runNode: decides if we do inline Node logic or enqueue a Python job, 
 * or if it's a node that "waits for HTTP," etc. 
 */
    public static async runNode(
        tenantId: string,
        flowId: string,
        nodeState: IFlowNodeState,
        nodeDef: any
    ): Promise<any> {
        const { nodeId, input } = nodeDef;

        const nodePlugin = await getPlugin(nodeId);
        if (!nodePlugin) {
            throw new Error(`Node plugin not found: ${nodeId}`);
        }

        if (nodePlugin.waitForTrigger) {
            // This node won't proceed until an external call triggers "resumeWaitingNode()"
            nodeState.status = 'waiting';
            nodeState.logs.push(`[${new Date().toISOString()}] Node is waiting for external HTTP/event`);
            // We do NOT call executeNextPendingNode yet, we pause here
            return 'wait'
        }

        if (nodePlugin.runner === 'node') {
            // Inline logic (like your handleNodeJob) 
            // we do it directly or we can queue it to Bull if you prefer.
            // For demonstration, let's do it inline:
            nodeState.logs.push(`[${new Date().toISOString()}] Running inline Node logic`);
            // await this.runInlineNodeLogic(tenantId, flowId, nodeState, nodeDef);
            // Once done, node is completed, we proceed

        } else if (nodePlugin.runner === 'python') {
            // We push to pythonQueue and let python do the job
            nodeState.logs.push(`[${new Date().toISOString()}] Enqueueing Python job: ${nodeId}`);
            // await this.enqueuePythonTask(tenantId, flowId, nodeDef);
            return 'wait'
            // We do NOT mark completed here, because we wait for Python to call
            // "FlowEngine.completeNode()" or "failNode()" once it's done.
        } else {
            throw new Error(`Unknown runner: ${nodePlugin.runner}`);
        }
        return 'next';
    }

    /**
    * failNode: used if the Node/Python job wants to indicate an error.
    */
    public static async failNode(
        tenantId: string,
        flowId: string,
        nodeId: string,
        errorMsg: string
    ): Promise<void> {
        const flow: IFlow = await DatabaseService.getInstance().getFlow(tenantId, flowId);
        if (!flow) return;

        const nodeState = flow.nodeStates.find(ns => ns.nodeId === nodeId);
        if (!nodeState) return;

        nodeState.status = 'failed';
        nodeState.logs.push(`[${new Date().toISOString()}] Node failed: ${errorMsg}`);
        nodeState.finishedAt = new Date();

        flow.overallStatus = 'failed';
        await DatabaseService.getInstance().saveFlow(flow);
    }

}
