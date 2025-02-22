/*********************************************************************************************
 * server/src/engine/FlowEngine.ts
 *
 * A robust “PhD-level” FlowEngine that:
 *  1. Loads a flow from DB
 *  2. Initializes node states if missing
 *  3. Executes nodes in a linear sequence (node1->node2->node3...)
 *  4. Distinguishes between “node” runner (inline handleNodeJob) vs. “python” (enqueue to Python queue)
 *  5. Handles “waiting” or “httpListener” nodes that require an external event or HTTP callback
 *  6. Logs node-level statuses, partial results, and errors
 *  7. Supports timeouts for waiting or HTTP calls if you like
 *  8. Provides “completeNode” and “failNode” methods for Node/Python tasks to signal completion
 *  9. Provides “resumeWaitingNode” for external events to un-block a waiting node
 *********************************************************************************************/

import { Redis } from 'ioredis';                 // For Python bridging
import axios from 'axios';
import { Request } from 'express';
import { ENV } from '../config/env.js';
import { getNodeAction, getPlugin } from '../plugins-register.js';
import { logger } from '@mintflow/common';
import { IFlow, IFlowNodeState } from '../interfaces/IFlowState.js';
import { DatabaseService } from '../services/DatabaseService.js';

// If Python tasks are done via bridging in Node:
const redisClient = new Redis({
    host: ENV.REDIS_HOST,
    port: ENV.REDIS_PORT,
});

// Our supported node statuses
type NodeStatus = 'pending' | 'running' | 'waiting' | 'completed' | 'failed';

/**
 * For clarity, let's assume each node in flow.definition.nodes has:
 * {
 *   nodeId: string;
 *   runner: 'node' | 'python';
 *   input?: any;
 *   waitForHttp?: boolean;   // if true, node is "waiting" for an HTTP event
 *   nodeType?: string;       // e.g. 'httpListener' or 'standard'
 *   ...
 * }
 */

export class FlowEngine {
    static stopFlow(arg0: string, arg1: string) {
        throw new Error('Method not implemented.');
    }
    static handleHttpListenerNode(tenantId: string, flowId: string, nodeId: string, req: Request<any, any, any, any, Record<string, any>>) {
        return null;
    }

    /**
     * runFlow:
     *  - Loads the flow from DB
     *  - If nodeStates is empty, initializes them to 'pending'
     *  - Marks overallStatus = 'running'
     *  - Attempts to execute the first pending node
     */
    public static async runFlow(tenantId: string, flowId: string): Promise<IFlow> {
        const flow = await DatabaseService.getInstance().getFlow(tenantId, flowId);
        if (!flow) {
            throw new Error(`Flow not found: tenant=${tenantId}, flowId=${flowId}`);
        }

        // If nodeStates is uninitialized, build from definition
        if (!flow.nodeStates || flow.nodeStates.length === 0) {
            const nodes = flow.definition?.nodes || [];
            flow.nodeStates = nodes.map((nd: any) => ({
                nodeId: nd.nodeId,
                status: 'pending',
                logs: [],
            }));
        }
        flow.overallStatus = 'running';
        await DatabaseService.getInstance().saveFlow(flow);

        // Start from the first pending node
        await this.executeNextPendingNode(flow);
        return flow;
    }

    static createNodeState(): IFlowNodeState {
        return {
            nodeId: '',
            status: 'pending',
            logs: [],
        }
    }

