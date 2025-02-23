// src/services/NodeExecutorService.ts

import { INodeDefinition, IFlowNodeState, IFlow, IFlowRun, NodeStatus } from './FlowInterfaces.js';
import { ConfigService } from './ConfigService.js';
import { RedisService } from './RedisService.js';
import { MQTTService } from './MQTTService.js';
import { HTTPCallbackService } from './HTTPCallbackService.js';
import { MetricsService } from './MetricsService.js';
import { SafeExpressionEvaluator } from './SafeExpressionEvaluator.js';
import {
    FlowExecutionError,
    InvalidNodeConfigurationError,
    NodeNotFoundError
} from './FlowErrors.js';
import { logger } from '@mintflow/common';
import { EventEmitter } from 'events';
import { DatabaseService } from '../services/DatabaseService.js';
import { getNodeAction } from '../plugins-register.js';
import axios from 'axios';
import { FlowService } from '../services/FlowService.js';
import { FlowRunService } from '../services/FlowRunService.js';

export class NodeExecutorService {
    private static instance: NodeExecutorService;
    private config = ConfigService.getInstance().getConfig();
    private redis = RedisService.getInstance();
    private mqtt = MQTTService.getInstance();
    private httpCallback = HTTPCallbackService.getInstance();
    private metrics = MetricsService.getInstance();
    private eventEmitter = new EventEmitter();
    // private flowService = FlowService.getInstance();
    private flowRunService = FlowRunService.getInstance();

    private constructor() {
        this.setupEventHandling();
    }

    private setupEventHandling(): void {
        this.eventEmitter.setMaxListeners(100);
    }

    static getInstance(): NodeExecutorService {
        if (!NodeExecutorService.instance) {
            NodeExecutorService.instance = new NodeExecutorService();
        }
        return NodeExecutorService.instance;
    }

    async executeNode(
        flow: IFlow,
        flowRun: IFlowRun,
        nodeId: string,
        workingData?: any
    ): Promise<void> {
        const startTime = Date.now();
        const nodeDef = flow.definition.nodes.find(
            (n: INodeDefinition) => n.nodeId === nodeId
        );

        if (!nodeDef) {
            throw new NodeNotFoundError(nodeId);
        }

        try {
            await this.executeNodeByType(flow, flowRun, nodeDef);
            const duration = Date.now() - startTime;
            this.metrics.recordNodeExecution(nodeId, duration);
            await this.flowRunService.saveFlowRun(flowRun);
        } catch (error: any) {
            const duration = Date.now() - startTime;
            this.metrics.recordNodeFailure(nodeId);
            const nodeState = this.getNodeState(flowRun, nodeId);
            nodeState.status = 'failed';
            nodeState.error = error.message;
            nodeState.logs.push(`Error: ${error.message}`);
            await this.flowRunService.saveFlowRun(flowRun);
            throw new FlowExecutionError(nodeId, flow.flowId, flowRun.flowRunId, error.message);
        }
    }

    private getNodeState(flowRun: IFlowRun, nodeId: string): IFlowNodeState {
        let nodeState = flowRun.nodeStates.find(
            (ns: IFlowNodeState) => ns.nodeId === nodeId
        );
        if (!nodeState) {
            nodeState = {
                nodeId,
                status: 'pending',
                logs: []
            };
            flowRun.nodeStates.push(nodeState);
        }
        return nodeState;
    }

    private updateNodeState(flowRun: IFlowRun, nodeId: string, update = {}, log?: string): void {
        const existingNodeState = this.getNodeState(flowRun, nodeId);
        const mergedNodeState = { ...existingNodeState, ...update };
        if (log) {
            if (Array.isArray(mergedNodeState.logs)) {
                mergedNodeState.logs.push(log);
            } else {
                mergedNodeState.logs = [log];
            }
        }
        flowRun.nodeStates = flowRun.nodeStates.map((ns: IFlowNodeState) =>
            ns.nodeId === nodeId ? mergedNodeState : ns
        );
        this.flowRunService.saveFlowRun(flowRun);
    }

