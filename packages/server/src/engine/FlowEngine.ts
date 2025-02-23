// src/FlowEngine.ts

import { IFlow, IFlowContext, INodeDefinition, IFlowNodeState } from './FlowInterfaces.js';
import { ConfigService } from './ConfigService.js';
import { RedisService } from './RedisService.js';
import { NodeExecutorService } from './NodeExecutorService.js';
import { MetricsService } from './MetricsService.js';
import { FlowExecutionError, FlowNotFoundError, NodeNotFoundError } from './FlowErrors.js';
import { DatabaseService } from '../services/DatabaseService.js';
import { logger } from '@mintflow/common';

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

    public async runNode(tenantId: string, flowId: string, nodeState: IFlowNodeState, nodeDef: any): Promise<any> {
        // Implement the logic for running a node
        // This is a placeholder implementation
        return { success: true };
    }

    /**
    * Jumps to a specific node in the flow, preserving existing state
    */
    public async jumpToNode(
        tenantId: string,
        flowId: string,
        targetNodeId: string,
        context?: Record<string, any>
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

        try {
            // Update working state with new context if provided
            if (context) {
                flow.workingState = { ...flow.workingState || {}, ...context };
                await this.redis.setFlowContext(
                    `${tenantId}:${flowId}`,
                    context,
                    this.config.redis.timeout
                );
            }

            // Mark any running nodes as completed with jump notification
            flow.nodeStates.forEach((ns: IFlowNodeState) => {
                if (ns.status === 'running' || ns.status === 'waiting') {
                    ns.status = 'completed';
                    ns.finishedAt = new Date();
                    ns.logs.push(`Flow jumped to node: ${targetNodeId} at ${new Date().toISOString()}`);
                }
            });

            // Initialize or reset target node state
            let targetState = flow.nodeStates.find(ns => ns.nodeId === targetNodeId);
            if (!targetState) {
                targetState = {
                    nodeId: targetNodeId,
                    status: 'pending',
                    logs: [],
                    startedAt: new Date()
                };
                flow.nodeStates.push(targetState);
            } else {
                targetState.status = 'pending';
                targetState.startedAt = new Date();
                targetState.finishedAt = undefined;
                targetState.error = undefined;
                targetState.logs.push(`Node restarted by jump operation at ${new Date().toISOString()}`);
            }

            // Save flow state before execution
            await DatabaseService.getInstance().saveFlow(flow);

            // Execute the target node
            await this.nodeExecutor.executeNode(flow, targetNodeId);

            logger.info('Successfully jumped to node', {
                tenantId,
                flowId,
                targetNodeId,
                timestamp: new Date().toISOString()
            });

        } catch (error: any) {
            logger.error('Error during node jump', {
                tenantId,
                flowId,
                targetNodeId,
                error: error.message
            });
            throw new FlowExecutionError(targetNodeId, flowId, `Jump failed: ${error.message}`);
        }
    }

    /**
     * Completes a node with the provided result
     */
    public async completeNode(
        tenantId: string,
        flowId: string,
        nodeId: string,
        result?: any
    ): Promise<void> {
        const flow: IFlow = await DatabaseService.getInstance().getFlow(tenantId, flowId);
        if (!flow) {
            throw new FlowNotFoundError(flowId);
        }

        const nodeState = flow.nodeStates.find(ns => ns.nodeId === nodeId);
        const nodeDef = flow.definition.nodes.find((n: any) => n.nodeId === nodeId);

        if (!nodeState || !nodeDef) {
            throw new NodeNotFoundError(nodeId);
        }

        try {
            // Update node state
            nodeState.status = 'completed';
            nodeState.result = result;
            nodeState.finishedAt = new Date();
            nodeState.logs.push(`Node completed successfully at ${new Date().toISOString()}`);

            // Update working state and context
            flow.workingState = flow.workingState || {};
            flow.workingState[`${nodeId}_result`] = result;

            await this.redis.setFlowContext(
                `${tenantId}:${flowId}`,
                { [`${nodeId}_result`]: result }
            );

            // Save flow state
            await DatabaseService.getInstance().saveFlow(flow);

            // Proceed to next nodes if any
            if (nodeDef.nextNodes?.length) {
                for (const nextNodeId of nodeDef.nextNodes) {
                    await this.nodeExecutor.executeNode(flow, nextNodeId);
                }
            }

            logger.info('Node completed successfully', {
                tenantId,
                flowId,
                nodeId,
                timestamp: new Date().toISOString()
            });

        } catch (error: any) {
            logger.error('Error completing node', {
                tenantId,
                flowId,
                nodeId,
                error: error.message
            });
            throw new FlowExecutionError(nodeId, flowId, `Completion failed: ${error.message}`);
        }
    }

    /**
     * Marks a node as failed with the provided error message
     */
    public async failNode(
        tenantId: string,
        flowId: string,
        nodeId: string,
        errorMsg: string
    ): Promise<void> {
        const flow: IFlow = await DatabaseService.getInstance().getFlow(tenantId, flowId);
        if (!flow) {
            throw new FlowNotFoundError(flowId);
        }

        const nodeState = flow.nodeStates.find(ns => ns.nodeId === nodeId);
        if (!nodeState) {
            throw new NodeNotFoundError(nodeId);
        }

        try {
            // Update node state
            nodeState.status = 'failed';
            nodeState.error = errorMsg;
            nodeState.finishedAt = new Date();
            nodeState.logs.push(`Node failed at ${new Date().toISOString()}: ${errorMsg}`);

            // Update flow status
            flow.overallStatus = 'failed';
            if (!flow.logs) flow.logs = [];
            flow.logs.push(`Flow failed at node ${nodeId}: ${errorMsg}`);

            // Track metric
            this.metrics.recordNodeFailure(nodeId);

            // Save flow state
            await DatabaseService.getInstance().saveFlow(flow);

            logger.error('Node execution failed', {
                tenantId,
                flowId,
                nodeId,
                error: errorMsg,
                timestamp: new Date().toISOString()
            });

        } catch (error: any) {
            logger.error('Error marking node as failed', {
                tenantId,
                flowId,
                nodeId,
                originalError: errorMsg,
                newError: error.message
            });
            throw new FlowExecutionError(nodeId, flowId, `Failed to mark node as failed: ${error.message}`);
        }
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