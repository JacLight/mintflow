// src/services/NodeExecutorService.ts

import { INodeDefinition, IFlowNodeState, IFlow } from './FlowInterfaces.js';
import { ConfigService } from './ConfigService.js';
import { RedisService } from './RedisService.js';
import { MQTTService } from './MQTTService.js';
import { HTTPCallbackService } from './HTTPCallbackService.js';
import { MetricsService } from './MetricsService.js';
import { SafeExpressionEvaluator } from '../utils/SafeExpressionEvaluator.js';
import {
    FlowExecutionError,
    InvalidNodeConfigurationError,
    NodeNotFoundError
} from './FlowErrors.js';
import { logger } from '@mintflow/common';
import { EventEmitter } from 'events';
import { DatabaseService } from '../services/DatabaseService.js';
import { getNodeAction } from '../plugins-register.js';

export class NodeExecutorService {
    private static instance: NodeExecutorService;
    private config = ConfigService.getInstance().getConfig();
    private redis = RedisService.getInstance();
    private mqtt = MQTTService.getInstance();
    private httpCallback = HTTPCallbackService.getInstance();
    private metrics = MetricsService.getInstance();
    private eventEmitter = new EventEmitter();

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

        let nodeState = flow.nodeStates.find(
            (ns: IFlowNodeState) => ns.nodeId === nodeId
        );

        if (!nodeState) {
            nodeState = {
                nodeId,
                status: 'pending',
                logs: [],
                inputData: workingData
            };
            flow.nodeStates.push(nodeState);
        }

