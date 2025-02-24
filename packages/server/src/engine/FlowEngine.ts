// src/FlowEngine.ts

import { IFlow, IFlowContext, INodeDefinition, IFlowNodeState, IFlowRun } from './FlowInterfaces.js';
import { ConfigService } from './ConfigService.js';
import { RedisService } from './RedisService.js';
import { NodeExecutorService } from './NodeExecutorService.js';
import { MetricsService } from './MetricsService.js';
import { FlowExecutionError, FlowNotFoundError, FlowRunNotFoundError, NodeNotFoundError } from './FlowErrors.js';
import { logger } from '@mintflow/common';
import { FlowRunService } from '../services/FlowRunService.js';
import { FlowService } from '../services/FlowService.js';

export class FlowEngine {
    private static instance: FlowEngine;
    private redis = RedisService.getInstance();
    private nodeExecutor = NodeExecutorService.getInstance();
    private metrics = MetricsService.getInstance();
    private config = ConfigService.getInstance().getConfig();
    private flowRunService = FlowRunService.getInstance();
    private flowService = FlowService.getInstance();

    private constructor() { }

    static getInstance(): FlowEngine {
        if (!FlowEngine.instance) {
            FlowEngine.instance = new FlowEngine();
        }
        return FlowEngine.instance;
    }

    /**
     * Initializes and starts a new flow execution
     */
    public async runFlow(tenantId: string, flowId: string): Promise<IFlowRun> {
        const flow: IFlow = await this.flowService.getFlow(tenantId, flowId);
        if (!flow) {
            throw new FlowNotFoundError(flowId);
        }

        // Check if flow is in draft state
        if (flow.overallStatus === 'draft') {
            throw new Error(`Cannot run flow ${flowId} - flow is in draft state`);
        }

        // Clean up any stale runs first
        await this.flowRunService.cleanupStaleRuns(flowId);

        // Check for existing active run in DB
        const activeRun = await this.flowRunService.getActiveFlowRun(flowId);
        if (activeRun) {
            logger.info(`Flow ${flowId} already has active run: ${activeRun.flowRunId}`);
            // Set the Redis key to match DB state
            await this.redis.setFlowRunning(tenantId, flowId, activeRun.flowRunId);
            return activeRun;
        }

        // Initialize flow context
        const flowRun = await FlowRunService.getInstance().startFlowRun({
            flowId: flow.flowId,
            tenantId: flow.tenantId,
            status: 'running',
            startedAt: new Date(),
            nodeStates: [],
            workingData: {}
        });

        // const runningFlowRunId = await this.redis.getRunningFlowRun(tenantId, flowId, "");
        // if (runningFlowRunId) {
        //     // Check if the flow run still exists and is actually running
        //     try {
        //         const runningFlow = await FlowRunService.getInstance().getFlowRunById(runningFlowRunId);
        //         if (runningFlow && runningFlow.status === 'running') {
        //             logger.info(`Flow ${flowId} is already running with run ID ${runningFlowRunId}`);
        //             return flow; // Return existing flow without starting new run
        //         }
        //     } catch (error) {
        //         // Flow run not found or error - clean up the running flag
        //         await this.redis.removeRunningFlow(tenantId, flowId, "");
        //     }
        // }

        // Try to mark flow as running
        const setRunning = await this.redis.setFlowRunning(tenantId, flowId, flowRun.flowRunId);
        if (!setRunning) {
            // Double-check DB one more time in case of race condition
            const raceCheckRun = await this.flowRunService.getActiveFlowRun(flowId);
            if (raceCheckRun) {
                await this.flowRunService.updateFlowRunStatus(flowRun.flowRunId, 'cancelled');
                logger.info(`Flow ${flowId} was started by another instance`);
                return flowRun;
            }
        }


        try {
            // Each run gets its own context/working state
            await this.initFlowRunContext(tenantId, flowId, flowRun.flowRunId);

            // Find start node
            const startNode = flow.definition.nodes.find(
                (n: INodeDefinition) => n.type === 'start'
            );
            if (!startNode) {
                throw new Error('No start node found in flow definition');
            }

            // Initialize node states
            flowRun.nodeStates = [{
                nodeId: startNode.nodeId,
                plugin: startNode.plugin,
                status: 'pending',
                logs: []
            }];
            flowRun.workingData = {};
            await this.flowRunService.saveFlowRun(flowRun);

            // Save initial state
            flow.overallStatus = 'running';
            await this.flowService.saveFlow(flow);

            // Start metrics tracking
            this.metrics.recordFlowStart();
            // Start execution from the start node
            await this.nodeExecutor.executeNode(flow, flowRun, startNode.nodeId);
            await this.flowRunService.completeFlowRun(flowRun.flowRunId, this.getOverallNodeStatus(flowRun.nodeStates));
            return this.flowRunService.getFlowRunById(flowRun.flowRunId);
        } catch (error: any) {
            flow.overallStatus = 'failed';
            await FlowService.getInstance().saveFlow(flow);
            await this.flowRunService.completeFlowRun(flowRun.flowRunId, 'failed', error.message);
            throw error;
        } finally {
            await this.redis.removeRunningFlow(tenantId, flowId, flowRun.flowRunId);
        }
    }

