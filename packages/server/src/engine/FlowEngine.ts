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

// Flow context stored in Redis
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

// Unified node definition interface that includes properties from all your code versions
export interface INodeDefinition {
    nodeId: string;
    type: string;
    runner: 'node' | 'python';
    executionMode?: NodeExecutionMode; // Optional – if not set, fallback logic based on type is used.
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

// Node state (can be extended as needed)
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
}

// (Assuming IFlow is defined externally, otherwise you can define it here as needed.)
// interface IFlow {
//   flowId: string;
//   tenantId: string;
//   definition: { nodes: INodeDefinition[] };
//   nodeStates: IFlowNodeState[];
//   overallStatus: string;
//   context?: any;
// }

//
// === FLOW ENGINE CLASS ===
//

export class FlowEngine {
    // General Redis client (for waiting states, MQTT, callbacks, etc.)
    private static redis = new Redis({
        host: ENV.REDIS_HOST,
        port: ENV.REDIS_PORT,
    });

    // Separate Redis client for flow context (using a different DB)
    private static contextStore = new Redis({
        host: ENV.REDIS_HOST,
        port: ENV.REDIS_PORT,
        db: 1
    });

    // Event emitter for custom event nodes
    private static eventEmitter = new EventEmitter();

    // MQTT client for MQTT nodes
    private static mqttClient = mqtt.connect(ENV.MQTT_URL, {
        username: ENV.MQTT_USERNAME,
        password: ENV.MQTT_PASSWORD,
    });

    // -------------------- CONTEXT MANAGEMENT --------------------