        try {
            await this.executeNodeByType(flow, nodeDef, nodeState);
            const duration = Date.now() - startTime;
            this.metrics.recordNodeExecution(nodeId, duration);
            await DatabaseService.getInstance().saveFlow(flow);
        } catch (error: any) {
            const duration = Date.now() - startTime;
            this.metrics.recordNodeFailure(nodeId);
            nodeState.status = 'failed';
            nodeState.error = error.message;
            nodeState.logs.push(`Error: ${error.message}`);
            await DatabaseService.getInstance().saveFlow(flow);
            throw new FlowExecutionError(nodeId, flow.flowId, error.message);
        }
    }

    private async executeNodeByType(
        flow: IFlow,
        nodeDef: INodeDefinition,
        nodeState: IFlowNodeState
    ): Promise<void> {
        switch (nodeDef.executionMode) {
            case 'manual':
                await this.handleManualNode(flow, nodeDef, nodeState);
                break;
            case 'wait_for_input':
                await this.handleWaitForInputNode(flow, nodeDef, nodeState);
                break;
            case 'mqtt':
                await this.handleMqttNode(flow, nodeDef, nodeState);
                break;
            case 'http_callback':
                await this.handleHttpCallbackNode(flow, nodeDef, nodeState);
                break;
            case 'event':
                await this.handleEventNode(flow, nodeDef, nodeState);
                break;
            case 'external':
                await this.handleExternalNode(flow, nodeDef, nodeState);
                break;
            case 'auto':
                await this.handleAutoNode(flow, nodeDef, nodeState);
                break;
            default:
                await this.handleStandardNode(flow, nodeDef, nodeState);
        }
    }

    private async handleStandardNode(
        flow: IFlow,
        nodeDef: INodeDefinition,
        nodeState: IFlowNodeState
    ): Promise<void> {
        nodeState.status = 'running';
        nodeState.startedAt = new Date();

        const result = await this.executeNodeLogic(nodeDef, flow.workingState || {});

        nodeState.status = 'completed';
        nodeState.result = result;
        nodeState.finishedAt = new Date();

        flow.workingState = flow.workingState || {};
        flow.workingState[`${nodeDef.nodeId}_result`] = result;

        await this.updateFlowContext(flow, nodeDef.nodeId, result);
        await this.proceedToNextNodes(flow, nodeDef, nodeState);
    }

    private async handleAutoNode(
        flow: IFlow,
        nodeDef: INodeDefinition,
        nodeState: IFlowNodeState
    ): Promise<void> {
        nodeState.status = 'running';
        const result = await this.executeNodeLogic(nodeDef, flow.workingState || {});

        flow.workingState = flow.workingState || {};
        flow.workingState[`${nodeDef.nodeId}_result`] = result;

        await this.updateFlowContext(flow, nodeDef.nodeId, result);

        const nextNodes = await this.handleBranching(flow, nodeDef, nodeState);

        nodeState.status = 'completed';
        nodeState.result = result;

        for (const nextNodeId of nextNodes) {
            await this.executeNode(flow, nextNodeId, result);
        }
    }

    private async handleManualNode(
        flow: IFlow,
        nodeDef: INodeDefinition,
        nodeState: IFlowNodeState
    ): Promise<void> {
        nodeState.status = 'manual_wait';
        nodeState.logs.push('Waiting for manual progression');

        if (nodeDef.manualNextNodes?.length) {
            nodeState.availableNextNodes = nodeDef.manualNextNodes;
        }
    }

    private async handleWaitForInputNode(
        flow: IFlow,
        nodeDef: INodeDefinition,
        nodeState: IFlowNodeState
    ): Promise<void> {
        nodeState.status = 'waiting';
        nodeState.logs.push('Waiting for user input');

        if (nodeDef.input?.requirements) {
            nodeState.inputRequirements = nodeDef.input.requirements;
        }
    }

    private async handleMqttNode(
        flow: IFlow,
        nodeDef: INodeDefinition,
        nodeState: IFlowNodeState
    ): Promise<void> {
        if (!nodeDef.mqtt?.topic) {
            throw new InvalidNodeConfigurationError(nodeDef.nodeId, 'MQTT topic not specified');
        }

        const timeout = nodeDef.mqtt.timeout || this.config.timeouts.mqtt;
        nodeState.status = 'waiting';

        try {
            const result = await this.mqtt.waitForMessage(nodeDef.mqtt.topic, timeout);
            nodeState.status = 'completed';
            nodeState.result = result;
            nodeState.finishedAt = new Date();

            flow.workingState = flow.workingState || {};
            flow.workingState[`${nodeDef.nodeId}_result`] = result;

            await this.updateFlowContext(flow, nodeDef.nodeId, result);
            await this.proceedToNextNodes(flow, nodeDef, nodeState);
        } catch (error: any) {
            throw new FlowExecutionError(
                nodeDef.nodeId,
                flow.flowId,
                `MQTT node execution failed: ${error.message}`
            );
        }
    }

    private async handleHttpCallbackNode(
        flow: IFlow,
        nodeDef: INodeDefinition,
        nodeState: IFlowNodeState
    ): Promise<void> {
        if (!nodeDef.http?.callbackUrl) {
            throw new InvalidNodeConfigurationError(nodeDef.nodeId, 'HTTP callback URL not specified');
        }

        const timeout = nodeDef.http.timeout || this.config.timeouts.http;
        const callbackId = await this.httpCallback.setupCallback(flow, nodeDef, nodeState);

        try {
            const result = await this.httpCallback.waitForCallback(callbackId, timeout);
            nodeState.status = 'completed';
            nodeState.result = result;
            nodeState.finishedAt = new Date();

            flow.workingState = flow.workingState || {};
            flow.workingState[`${nodeDef.nodeId}_result`] = result;

            await this.updateFlowContext(flow, nodeDef.nodeId, result);
            await this.proceedToNextNodes(flow, nodeDef, nodeState);
        } catch (error: any) {
            throw new FlowExecutionError(
                nodeDef.nodeId,
                flow.flowId,
                `HTTP callback node execution failed: ${error.message}`
            );
        }
    }

    private async handleEventNode(
        flow: IFlow,
        nodeDef: INodeDefinition,
        nodeState: IFlowNodeState
    ): Promise<void> {
        if (!nodeDef.event?.eventName) {
            throw new InvalidNodeConfigurationError(nodeDef.nodeId, 'Event name not specified');
        }

        const timeout = nodeDef.event.timeout || this.config.timeouts.event;
        nodeState.status = 'waiting';

        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                this.eventEmitter.removeAllListeners(nodeDef.event!.eventName);
                reject(new FlowExecutionError(
                    nodeDef.nodeId,
                    flow.flowId,
                    'Event node execution timed out'
                ));
            }, timeout);

            if (nodeDef?.event?.eventName) {
                this.eventEmitter.once(nodeDef?.event?.eventName, async (data) => {
                    clearTimeout(timer);
                    try {
                        nodeState.status = 'completed';
                        nodeState.result = data;
                        nodeState.finishedAt = new Date();

                        flow.workingState = flow.workingState || {};
                        flow.workingState[`${nodeDef.nodeId}_result`] = data;

                        await this.updateFlowContext(flow, nodeDef.nodeId, data);
                        await this.proceedToNextNodes(flow, nodeDef, nodeState);
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
        nodeDef: INodeDefinition,
        nodeState: IFlowNodeState
    ): Promise<void> {
        nodeState.status = 'waiting';
        await this.redis.enqueueExternalTask({
            flowId: flow.flowId,
            nodeId: nodeDef.nodeId,
            input: nodeDef.input,
            context: flow.workingState
        });
    }

    private async executeNodeLogic(
        nodeDef: INodeDefinition,
        context: Record<string, any>
    ): Promise<any> {
        const nodeAction = await getNodeAction(nodeDef.nodeId, nodeDef.type);
        if (!nodeAction?.execute) {
            throw new InvalidNodeConfigurationError(
                nodeDef.nodeId,
                'No execute function found'
            );
        }

        const input = { ...context, ...nodeDef.input };
        return await nodeAction.execute(input, nodeDef);
    }

    private async handleBranching(
        flow: IFlow,
        nodeDef: INodeDefinition,
        nodeState: IFlowNodeState
    ): Promise<string[]> {
        const nextNodes: string[] = [];

        if (!nodeDef.branches || nodeDef.branches.length === 0) {
            return nodeDef.nextNodes || [];
        }

        for (const branch of nodeDef.branches) {
            try {
                let conditionMet = false;
                if (branch.evaluator) {
                    conditionMet = branch.evaluator(flow.workingState);
                } else {
                    conditionMet = await SafeExpressionEvaluator.evaluate(
                        branch.condition,
                        flow.workingState
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

        return nextNodes;
    }

    private async proceedToNextNodes(
        flow: IFlow,
        nodeDef: INodeDefinition,
        nodeState: IFlowNodeState
    ): Promise<void> {
        if (nodeDef.nextNodes && nodeDef.nextNodes.length > 0) {
            for (const nextNodeId of nodeDef.nextNodes) {
                await this.executeNode(flow, nextNodeId);
            }
        }
    }

    private async updateFlowContext(
        flow: IFlow,
        nodeId: string,
        result: any
    ): Promise<void> {
        await this.redis.setFlowContext(
            `${flow.tenantId}:${flow.flowId}`,
            { [`${nodeId}_result`]: result }
        );
    }

    async progressManualNode(
        flow: IFlow,
        nodeId: string,
        selectedNextNode: string,
        userInput?: any
    ): Promise<void> {
        const nodeState = flow.nodeStates.find(ns => ns.nodeId === nodeId);
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
            flow.workingState = flow.workingState || {};
            flow.workingState[`${nodeId}_input`] = userInput;
            await this.updateFlowContext(flow, nodeId, { input: userInput });
        }

        nodeState.status = 'completed';
        nodeState.selectedNext = selectedNextNode;
        await this.executeNode(flow, selectedNextNode);
    }

    async resumeWithInput(
        flow: IFlow,
        nodeId: string,
        userInput: any
    ): Promise<void> {
        const nodeState = flow.nodeStates.find(ns => ns.nodeId === nodeId);
        const nodeDef = flow.definition.nodes.find(
            (n: INodeDefinition) => n.nodeId === nodeId
        );

        if (!nodeState || !nodeDef) {
            throw new NodeNotFoundError(nodeId);
        }

        flow.workingState = flow.workingState || {};
        flow.workingState[`${nodeId}_input`] = userInput;
        await this.updateFlowContext(flow, nodeId, { input: userInput });
        await this.handleAutoNode(flow, nodeDef, nodeState);
    }

    emitEvent(eventName: string, data: any): void {
        this.eventEmitter.emit(eventName, data);
    }

    async cleanup(): Promise<void> {
        this.eventEmitter.removeAllListeners();
    }
}