    private async executeNodeByType(
        flow: IFlow,
        flowRun: IFlowRun,
        nodeDef: INodeDefinition,
    ): Promise<void> {
        switch (nodeDef.executionMode) {
            case 'manual':
                await this.handleManualNode(flowRun, nodeDef);
                break;
            case 'wait_for_input':
                await this.handleWaitForInputNode(flow, flowRun, nodeDef);
                break;
            case 'mqtt':
                await this.handleMqttNode(flow, flowRun, nodeDef);
                break;
            case 'http_callback':
                await this.handleHttpCallbackNode(flow, flowRun, nodeDef);
                break;
            case 'event':
                await this.handleEventNode(flow, flowRun, nodeDef);
                break;
            case 'external':
                await this.handleExternalNode(flow, flowRun, nodeDef);
                break;
            default:
                await this.handleStandardNode(flow, flowRun, nodeDef);
        }
    }

    private async handleStandardNode(
        flow: IFlow,
        flowRun: IFlowRun,
        nodeDef: INodeDefinition,
    ): Promise<void> {
        await this.updateNodeState(flowRun, nodeDef.nodeId, { status: 'running', startedAt: new Date() });
        const result = await this.executeNodeLogic(flowRun, nodeDef, flowRun.workingData || {});
        flowRun.workingData = result;
        await this.updateNodeState(flowRun, nodeDef.nodeId, { status: 'completed', result, finishedAt: new Date() });

        await this.updateFlowContext(flowRun, nodeDef.nodeId, result);
        await this.proceedToNextNodes(flow, flowRun, nodeDef);
    }

    private async handleManualNode(
        flowRun: IFlowRun,
        nodeDef: INodeDefinition,
    ): Promise<void> {
        await this.updateNodeState(flowRun, nodeDef.nodeId, { status: 'manual_wait', startedAt: new Date() }, 'Waiting for manual progression');
        const nodeState = this.getNodeState(flowRun, nodeDef.nodeId);
        if (nodeDef.manualNextNodes?.length) {
            nodeState.availableNextNodes = nodeDef.manualNextNodes;
        }

        nodeState.availableNextNodes = nodeDef.manualNextNodes;
        nodeState.inputRequirements = nodeDef.input?.requirements;

        // Save the state
        await this.flowRunService.saveFlowRun(flowRun);
    }

    private async handleWaitForInputNode(
        flow: IFlow,
        flowRun: IFlowRun,
        nodeDef: INodeDefinition,

    ): Promise<void> {
        let inputRequirements;
        if (nodeDef.input?.requirements) {
            inputRequirements = nodeDef.input.requirements;
        }
        await this.updateNodeState(flowRun, nodeDef.nodeId, { status: 'waiting', startedAt: new Date(), inputRequirements }, 'Waiting for user input');
    }

    private async handleMqttNode(
        flow: IFlow,
        flowRun: IFlowRun,
        nodeDef: INodeDefinition,
    ): Promise<void> {
        if (!nodeDef.mqtt?.topic) {
            throw new InvalidNodeConfigurationError(nodeDef.nodeId, 'MQTT topic not specified');
        }

        const nodeState = this.getNodeState(flowRun, nodeDef.nodeId);
        const timeout = nodeDef.mqtt.timeout || this.config.timeouts.mqtt;
        nodeState.status = 'waiting';

        try {
            const result = await this.mqtt.waitForMessage(nodeDef.mqtt.topic, timeout);
            await this.updateNodeState(flowRun, nodeDef.nodeId, { status: 'completed', result, finishedAt: new Date() });
            flowRun.workingData = result;
            await this.updateFlowContext(flowRun, nodeDef.nodeId, result);
            await this.proceedToNextNodes(flow, flowRun, nodeDef);
        } catch (error: any) {
            throw new FlowExecutionError(
                nodeDef.nodeId,
                flowRun.flowId,
                flowRun.flowRunId,
                `MQTT node execution failed: ${error.message}`
            );
        }
    }