    private getOverallNodeStatus(nodeStates: IFlowNodeState[]): string {
        let overallStatus = 'completed';
        for (const ns of nodeStates) {
            if (ns.status !== 'completed') {
                overallStatus = 'running';
            }
        }
        return overallStatus;
    }

    /**
     * Initializes the persistent flow context
     */
    private async initFlowRunContext(tenantId: string, flowId: string, flowRunId: string): Promise<void> {
        const context: IFlowContext = {
            flowId,
            tenantId,
            flowRunId,  // Add flowRunId to context
            data: {},
            startedAt: new Date(),
            lastUpdatedAt: new Date()
        };

        // Use run-specific key
        await this.redis.setFlowContext(
            `${tenantId}:${flowId}:${flowRunId}`,
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
        flowRunId: string,
        nodeId: string,
        callbackData: any
    ): Promise<void> {
        const flow: IFlow = await FlowService.getInstance().getFlow(tenantId, flowId);
        if (!flow) {
            throw new FlowNotFoundError(flowId);
        }

        const flowRun = await this.flowRunService.getFlowRunById(flowRunId);
        if (!flowRun) {
            throw new FlowRunNotFoundError(flowRunId);
        }

        const nodeState = flowRun.nodeStates.find(ns => ns.nodeId === nodeId);
        const nodeDef = flow.definition.nodes.find(
            (n: INodeDefinition) => n.nodeId === nodeId
        );

        if (!nodeState || !nodeDef) {
            throw new NodeNotFoundError(nodeId);
        }

        await this.nodeExecutor.resumeWithInput(flow, flowRun, nodeId, callbackData);
    }

    /**
     * Progresses a manual node to its next step
     */
    public async progressManualNode(
        tenantId: string,
        flowId: string,
        flowRunId: string,
        nodeId: string,
        selectedNextNode: string,
        userInput?: any
    ): Promise<void> {
        const flow: IFlow = await FlowService.getInstance().getFlow(tenantId, flowId);
        if (!flow) {
            throw new FlowNotFoundError(flowId);
        }

        const flowRun = await this.flowRunService.getFlowRunById(flowRunId);
        if (!flowRun) {
            throw new FlowRunNotFoundError(flowRunId);
        }

        await this.nodeExecutor.progressManualNode(
            flow,
            flowRun,
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
        flowRunId: string,
        nodeId: string,
        result: any
    ): Promise<void> {
        const flow: IFlow = await FlowService.getInstance().getFlow(tenantId, flowId);
        if (!flow) {
            throw new FlowNotFoundError(flowId);
        }

        const flowRun = await this.flowRunService.getFlowRunById(flowRunId);
        if (!flowRun) {
            throw new FlowRunNotFoundError(flowRunId);
        }

        const nodeState = flowRun.nodeStates.find(ns => ns.nodeId === nodeId);
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

        await FlowService.getInstance().saveFlow(flow);
        await this.nodeExecutor.executeNode(flow, flowRun, nodeId);
    }

    /**
    * Jumps to a specific node in the flow, preserving existing state
    */
    public async jumpToNode(
        tenantId: string,
        flowId: string,
        flowRunId: string,
        targetNodeId: string,
        context?: Record<string, any>
    ): Promise<void> {
        const flow: IFlow = await FlowService.getInstance().getFlow(tenantId, flowId);
        if (!flow) {
            throw new FlowNotFoundError(flowId);
        }

        const flowRun = await this.flowRunService.getFlowRunById(flowRunId);
        if (!flowRun) {
            throw new FlowRunNotFoundError(flowRunId);
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
            flowRun.nodeStates.forEach((ns: IFlowNodeState) => {
                if (ns.status === 'running' || ns.status === 'waiting') {
                    ns.status = 'completed';
                    ns.finishedAt = new Date();
                    ns.logs.push(`Flow jumped to node: ${targetNodeId} at ${new Date().toISOString()}`);
                }
            });

            // Initialize or reset target node state
            let targetState = flowRun.nodeStates.find(ns => ns.nodeId === targetNodeId);
            if (!targetState) {
                targetState = {
                    nodeId: targetNodeId,
                    status: 'pending',
                    logs: [],
                    startedAt: new Date()
                };
                flowRun.nodeStates.push(targetState);
            } else {
                targetState.status = 'pending';
                targetState.startedAt = new Date();
                targetState.finishedAt = undefined;
                targetState.error = undefined;
                targetState.logs.push(`Node restarted by jump operation at ${new Date().toISOString()}`);
            }

            // Save flow state before execution
            await FlowService.getInstance().saveFlow(flow);

            // Execute the target node
            await this.nodeExecutor.executeNode(flow, flowRun, targetNodeId);

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
            throw new FlowExecutionError(targetNodeId, flowId, flowRunId, `Jump failed: ${error.message}`);
        }
    }

    /**
     * Completes a node with the provided result
     */
    public async completeNode(
        tenantId: string,
        flowId: string,
        flowRunId: string,
        nodeId: string,
        result?: any
    ): Promise<void> {
        const flow: IFlow = await FlowService.getInstance().getFlow(tenantId, flowId);
        if (!flow) {
            throw new FlowNotFoundError(flowId);
        }

        const flowRun = await this.flowRunService.getFlowRunById(flowRunId);
        if (!flowRun) {
            throw new FlowRunNotFoundError(flowRunId);
        }

        const nodeState = flowRun.nodeStates.find(ns => ns.nodeId === nodeId);
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
            await FlowService.getInstance().saveFlow(flow);

            // Proceed to next nodes if any
            if (nodeDef.nextNodes?.length) {
                for (const nextNodeId of nodeDef.nextNodes) {
                    await this.nodeExecutor.executeNode(flow, flowRun, nextNodeId);
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
            throw new FlowExecutionError(nodeId, flowId, flowRunId, `Completion failed: ${error.message}`);
        }
    }

    /**
     * Marks a node as failed with the provided error message
     */
    public async failNode(
        tenantId: string,
        flowId: string,
        flowRunId: string,
        nodeId: string,
        errorMsg: string
    ): Promise<void> {
        const flow: IFlow = await FlowService.getInstance().getFlow(tenantId, flowId);
        if (!flow) {
            throw new FlowNotFoundError(flowId);
        }

        const flowRun = await this.flowRunService.getFlowRunById(flowRunId);
        if (!flowRun) {
            throw new FlowRunNotFoundError(flowRunId);
        }

        const nodeState = flowRun.nodeStates.find(ns => ns.nodeId === nodeId);
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
            await FlowService.getInstance().saveFlow(flow);

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
            throw new FlowExecutionError(nodeId, flowId, flowRunId, `Failed to mark node as failed: ${error.message}`);
        }
    }

    async getFlowRuns(tenantId: string, flowId: string): Promise<any> {
        return this.flowRunService.getFlowRuns({
            tenantId,
            flowId
        });
    }

    public async startFlow(tenantId: string, flowId: string): Promise<IFlowRun> {
        const flow = await FlowService.getInstance().getFlowById(flowId);
        if (!flow) {
            throw new FlowNotFoundError(flowId);
        }
        // Can only start flows that are in draft or paused state
        if (!['draft', 'paused', 'stopped', 'completed', 'failed'].includes(flow.overallStatus)) {
            throw new Error(`Cannot start flow ${flowId} - invalid state: ${flow.overallStatus}`);
        }
        // Start flow execution
        return this.runFlow(tenantId, flowId);
    }

    public async pauseFlowRun(tenantId: string, flowId: string, flowRunId: string): Promise<IFlow> {
        const flowRun = await this.flowRunService.getFlowRunById(flowRunId);
        if (!flowRun) {
            throw new FlowRunNotFoundError(flowRunId);
        }

        if (flowRun.status !== 'running') {
            throw new Error(`Cannot pause flow ${flowId} - not running`);
        }

        // Update status
        flowRun.status = 'paused';

        // Mark all running nodes as paused
        flowRun.nodeStates.forEach((state: any) => {
            if (state.status === 'running') {
                state.status = 'paused';
                state.logs.push(`Node paused at ${new Date().toISOString()}`);
            }
        });

        // Save state
        await this.flowRunService.saveFlowRun(flowRun);

        // Remove running flag from Redis
        await this.redis.removeRunningFlow(tenantId, flowId, flowRunId);
        return flowRun;
    }

    public async stopFlowRun(tenantId: string, flowId: string, flowRunId: string): Promise<IFlow> {
        const flowRun = await this.flowRunService.getFlowRunById(flowRunId);
        if (!flowRun) {
            throw new FlowRunNotFoundError(flowRunId);
        }

        // Can stop flow in any state except 'completed'
        if (flowRun.status === 'completed') {
            throw new Error(`Cannot stop flow ${flowId} - already completed`);
        }

        // Update status
        flowRun.status = 'stopped';

        // Mark all active nodes as stopped
        flowRun.nodeStates.forEach((state: any) => {
            if (['running', 'pending', 'paused'].includes(state.status)) {
                state.status = 'stopped';
                state.finishedAt = new Date();
                state.logs.push(`Node stopped at ${new Date().toISOString()}`);
            }
        });

        // Save state
        await this.flowRunService.saveFlowRun(flowRun);


        // Remove running flag from Redis
        await this.redis.removeRunningFlow(tenantId, flowId, flowRunId);

        return flowRun;
    }

    public async pauseAllFlowRuns(tenantId: string, flowId: string): Promise<{
        success: boolean;
        paused: string[];  // flowRunIds
        failed: Array<{ flowRunId: string; error: string }>;
    }> {
        try {
            // Get all running instances of this specific flow
            const runningInstances = await this.flowRunService.getFlowRuns({
                flowId,
                tenantId,
                status: 'running'
            });

            const results = {
                overallStatus: '',
                message: 'initiating flow pause',
                success: true,
                paused: [] as string[],
                failed: [] as Array<{ flowRunId: string; error: string }>
            };

            // No running instances
            if (runningInstances.length === 0) {

                const flowStatus = await this.flowService.updateFlowStatus(flowId, 'paused');
                results.overallStatus = 'paused';
                results.overallStatus = 'paused';

                return results;
            }

            // Pause each instance
            await Promise.allSettled(
                runningInstances.map(async (flowRun) => {
                    try {
                        await this.pauseFlowRun(tenantId, flowId, flowRun.flowRunId);
                        results.paused.push(flowRun.flowRunId);
                    } catch (error: any) {
                        results.failed.push({
                            flowRunId: flowRun.flowRunId,
                            error: error.message
                        });
                    }
                })
            );

            if (results.failed.length > 0) {
                results.success = false;
            }

            logger.info(`Pause all instances of flow completed`, {
                flowId,
                tenantId,
                paused: results.paused.length,
                failed: results.failed.length
            });

            const flowStatus = await this.flowService.updateFlowStatus(flowId, 'paused');
            results.overallStatus = 'paused';
            results.message = `Successfully paused ${results.paused.length} instances${results.failed.length ? `, ${results.failed.length} failed` : ''}`;
            return results;
        } catch (error: any) {
            logger.error('Error in pauseAllFlowInstances', {
                error: error.message,
                flowId,
                tenantId
            });
            throw error;
        }
    }

    public async stopAllFlowRuns(tenantId: string, flowId: string): Promise<{
        success: boolean;
        stopped: string[];  // flowRunIds
        failed: Array<{ flowRunId: string; error: string }>;
    }> {
        try {
            // Get all active instances of this specific flow
            const activeInstances = await this.flowRunService.getFlowRuns({
                flowId,
                tenantId,
                status: { $in: ['running', 'paused', 'pending', 'waiting'] }
            });

            const results = {
                overallStatus: '',
                message: 'initiating flow stop',
                success: true,
                stopped: [] as string[],
                failed: [] as Array<{ flowRunId: string; error: string }>
            };

            // No active instances
            if (activeInstances.length === 0) {
                const flowStatus = await this.flowService.updateFlowStatus(flowId, 'stopped');
                results.overallStatus = 'stopped';
                results.message = 'No active instances to stop';
                return results;
            }

            // Stop each instance
            await Promise.allSettled(
                activeInstances.map(async (flowRun) => {
                    try {
                        await this.stopFlowRun(tenantId, flowId, flowRun.flowRunId);
                        results.stopped.push(flowRun.flowRunId);
                    } catch (error: any) {
                        results.failed.push({
                            flowRunId: flowRun.flowRunId,
                            error: error.message
                        });
                    }
                })
            );

            if (results.failed.length > 0) {
                results.success = false;
            }

            logger.info(`Stop all instances of flow completed`, {
                flowId,
                tenantId,
                stopped: results.stopped.length,
                failed: results.failed.length
            });
            const flowStatus = await this.flowService.updateFlowStatus(flowId, 'stopped');
            results.overallStatus = 'stopped';
            results.message = `Successfully stopped ${results.stopped.length} instances${results.failed.length ? `, ${results.failed.length} failed` : ''}`;
            return results;
        } catch (error: any) {
            logger.error('Error in stopAllFlowInstances', {
                error: error.message,
                flowId,
                tenantId
            });
            throw error;
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