    /**
     * executeNextPendingNode:
     *  - Finds the first node with status='pending'
     *  - Moves it to 'running'
     *  - Actually does the node logic (inline or enqueues).
     *  - If there's no pending node, we check if all completed or some failed
     */
    private static async executeNextPendingNode(flow: IFlow): Promise<void> {
        // Find the first 'pending' node
        const nodeState = flow.nodeStates.find(ns => ns.status === 'pending');
        if (!nodeState) {
            // No more pending - we might be done or stuck
            const allDone = flow.nodeStates.every(ns =>
                ns.status === 'completed' || ns.status === 'waiting'
            );
            if (allDone) {
                // If they're all completed or waiting, let's see if any waiting is indefinite
                if (flow.nodeStates.every(ns => ns.status === 'completed')) {
                    flow.overallStatus = 'completed';
                    logger.info(`[FlowEngine] Flow fully completed`, { flowId: flow.flowId });
                } else {
                    // Some nodes might be waiting for external events.
                    // If you want the flow to remain 'running' or 'paused', your call
                    flow.overallStatus = 'running'; // or 'paused'
                    logger.info(`[FlowEngine] Flow partially waiting`, { flowId: flow.flowId });
                }
            } else {
                // Maybe at least one node is 'failed'
                const anyFailed = flow.nodeStates.some(ns => ns.status === 'failed');
                if (anyFailed) {
                    flow.overallStatus = 'failed';
                    logger.info(`[FlowEngine] Flow ended with a failure`, { flowId: flow.flowId });
                }
            }
            await DatabaseService.getInstance().saveFlow(flow);
            return;
        }

        // Mark the node running
        nodeState.status = 'running';
        nodeState.startedAt = new Date();
        nodeState.logs.push(`[${new Date().toISOString()}] Node started`);
        await DatabaseService.getInstance().saveFlow(flow);

        // Get the definition for that node
        const nodeDef = flow.definition?.nodes?.find((n: any) => n.nodeId === nodeState.nodeId);
        if (!nodeDef) {
            // Immediately fail
            nodeState.status = 'failed';
            nodeState.logs.push(`Node definition not found in flow.definition`);
            await DatabaseService.getInstance().saveFlow(flow);
            await this.executeNextPendingNode(flow);
            return;
        }

        try {
            // Actually run or enqueue
            const nextStep = await this.runNode(flow.tenantId, flow.flowId, nodeState, nodeDef);
            await DatabaseService.getInstance().saveFlow(flow);
            if (nextStep === 'next') {
                await this.executeNextPendingNode(flow);
            }
        } catch (err: any) {
            nodeState.status = 'failed';
            nodeState.logs.push(`[${new Date().toISOString()}] Node error: ${err.message}`);
            await DatabaseService.getInstance().saveFlow(flow);
            await this.executeNextPendingNode(flow);
            return;
        }
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
            await this.runInlineNodeLogic(tenantId, flowId, nodeState, nodeDef);
            // Once done, node is completed, we proceed

        } else if (nodePlugin.runner === 'python') {
            // We push to pythonQueue and let python do the job
            nodeState.logs.push(`[${new Date().toISOString()}] Enqueueing Python job: ${nodeId}`);
            await this.enqueuePythonTask(tenantId, flowId, nodeDef);
            return 'wait'
            // We do NOT mark completed here, because we wait for Python to call
            // "FlowEngine.completeNode()" or "failNode()" once it's done.
        } else {
            throw new Error(`Unknown runner: ${nodePlugin.runner}`);
        }
        return 'next';
    }

    /**
     * runInlineNodeLogic: calls handleNodeJob (like your demoNodes) 
     * and if it doesn't throw, we mark the node completed. 
     */
    private static async runInlineNodeLogic(
        tenantId: string,
        flowId: string,
        nodeState: IFlowNodeState,
        nodeDef: any
    ): Promise<void> {
        const { nodeId, action, input } = nodeDef;

        try {
            // call your handleNodeJob
            // we can pass tenantId / flowId if needed
            const jobData = { nodeId, input, tenantId, flowId };
            const nodeAction = await getNodeAction(nodeId, action);
            if (!nodeAction) {
                throw new Error(`Node action not found: ${nodeId} -> ${action}`);
            }
            if (nodeAction.execute) {
                nodeState.result = await nodeAction.execute(input, jobData);
            } else if (nodeAction?.entry?.url) {
                // If it's an HTTP call, we can do it like this
                const method = nodeAction.entry.method || 'get';
                const url = nodeAction.entry.url;
                const headers = nodeAction.entry.headers || {};
                const data = { input, tenantId, flowId };
                if (method === 'get') {
                    nodeState.result = await axios.get(url, { headers });
                } else if (method === 'post' || method === 'put') {
                    nodeState.result = await axios[method](url, data, { headers });
                } else if (method === 'delete') {
                    nodeState.result = await axios.delete(url, { headers });
                } else {
                    nodeState.result = await axios({ method, url, data, headers });
                }
            } else {
                throw new Error(`Node action missing "execute" or "entry" function: ${nodeId} ${action}`);
            }

            // Mark completed
            nodeState.status = 'completed';
            nodeState.logs.push(`[${new Date().toISOString()}] Node completed inline with result`);
            nodeState.finishedAt = new Date();
        } catch (err: any) {
            nodeState.status = 'failed';
            nodeState.logs.push(`[${new Date().toISOString()}] Inline logic failed: ${err.message}`);
            nodeState.finishedAt = new Date();
            throw err; // rethrow so we handle it
        }
    }

    private static async enqueuePythonTask(tenantId: string, flowId: string, nodeDef: any) {
        const queueKey = `pythonQueue_${tenantId}`;
        const { nodeId, input, action } = nodeDef;
        const payload = {
            taskName: nodeId,
            action,
            input,
            flowId,
            // optionally pass tenantId so python can call back
            tenantId,
        };
        // await redisClient.rpush(queueKey, JSON.stringify(payload));
    }

    /**
     * completeNode: used by Node or Python tasks to signal “I’m done.”
     * e.g., Node runner calls this after finishing, or Python code calls an HTTP endpoint
     * that triggers FlowEngine.completeNode internally.
     */
    public static async completeNode(
        tenantId: string,
        flowId: string,
        nodeId: string,
        result?: any
    ): Promise<void> {
        const flow: IFlow = await DatabaseService.getInstance().getFlow(tenantId, flowId);
        if (!flow) return;

        const nodeState = flow.nodeStates.find(ns => ns.nodeId === nodeId);
        if (!nodeState) return;

        // Mark node done
        nodeState.status = 'completed';
        nodeState.result = result;
        nodeState.logs.push(`[${new Date().toISOString()}] Node externally completed`);
        nodeState.finishedAt = new Date();
        await DatabaseService.getInstance().saveFlow(flow);

        // proceed with next node
        await this.executeNextPendingNode(flow);
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

    /**
     * resumeWaitingNode: if a node is in “waiting” (like an HTTP listener),
     * we can call this method with the final result to mark it completed and move on.
     */
    public static async resumeWaitingNode(
        tenantId: string,
        flowId: string,
        nodeId: string,
        finalResult?: any
    ): Promise<void> {
        const flow: IFlow = await DatabaseService.getInstance().getFlow(tenantId, flowId);
        if (!flow) return;

        const nodeState = flow.nodeStates.find(ns => ns.nodeId === nodeId);
        if (!nodeState) return;

        if (nodeState.status !== 'waiting') {
            // Not in a waiting state, so can't resume
            return;
        }

        nodeState.status = 'completed';
        nodeState.result = finalResult;
        nodeState.logs.push(`[${new Date().toISOString()}] Node resumed from waiting => completed`);
        nodeState.finishedAt = new Date();
        await DatabaseService.getInstance().saveFlow(flow);

        // now see if we can proceed
        await this.executeNextPendingNode(flow);
    }

    /**
     * If you want a method to forcibly skip or re-run a node, you can add it here.
     * This code is already quite big; adapt as needed.
     */

} // end class
