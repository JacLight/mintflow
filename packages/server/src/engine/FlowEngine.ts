// src/FlowEngine.ts

import { IFlow, IFlowContext, INodeDefinition, IFlowNodeState } from './FlowInterfaces.js';
import { ConfigService } from './ConfigService.js';
import { RedisService } from './RedisService.js';
import { NodeExecutorService } from './NodeExecutorService.js';
import { MetricsService } from './MetricsService.js';
import { FlowNotFoundError, NodeNotFoundError } from './FlowErrors.js';
import { DatabaseService } from '../services/DatabaseService.js';

export class FlowEngine {
    private static instance: FlowEngine;
    private redis = RedisService.getInstance();
    private nodeExecutor = NodeExecutorService.getInstance();
    private metrics = MetricsService.getInstance();
    private config = ConfigService.getInstance().getConfig();

    private constructor() { }

    static getInstance(): FlowEngine {
        if (!FlowEngine.instance) {
            FlowEngine.instance = new FlowEngine();
        }
        return FlowEngine.instance;
    }

    static createNodeState(): IFlowNodeState {
        return {
            nodeId: '',
            status: 'pending',
            logs: [],
        }
    }

    /**
     * Initializes and starts a new flow execution
     */
    public async runFlow(tenantId: string, flowId: string): Promise<IFlow> {
        const flow: IFlow = await DatabaseService.getInstance().getFlow(tenantId, flowId);
        if (!flow) {
            throw new FlowNotFoundError(flowId);
        }

        // Initialize flow context
        await this.initFlowContext(tenantId, flowId);

        // Find start node
        const startNode = flow.definition.nodes.find(
            (n: INodeDefinition) => n.type === 'start'
        );
        if (!startNode) {
            throw new Error('No start node found in flow definition');
        }

        // Initialize node states
        flow.nodeStates = [{
            nodeId: startNode.nodeId,
            status: 'pending',
            logs: []
        }];
        flow.overallStatus = 'running';
        flow.workingState = {};

        // Save initial state
        await DatabaseService.getInstance().saveFlow(flow);

        // Start metrics tracking
        this.metrics.recordFlowStart();

        // Start execution from the start node
        try {
            await this.nodeExecutor.executeNode(flow, startNode.nodeId);
        } catch (error) {
            flow.overallStatus = 'failed';
            await DatabaseService.getInstance().saveFlow(flow);
            throw error;
        }

        return flow;
    }

    /**
     * Initializes the persistent flow context
     */
    private async initFlowContext(tenantId: string, flowId: string): Promise<void> {
        const context: IFlowContext = {
            flowId,
            tenantId,
            data: {},
            startedAt: new Date(),
            lastUpdatedAt: new Date()
        };

        await this.redis.setFlowContext(
            `${tenantId}:${flowId}`,
            context,
            this.config.redis.timeout
        );
    }

    /**
     * Jumps to a specific node in the flow (for recovery or manual override)
     */
    public async jumpToNode(
        tenantId: string,
        flowId: string,
        targetNodeId: string,
        context?: any
    ): Promise<void> {
        const flow: IFlow = await DatabaseService.getInstance().getFlow(tenantId, flowId);
        if (!flow) {
            throw new FlowNotFoundError(flowId);
        }

        const targetNode = flow.definition.nodes.find(
            (n: INodeDefinition) => n.nodeId === targetNodeId
        );
        if (!targetNode) {
            throw new NodeNotFoundError(targetNodeId);
        }

        // Update context if provided
        if (context) {
            flow.workingState = { ...flow.workingState, ...context };
            await this.redis.setFlowContext(`${tenantId}:${flowId}`, context);
        }

        // Mark any running nodes as completed
        flow.nodeStates.forEach((ns: IFlowNodeState) => {
            if (ns.status === 'running') {
                ns.status = 'completed';
                ns.logs.push(`Jumped to node: ${targetNodeId}`);
            }
        });

        // Initialize target node state if not exists
        let targetState = flow.nodeStates.find(ns => ns.nodeId === targetNodeId);
        if (!targetState) {
            targetState = {
                nodeId: targetNodeId,
                status: 'pending',
                logs: []
            };
            flow.nodeStates.push(targetState);
        }

        // Save flow state and execute target node
        await DatabaseService.getInstance().saveFlow(flow);
        await this.nodeExecutor.executeNode(flow, targetNodeId);
    }

    /**
     * Handles HTTP callback for nodes waiting on HTTP response
     */
    public async handleHttpCallback(
        tenantId: string,
        flowId: string,
        nodeId: string,
        callbackData: any
    ): Promise<void> {
        const flow: IFlow = await DatabaseService.getInstance().getFlow(tenantId, flowId);
        if (!flow) {
            throw new FlowNotFoundError(flowId);
        }

        const nodeState = flow.nodeStates.find(ns => ns.nodeId === nodeId);
        const nodeDef = flow.definition.nodes.find(
            (n: INodeDefinition) => n.nodeId === nodeId
        );

        if (!nodeState || !nodeDef) {
            throw new NodeNotFoundError(nodeId);
        }

        await this.nodeExecutor.resumeWithInput(flow, nodeId, callbackData);
    }

    /**
     * Progresses a manual node to its next step
     */
    public async progressManualNode(
        tenantId: string,
        flowId: string,
        nodeId: string,
        selectedNextNode: string,
        userInput?: any
    ): Promise<void> {
        const flow: IFlow = await DatabaseService.getInstance().getFlow(tenantId, flowId);
        if (!flow) {
            throw new FlowNotFoundError(flowId);
        }

        await this.nodeExecutor.progressManualNode(
            flow,
            nodeId,
            selectedNextNode,
            userInput
        );
    }

    /**
     * Completes an external node execution
     */
    public async completeExternalNode(
        tenantId: string,
        flowId: string,
        nodeId: string,
        result: any
    ): Promise<void> {
        const flow: IFlow = await DatabaseService.getInstance().getFlow(tenantId, flowId);
        if (!flow) {
            throw new FlowNotFoundError(flowId);
        }

        const nodeState = flow.nodeStates.find(ns => ns.nodeId === nodeId);
        const nodeDef = flow.definition.nodes.find(
            (n: INodeDefinition) => n.nodeId === nodeId
        );

        if (!nodeState || !nodeDef) {
            throw new NodeNotFoundError(nodeId);
        }

        nodeState.status = 'completed';
        nodeState.result = result;
        nodeState.finishedAt = new Date();

        flow.workingState = flow.workingState || {};
        flow.workingState[`${nodeId}_result`] = result;

        await this.redis.setFlowContext(
            `${tenantId}:${flowId}`,
            { [`${nodeId}_result`]: result }
        );

        await DatabaseService.getInstance().saveFlow(flow);
        await this.nodeExecutor.executeNode(flow, nodeId);
    }

    /**
  * failNode: used if the Node/Python job wants to indicate an error.
  */
    public async failNode(
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

    public async runNode(tenantId: string, flowId: string, nodeState: IFlowNodeState, nodeDef: any): Promise<any> {
        // Implement the logic for running a node
        // This is a placeholder implementation
        return { success: true };
    }


    /**
     * Retrieves metrics for the flow engine
     */
    public getMetrics(): any {
        return this.metrics.getMetrics();
    }

    /**
     * Cleanup and shutdown
     */
    public async cleanup(): Promise<void> {
        await Promise.all([
            this.redis.cleanup(),
            this.nodeExecutor.cleanup()
        ]);
    }
}