    private async handleHttpCallbackNode(
        flow: IFlow,
        flowRun: IFlowRun,
        nodeDef: INodeDefinition,
    ): Promise<void> {
        if (!nodeDef.http?.callbackUrl) {
            throw new InvalidNodeConfigurationError(nodeDef.nodeId, 'HTTP callback URL not specified');
        }
        const timeout = nodeDef.http.timeout || this.config.timeouts.http;
        const callbackId = await this.httpCallback.setupCallback(flow, flowRun, nodeDef);
        await this.updateNodeState(flowRun, nodeDef.nodeId, { status: 'waiting', callbackId }, `Waiting for HTTP callback with ID: ${callbackId}`);

        try {
            const result = await this.httpCallback.waitForCallback(callbackId, timeout);
            await this.updateNodeState(flowRun, nodeDef.nodeId, { status: 'completed', result, finishedAt: new Date() });
            flowRun.workingData = result;
            await this.updateFlowContext(flowRun, nodeDef.nodeId, result);
            await this.proceedToNextNodes(flow, flowRun, nodeDef);
        } catch (error: any) {
            throw new FlowExecutionError(
                nodeDef.nodeId,
                flow.flowId,
                flowRun.flowRunId,
                `HTTP callback node execution failed: ${error.message}`
            );
        }
    }