    /**
     * Initializes and stores a new flow context.
     */
    private static async initFlowContext(tenantId: string, flowId: string): Promise<void> {
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
     * Retrieves the flow context.
     */
    private static async getFlowContext(tenantId: string, flowId: string): Promise<IFlowContext | null> {
        const data = await this.contextStore.get(`flow_context:${tenantId}:${flowId}`);
        return data ? JSON.parse(data) : null;
    }

    /**
     * Updates the flow context with provided updates.
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

    // -------------------- FLOW EXECUTION --------------------

    /**
     * Starts the flow by initializing context, node states, and executing the start node.
     */
    public static async runFlow(tenantId: string, flowId: string): Promise<any> {
        const flow = await DatabaseService.getInstance().getFlow(tenantId, flowId);
        if (!flow) {
            throw new Error(`Flow not found: tenant=${tenantId}, flowId=${flowId}`);
        }

        // Initialize context and node state
        await this.initFlowContext(tenantId, flowId);
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
        await DatabaseService.getInstance().saveFlow(flow);

        // Begin execution from the start node
        await this.executeNode(flow, startNode.nodeId);
        return flow;
    }

    /**
     * Executes a specific node based on its definition.
     */
    private static async executeNode(flow: any, nodeId: string): Promise<void> {
        const nodeDef = flow.definition.nodes.find((n: INodeDefinition) => n.nodeId === nodeId);
        if (!nodeDef) {
            throw new Error(`Node definition not found: ${nodeId}`);
        }

        // Ensure node state exists
        let nodeState = flow.nodeStates.find((ns: IFlowNodeState) => ns.nodeId === nodeId);
        if (!nodeState) {
            nodeState = { nodeId, status: 'pending', logs: [] };
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
    private static async proceedToNextNodes(flow: any, nodeDef: INodeDefinition, nodeState: IFlowNodeState): Promise<void> {
        if (nodeDef.nextNodes && nodeDef.nextNodes.length > 0) {
            for (const nextNodeId of nodeDef.nextNodes) {
                await this.executeNode(flow, nextNodeId);
            }
        }
    }

    // -------------------- NODE HANDLERS --------------------

    /**
     * Standard (synchronous) node execution.
     */
    private static async handleStandardNode(flow: any, nodeDef: INodeDefinition, nodeState: IFlowNodeState): Promise<void> {
        nodeState.status = 'running';
        nodeState.startedAt = new Date();
        const context = await this.getFlowContext(flow.tenantId, flow.flowId);
        try {
            const result = await this.executeNodeLogic(nodeDef, context?.data);
            nodeState.status = 'completed';
            nodeState.result = result;
            nodeState.finishedAt = new Date();
            await this.updateFlowContext(flow.tenantId, flow.flowId, {
                [`${nodeDef.nodeId}_result`]: result
            });
            await this.proceedToNextNodes(flow, nodeDef, nodeState);
        } catch (error: any) {
            nodeState.status = 'failed';
            nodeState.error = error.message;
            throw error;
        }
    }

    /**
     * Executes node logic via a registered node action.
     */
    private static async executeNodeLogic(nodeDef: INodeDefinition, contextData: Record<string, any> = {}): Promise<any> {
        const nodeAction = await getNodeAction(nodeDef.nodeId, nodeDef.type);
        if (!nodeAction?.execute) {
            throw new Error(`No execute function found for node: ${nodeDef.nodeId}`);
        }
        // Merge node input with context data
        const input = { ...nodeDef.input, context: contextData };
        return nodeAction.execute(input);
    }

    /**
     * Decision node execution – evaluates conditions and branches accordingly.
     */
    private static async handleDecisionNode(flow: any, nodeDef: INodeDefinition, nodeState: IFlowNodeState): Promise<void> {
        nodeState.status = 'running';
        const context = await this.getFlowContext(flow.tenantId, flow.flowId);
        for (const condition of nodeDef.conditions || []) {
            try {
                const result = await this.evaluateCondition(condition.condition, context?.data);
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
     * Evaluates a condition expression safely.
     */
    private static async evaluateCondition(condition: string, contextData: Record<string, any> = {}): Promise<boolean> {
        try {
            const safeEval = new Function('context', `"use strict"; return (${condition});`);
            return safeEval(contextData);
        } catch (error) {
            logger.error('Error evaluating condition', { error, condition });
            return false;
        }
    }

    /**
     * Switch node handling – alias for decision.
     */
    private static async handleSwitchNode(flow: any, nodeDef: INodeDefinition, nodeState: IFlowNodeState): Promise<void> {
        await this.handleDecisionNode(flow, nodeDef, nodeState);
    }

    /**
     * HTTP node execution – makes an HTTP request.
     */
    private static async handleHttpNode(flow: any, nodeDef: INodeDefinition, nodeState: IFlowNodeState): Promise<void> {
        if (!nodeDef.entry?.url) {
            throw new Error('HTTP node missing URL configuration');
        }
        const { url, method = 'GET', headers = {}, timeout = 30000 } = nodeDef.entry;
        try {
            const response = await axios({ method, url, headers, timeout, data: nodeDef.input });
            nodeState.result = response.data;
            nodeState.status = 'completed';
            nodeState.logs.push(`HTTP call successful: ${method} ${url}`);
            await this.updateFlowContext(flow.tenantId, flow.flowId, {
                [`${nodeDef.nodeId}_result`]: response.data
            });
            await this.proceedToNextNodes(flow, nodeDef, nodeState);
        } catch (error: any) {
            throw new Error(`HTTP call failed: ${error.message}`);
        }
    }

    /**
     * HTTP listener node – waits for an HTTP callback.
     */
    private static async handleHttpListenerNode(flow: any, nodeDef: INodeDefinition, nodeState: IFlowNodeState): Promise<void> {
        nodeState.status = 'waiting';
        nodeState.logs.push('Waiting for HTTP callback');
        const waitKey = `http_wait:${flow.tenantId}:${flow.flowId}:${nodeDef.nodeId}`;
        await this.redis.set(waitKey, 'waiting', 'EX', 86400);
    }

    /**
     * Python node execution – enqueues a Python task.
     */
    private static async handlePythonNode(flow: any, nodeDef: INodeDefinition, nodeState: IFlowNodeState): Promise<void> {
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
        const flow = await DatabaseService.getInstance().getFlow(tenantId, flowId);
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
    private static async executeMqttNode(flow: any, nodeDef: INodeDefinition, nodeState: IFlowNodeState): Promise<void> {
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
        this.mqttClient.on('message', async (topic, message) => {
            if (topic === nodeDef.mqtt.topic) {
                const waitingState = await this.redis.get(`mqtt_wait:${correlationId}`);
                if (waitingState) {
                    const { flow, nodeDef, nodeState } = JSON.parse(waitingState);
                    nodeState.status = 'completed';
                    nodeState.result = JSON.parse(message.toString());
                    await this.proceedToNextNodes(flow, nodeDef, nodeState);
                    await this.redis.del(`mqtt_wait:${correlationId}`);
                }
            }
        });
    }

    /**
     * HTTP callback node execution – stores state and returns a callback URL.
     */
    private static async executeHttpCallbackNode(flow: any, nodeDef: INodeDefinition, nodeState: IFlowNodeState): Promise<any> {
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
    private static async executeEventNode(flow: any, nodeDef: INodeDefinition, nodeState: IFlowNodeState): Promise<void> {
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
            const waitingState = await this.redis.get(`event_wait:${eventId}`);
            if (waitingState) {
                const { flow, nodeDef, nodeState } = JSON.parse(waitingState);
                nodeState.status = 'completed';
                nodeState.result = data;
                await this.proceedToNextNodes(flow, nodeDef, nodeState);
                await this.redis.del(`event_wait:${eventId}`);
            }
        });
    }

    /**
     * External node execution – enqueues a task for an external service.
     */
    private static async executeExternalNode(flow: any, nodeDef: INodeDefinition, nodeState: IFlowNodeState): Promise<void> {
        nodeState.status = 'waiting';
        await this.redis.rpush('external_tasks', JSON.stringify({
            flowId: flow.flowId,
            nodeId: nodeDef.nodeId,
            input: nodeDef.input,
            context: flow.context
        }));
    }

    /**
     * Handles external completion notifications.
     */
    public static async handleExternalCompletion(flowId: string, nodeId: string, result: any): Promise<void> {
        const flow = await DatabaseService.getInstance().getFlow(flowId);
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
    private static async handleManualNode(flow: any, nodeDef: INodeDefinition, nodeState: any): Promise<void> {
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
        const flow = await DatabaseService.getInstance().getFlow(tenantId, flowId);
        if (!flow) return;
        const nodeState = flow.nodeStates.find((ns: IFlowNodeState) => ns.nodeId === nodeId);
        const nodeDef = flow.definition.nodes.find((n: INodeDefinition) => n.nodeId === nodeId);
        if (!nodeState || !nodeDef) return;
        if (!nodeDef.manualNextNodes?.includes(selectedNextNode)) {
            throw new Error(`Invalid next node selection: ${selectedNextNode}`);
        }
        if (userInput) {
            await this.updateFlowContext(tenantId, flowId, { [`${nodeId}_input`]: userInput });
        }
        nodeState.status = 'completed';
        nodeState.selectedNext = selectedNextNode;
        await DatabaseService.getInstance().saveFlow(flow);
        await this.executeNode(flow, selectedNextNode);
    }

    /**
     * Handles nodes waiting for user input.
     */
    private static async handleWaitForInputNode(flow: any, nodeDef: INodeDefinition, nodeState: any): Promise<void> {
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
        const flow = await DatabaseService.getInstance().getFlow(tenantId, flowId);
        if (!flow) return;
        const nodeState = flow.nodeStates.find((ns: IFlowNodeState) => ns.nodeId === nodeId);
        const nodeDef = flow.definition.nodes.find((n: INodeDefinition) => n.nodeId === nodeId);
        if (!nodeState || !nodeDef) return;
        await this.updateFlowContext(tenantId, flowId, { [`${nodeId}_input`]: userInput });
        await this.handleAutoNode(flow, nodeDef, nodeState);
    }

    /**
     * Automatic node execution – runs node logic and handles branching.
     */
    private static async handleAutoNode(flow: any, nodeDef: INodeDefinition, nodeState: any): Promise<void> {
        nodeState.status = 'running';
        const context = await this.getFlowContext(flow.tenantId, flow.flowId);
        const result = await this.executeNodeLogic(nodeDef, context?.data);
        await this.updateFlowContext(flow.tenantId, flow.flowId, { [`${nodeDef.nodeId}_result`]: result });
        const nextNodes = await this.handleBranching(flow, nodeDef, nodeState, context?.data);
        nodeState.status = 'completed';
        nodeState.result = result;
        for (const nextNodeId of nextNodes) {
            await this.executeNode(flow, nextNodeId);
        }
    }

    /**
     * Evaluates branch conditions and returns the list of next nodes.
     */
    private static async handleBranching(flow: any, nodeDef: INodeDefinition, nodeState: any, context: any): Promise<string[]> {
        const nextNodes: string[] = [];
        if (!nodeDef.branches || nodeDef.branches.length === 0) {
            return nodeDef.manualNextNodes || [];
        }
        for (const branch of nodeDef.branches) {
            try {
                let conditionMet = false;
                if (branch.evaluator) {
                    conditionMet = branch.evaluator(context);
                } else {
                    const evalFn = new Function('context', `"use strict"; try { return (${branch.condition}); } catch (e) { return false; }`);
                    conditionMet = evalFn(context);
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
        const flow = await DatabaseService.getInstance().getFlow(tenantId, flowId);
        if (!flow) throw new Error(`Flow not found: ${flowId}`);
        const targetNode = flow.definition.nodes.find((n: INodeDefinition) => n.nodeId === targetNodeId);
        if (!targetNode) throw new Error(`Target node not found: ${targetNodeId}`);
        if (context) {
            await this.updateFlowContext(tenantId, flowId, context);
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
        await this.executeNode(flow, targetNodeId);
    }
}