    private async handleEventNode(
        flow: IFlow,
        flowRun: IFlowRun,
        nodeDef: INodeDefinition,

    ): Promise<void> {
        if (!nodeDef.event?.eventName) {
            throw new InvalidNodeConfigurationError(nodeDef.nodeId, 'Event name not specified');
        }

        const timeout = nodeDef.event.timeout || this.config.timeouts.event;
        await this.updateNodeState(flowRun, nodeDef.nodeId, { status: 'waiting', startedAt: new Date() }, `Waiting for event: ${nodeDef.event.eventName}`);

        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                this.eventEmitter.removeAllListeners(nodeDef.event!.eventName);
                reject(new FlowExecutionError(
                    nodeDef.nodeId,
                    flowRun.flowId,
                    flowRun.flowRunId,
                    'Event node execution timed out'
                ));
            }, timeout);

            if (nodeDef?.event?.eventName) {
                this.eventEmitter.once(nodeDef?.event?.eventName, async (data) => {
                    clearTimeout(timer);
                    try {
                        await this.updateNodeState(flowRun, nodeDef.nodeId, { status: 'completed', result: data, finishedAt: new Date() });
                        flowRun.workingData = data;
                        await this.updateFlowContext(flowRun, nodeDef.nodeId, data);
                        await this.proceedToNextNodes(flow, flowRun, nodeDef);
                        resolve();
                    } catch (error: any) {
                        reject(error);
                    }
                });
            } else {
                reject(new InvalidNodeConfigurationError(nodeDef.nodeId, 'Event name not specified'));
            }

        });
    }

    private async handleExternalNode(
        flow: IFlow,
        flowRun: IFlowRun,
        nodeDef: INodeDefinition,

    ): Promise<void> {
        const { entry } = nodeDef;
        if (!entry?.url) {
            throw new Error('External node missing URL configuration');
        }
        await this.updateNodeState(flowRun, nodeDef.nodeId, { status: 'waiting', startedAt: new Date() });

        try {
            // Make external service call
            const response = await axios({
                method: entry.method || 'POST',
                url: entry.url,
                headers: entry.headers || {},
                data: {
                    ...nodeDef.input,
                    flowId: flowRun.flowId,
                    nodeId: nodeDef.nodeId,
                    context: flowRun.workingData
                }
            });

            // Update node state with response
            await this.updateNodeState(flowRun, nodeDef.nodeId, { status: 'completed', result: response.data, finishedAt: new Date() });

            // Update working state
            flowRun.workingData = response.data;

            // Save flow state
            await this.flowRunService.saveFlowRun(flowRun);

            // Continue to next nodes
            for (const nextNodeId of nodeDef.nextNodes || []) {
                await this.executeNode(flow, flowRun, nextNodeId);
            }

        } catch (error: any) {
            await this.updateNodeState(flowRun, nodeDef.nodeId, { status: 'failed', error: error.message, finishedAt: new Date() }, error.message);
            throw error;
        }
    }

    private async executeNodeLogic(
        flowRun: IFlowRun,
        nodeDef: INodeDefinition,
        workingData: Record<string, any>
    ): Promise<any> {
        try {
            const nodeAction = await getNodeAction(nodeDef.type, nodeDef.action);
            if (!nodeAction?.execute) {
                throw new InvalidNodeConfigurationError(
                    nodeDef.nodeId,
                    'No execute function found'
                );
            }

            const input = { ...workingData, ...nodeDef.input };
            return await nodeAction.execute(input, nodeDef);
        } catch (error) {
        }
    }

    private async proceedToNextNodes(
        flow: IFlow,
        flowRun: IFlowRun,
        nodeDef: INodeDefinition,
    ): Promise<void> {
        const nextNodes: string[] = nodeDef.nextNodes || []
        const nodeState = this.getNodeState(flowRun, nodeDef.nodeId);
        if (Array.isArray(nodeDef.branches)) {
            for (const branch of nodeDef?.branches) {
                try {
                    let conditionMet = false;
                    if (branch.evaluator) {
                        conditionMet = branch.evaluator(nodeState.result);
                    } else {
                        conditionMet = await SafeExpressionEvaluator.evaluate(
                            branch.condition,
                            nodeState.result
                        );
                    }

                    if (conditionMet) {
                        nextNodes.push(branch.targetNodeId);
                        nodeState.logs.push(
                            `Branch condition met: ${branch.condition} -> ${branch.targetNodeId}`
                        );
                    }
                } catch (error: any) {
                    logger.error('Branch evaluation error', { error, branch });
                }
            }
        }

        if (nextNodes.length > 0) {
            for (const nextNodeId of nextNodes) {
                await this.executeNode(flow, flowRun, nextNodeId);
            }
        }
    }

    private async updateFlowContext(
        flowRun: IFlowRun,
        nodeId: string,
        result: any
    ): Promise<void> {
        await this.redis.setFlowContext(
            `${flowRun.tenantId}:${flowRun.flowId}:${flowRun.flowRunId}`,
            { [`${nodeId}_result`]: result }
        );
    }


    async testNode(flowRun: IFlowRun, nodeDef: INodeDefinition): Promise<any> {
        return this.executeNodeLogic(flowRun, nodeDef, {});
    }

    async progressManualNode(
        flow: IFlow,
        flowRun: IFlowRun,
        nodeId: string,
        selectedNextNode: string,
        userInput?: any
    ): Promise<void> {
        const nodeState = flowRun.nodeStates.find(ns => ns.nodeId === nodeId);
        const nodeDef = flow.definition.nodes.find(
            (n: INodeDefinition) => n.nodeId === nodeId
        );

        if (!nodeState || !nodeDef) {
            throw new NodeNotFoundError(nodeId);
        }

        if (!nodeDef.manualNextNodes?.includes(selectedNextNode)) {
            throw new InvalidNodeConfigurationError(
                nodeId,
                `Invalid next node selection: ${selectedNextNode}`
            );
        }

        if (userInput) {
            flowRun.workingData = flowRun.workingData || {};
            flowRun.workingData[`${nodeId}_input`] = userInput;
            await this.updateFlowContext(flowRun, nodeId, { input: userInput });
        }

        nodeState.status = 'completed';
        nodeState.selectedNext = selectedNextNode;
        nodeState.result = userInput;
        nodeState.finishedAt = new Date();

        // await DatabaseService.getInstance().saveFlow(flow);
        await this.executeNode(flow, flowRun, selectedNextNode);
    }

    async resumeWithInput(
        flow: IFlow,
        flowRun: IFlowRun,
        nodeId: string,
        userInput: any
    ): Promise<void> {
        const nodeState = flowRun.nodeStates.find(ns => ns.nodeId === nodeId);
        const nodeDef = flow.definition.nodes.find(
            (n: INodeDefinition) => n.nodeId === nodeId
        );

        if (!nodeState || !nodeDef) {
            throw new NodeNotFoundError(nodeId);
        }

        flowRun.workingData = flowRun.workingData || {};
        flowRun.workingData[`${nodeId}_input`] = userInput;
        await this.updateFlowContext(flowRun, nodeId, { input: userInput });
        await this.handleStandardNode(flow, flowRun, nodeDef);
    }

    emitEvent(eventName: string, data: any): void {
        this.eventEmitter.emit(eventName, data);
    }

    async cleanup(): Promise<void> {
        this.eventEmitter.removeAllListeners();
    }
}