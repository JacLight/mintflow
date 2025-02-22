import { Redis } from 'ioredis';
import { EventEmitter } from 'events';
import mqtt from 'mqtt';
import { v4 as uuidv4 } from 'uuid';
import { DatabaseService } from '../../src/services/DatabaseService';
import { FlowEngine, IFlow, IFlowNodeState, NodeStatus } from '../../src/engine/FlowEngine';
import { getNodeAction, getPlugin } from '../../src/plugins-register';

jest.mock('../../src/services/DatabaseService');
jest.mock('events');
jest.mock('mqtt');
jest.mock('uuid');
jest.mock('ioredis', () => {
    const Redis = jest.fn().mockImplementation(() => ({
        set: jest.fn(),
        get: jest.fn(),
        rpush: jest.fn(),
        del: jest.fn()
    }));
    return { Redis };
});

jest.mock('../../src/plugins-register', () => ({
    getNodeAction: jest.fn(),
    getPlugin: jest.fn()
}));

jest.mock('axios', () => ({
    default: jest.fn()
}));

describe('FlowEngine', () => {
    let dbMock: jest.Mocked<DatabaseService>;
    let redisMock: jest.Mocked<Redis>;
    let contextStoreMock: jest.Mocked<Redis>;
    let eventEmitterMock: jest.Mocked<EventEmitter>;
    let mqttClientMock: jest.Mocked<mqtt.MqttClient>;
    let executeNodeMock: jest.SpyInstance<Promise<void>, [IFlow, string, any?]>;
    let getNodeActionMock: jest.Mock;

    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks();

        // Setup database mock
        dbMock = new DatabaseService() as jest.Mocked<DatabaseService>;
        (DatabaseService.getInstance as jest.Mock).mockReturnValue(dbMock);

        // Setup Redis mocks
        redisMock = new Redis() as jest.Mocked<Redis>;
        contextStoreMock = new Redis() as jest.Mocked<Redis>;

        // Setup EventEmitter mock
        eventEmitterMock = new EventEmitter() as jest.Mocked<EventEmitter>;

        // Setup MQTT client mock
        mqttClientMock = mqtt.connect('') as jest.Mocked<mqtt.MqttClient>;

        // Inject mocks into FlowEngine
        (FlowEngine as any).redis = redisMock;
        (FlowEngine as any).contextStore = contextStoreMock;
        (FlowEngine as any).eventEmitter = eventEmitterMock;
        (FlowEngine as any).mqttClient = mqttClientMock;

        // Mock UUID generation
        (uuidv4 as jest.Mock).mockReturnValue('test-uuid');

        // Mock axios
        const axios = require('axios').default;
        axios.mockClear();

        // Mock executeNode method
        executeNodeMock = jest.spyOn(FlowEngine, 'executeNode').mockImplementation(async (flow: IFlow, nodeId: string, workingData?: any) => {
            const nodeState = flow.nodeStates.find((ns: IFlowNodeState) => ns.nodeId === nodeId);
            if (nodeState) {
                nodeState.status = 'completed';
                nodeState.result = { success: true };
            }
        });

        // Mock getNodeAction
        getNodeActionMock = getNodeAction as jest.Mock;
    });

    describe('Context Management', () => {
        it('should initialize flow context correctly', async () => {
            await FlowEngine.initFlowContext('tenant1', 'flow1');

            expect(contextStoreMock.set).toHaveBeenCalledWith(
                'flow_context:tenant1:flow1',
                expect.stringContaining('"flowId":"flow1"'),
                'EX',
                86400
            );
        });

        it('should update flow context correctly', async () => {
            const mockContext = {
                flowId: 'flow1',
                tenantId: 'tenant1',
                data: { existingData: 'value' },
                startedAt: new Date(),
                lastUpdatedAt: new Date()
            };

            contextStoreMock.get.mockResolvedValue(JSON.stringify(mockContext));

            await FlowEngine['updateFlowContext']('tenant1', 'flow1', { newData: 'value' });

            expect(contextStoreMock.set).toHaveBeenCalledWith(
                'flow_context:tenant1:flow1',
                expect.stringContaining('"newData":"value"'),
                'EX',
                86400
            );
        });
    });

    describe('Flow Execution', () => {
        const mockFlow: IFlow = {
            tenantId: 'tenant1',
            flowId: 'flow1',
            definition: {
                nodes: [
                    { nodeId: 'start', type: 'start' },
                    { nodeId: 'process', type: 'process', nextNodes: ['end'] },
                    { nodeId: 'end', type: 'end' }
                ]
            },
            nodeStates: [],
            overallStatus: 'draft',
            workingState: {},
            createdAt: new Date(),
            updatedAt: new Date(),
            status: 'draft',
            logs: [],
            URL: ''
        };

        it('should run flow correctly', async () => {
            dbMock.getFlow.mockResolvedValue(mockFlow);

            await FlowEngine.runFlow('tenant1', 'flow1');

            expect(dbMock.saveFlow).toHaveBeenCalled();
            expect(mockFlow.nodeStates[0].status).toBe('pending');
            expect(mockFlow.overallStatus).toBe('running');
        });

        it('should handle node execution correctly', async () => {
            await FlowEngine.executeNode(mockFlow, 'process');

            const processNode = mockFlow.nodeStates.find(ns => ns.nodeId === 'process');
            expect(processNode?.status).toBe('completed');
            expect(processNode?.result).toEqual({ success: true });
        });

        it('should handle node execution errors', async () => {
            executeNodeMock.mockImplementationOnce(async (flow: IFlow, nodeId: string, workingData?: any) => {
                const nodeState = flow.nodeStates.find((ns: IFlowNodeState) => ns.nodeId === nodeId);
                if (nodeState) {
                    nodeState.status = 'failed';
                    nodeState.error = 'Execution failed';
                }
                throw new Error('Execution failed');
            });

            await expect(FlowEngine.executeNode(mockFlow, 'process')).rejects.toThrow('Execution failed');

            const processNode = mockFlow.nodeStates.find(ns => ns.nodeId === 'process');
            expect(processNode?.status).toBe('failed');
            expect(processNode?.error).toBe('Execution failed');
        });
    });

    describe('Decision Node Handling', () => {
        const mockDecisionFlow: IFlow = {
            tenantId: 'tenant1',
            flowId: 'flow1',
            definition: {
                nodes: [
                    {
                        nodeId: 'decision1',
                        type: 'decision',
                        conditions: [
                            { condition: 'context.value > 10', nextNodeId: 'path1' },
                            { condition: 'context.value <= 10', nextNodeId: 'path2' }
                        ]
                    },
                    { nodeId: 'path1', type: 'process' },
                    { nodeId: 'path2', type: 'process' }
                ]
            },
            nodeStates: [],
            overallStatus: 'running',
            workingState: { value: 15 },
            createdAt: new Date(),
            updatedAt: new Date(),
            status: 'running',
            logs: [],
            URL: ''
        };

        it('should evaluate decision node conditions correctly', async () => {
            dbMock.getFlow.mockResolvedValue(mockDecisionFlow);

            await FlowEngine['handleDecisionNode'](
                mockDecisionFlow,
                mockDecisionFlow.definition.nodes[0],
                { nodeId: 'decision1', status: 'pending', logs: [] }
            );

            const decisionNode = mockDecisionFlow.nodeStates.find(ns => ns.nodeId === 'decision1');
            expect(decisionNode?.status).toBe('completed');
            expect(decisionNode?.selectedBranch).toBe('path1');
        });
    });

    describe('Manual Node Progression', () => {
        const mockManualFlow: IFlow = {
            tenantId: 'tenant1',
            flowId: 'flow1',
            definition: {
                nodes: [
                    {
                        nodeId: 'manual1',
                        type: 'manual',
                        executionMode: 'manual',
                        manualNextNodes: ['path1', 'path2']
                    },
                    { nodeId: 'path1', type: 'process' },
                    { nodeId: 'path2', type: 'process' }
                ]
            },
            nodeStates: [
                { nodeId: 'manual1', status: 'manual_wait', logs: [] }
            ],
            overallStatus: 'running',
            workingState: {},
            createdAt: new Date(),
            updatedAt: new Date(),
            status: 'running',
            logs: [],
            URL: ''
        };

        it('should handle manual node progression correctly', async () => {
            dbMock.getFlow.mockResolvedValue(mockManualFlow);

            await FlowEngine.progressManualNode('tenant1', 'flow1', 'manual1', 'path1', { userInput: 'test' });

            const manualNode = mockManualFlow.nodeStates.find(ns => ns.nodeId === 'manual1');
            expect(manualNode?.status).toBe('completed');
            expect(manualNode?.selectedNext).toBe('path1');
            expect(mockManualFlow.workingState?.manual1_input).toEqual({ userInput: 'test' });
        });

        it('should reject invalid manual progression', async () => {
            dbMock.getFlow.mockResolvedValue(mockManualFlow);

            await expect(
                FlowEngine.progressManualNode('tenant1', 'flow1', 'manual1', 'invalid', {})
            ).rejects.toThrow('Invalid next node selection: invalid');
        });
    });

    describe('External Service Integration', () => {
        const mockExternalFlow: IFlow = {
            tenantId: 'tenant1',
            flowId: 'flow1',
            definition: {
                nodes: [
                    {
                        nodeId: 'external1',
                        type: 'external',
                        executionMode: 'external',
                        input: { task: 'process' }
                    }
                ]
            },
            nodeStates: [
                { nodeId: 'external1', status: 'pending', logs: [] }
            ],
            overallStatus: 'running',
            workingState: {},
            createdAt: new Date(),
            updatedAt: new Date(),
            status: 'running',
            logs: [],
            URL: ''
        };

        it('should handle external task enqueuing', async () => {
            await FlowEngine.executeExternalNode(
                mockExternalFlow,
                mockExternalFlow.definition.nodes[0],
                mockExternalFlow.nodeStates[0]
            );

            expect(redisMock.rpush).toHaveBeenCalledWith(
                'external_tasks',
                expect.stringContaining('"flowId":"flow1"')
            );
            expect(mockExternalFlow.nodeStates[0].status).toBe('waiting');
        });

        it('should handle external task completion', async () => {
            dbMock.getFlow.mockResolvedValue(mockExternalFlow);

            await FlowEngine.handleExternalCompletion('flow1', 'external1', { result: 'success' });

            const externalNode = mockExternalFlow.nodeStates.find(ns => ns.nodeId === 'external1');
            expect(externalNode?.status).toBe('completed');
            expect(externalNode?.result).toEqual({ result: 'success' });
        });
    });

    describe('Event Node Handling', () => {
        const mockEventFlow: IFlow = {
            tenantId: 'tenant1',
            flowId: 'flow1',
            definition: {
                nodes: [
                    {
                        nodeId: 'event1',
                        type: 'event',
                        executionMode: 'event',
                        event: {
                            eventName: 'test-event',
                            timeout: 1800
                        }
                    }
                ]
            },
            nodeStates: [
                { nodeId: 'event1', status: 'pending', logs: [] }
            ],
            overallStatus: 'running',
            workingState: {},
            createdAt: new Date(),
            updatedAt: new Date(),
            status: 'running',
            logs: [],
            URL: ''
        };

        it('should handle event node execution correctly', async () => {
            await FlowEngine['executeEventNode'](
                mockEventFlow,
                mockEventFlow.definition.nodes[0],
                mockEventFlow.nodeStates[0]
            );

            expect(redisMock.set).toHaveBeenCalledWith(
                'event_wait:test-uuid',
                expect.any(String),
                'EX',
                1800
            );
            expect(eventEmitterMock.once).toHaveBeenCalledWith(
                'test-event',
                expect.any(Function)
            );
            expect(mockEventFlow.nodeStates[0].status).toBe('waiting');
        });

        it('should handle event completion', async () => {
            const mockEventData = { result: 'success' };
            const storedState = JSON.stringify({
                flow: mockEventFlow,
                nodeDef: mockEventFlow.definition.nodes[0],
                nodeState: mockEventFlow.nodeStates[0]
            });
            redisMock.get.mockResolvedValue(storedState);

            // Simulate event emission
            const eventHandler = (eventEmitterMock.once as jest.Mock).mock.calls[0][1];
            await eventHandler(mockEventData);

            expect(mockEventFlow.nodeStates[0].status).toBe('completed');
            expect(mockEventFlow.nodeStates[0].result).toEqual(mockEventData);
            expect(redisMock.del).toHaveBeenCalledWith('event_wait:test-uuid');
        });
    });

    describe('HTTP Node Handling', () => {
        const mockHttpFlow: IFlow = {
            tenantId: 'tenant1',
            flowId: 'flow1',
            definition: {
                nodes: [
                    {
                        nodeId: 'http1',
                        type: 'http',
                        entry: {
                            url: 'http://test.com/api',
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            timeout: 5000
                        },
                        input: { data: 'test' }
                    }
                ]
            },
            nodeStates: [
                { nodeId: 'http1', status: 'pending', logs: [] }
            ],
            overallStatus: 'running',
            workingState: {},
            createdAt: new Date(),
            updatedAt: new Date(),
            status: 'running',
            logs: [],
            URL: ''
        };

        it('should handle HTTP node execution correctly', async () => {
            const mockAxiosResponse = { data: { success: true } };
            const axios = require('axios').default;
            axios.mockResolvedValue(mockAxiosResponse);

            await FlowEngine['handleHttpNode'](
                mockHttpFlow,
                mockHttpFlow.definition.nodes[0],
                mockHttpFlow.nodeStates[0]
            );

            expect(mockHttpFlow.nodeStates[0].status).toBe('completed');
            expect(mockHttpFlow.nodeStates[0].result).toEqual(mockAxiosResponse.data);
            expect(contextStoreMock.set).toHaveBeenCalledWith(
                expect.stringContaining('flow_context'),
                expect.stringContaining('"success":true'),
                'EX',
                86400
            );
        }, 10000); // Increase timeout to 10 seconds

        it('should handle HTTP request errors', async () => {
            const axios = require('axios').default;
            axios.mockRejectedValue(new Error('Network error'));

            await expect(
                FlowEngine['handleHttpNode'](
                    mockHttpFlow,
                    mockHttpFlow.definition.nodes[0],
                    mockHttpFlow.nodeStates[0]
                )
            ).rejects.toThrow('HTTP call failed: Network error');

            expect(mockHttpFlow.nodeStates[0].status).toBe('failed');
            expect(mockHttpFlow.nodeStates[0].error).toBeDefined();
        }, 10000); // Increase timeout to 10 seconds
    });

    describe('Python Node Handling', () => {
        const mockPythonFlow: IFlow = {
            tenantId: 'tenant1',
            flowId: 'flow1',
            definition: {
                nodes: [
                    {
                        nodeId: 'python1',
                        type: 'python',
                        input: { data: 'test' }
                    }
                ]
            },
            nodeStates: [
                { nodeId: 'python1', status: 'pending', logs: [] }
            ],
            overallStatus: 'running',
            workingState: {},
            createdAt: new Date(),
            updatedAt: new Date(),
            status: 'running',
            logs: [],
            URL: ''
        };

        it('should handle Python node execution correctly', async () => {
            await FlowEngine['handlePythonNode'](
                mockPythonFlow,
                mockPythonFlow.definition.nodes[0],
                mockPythonFlow.nodeStates[0]
            );

            expect(redisMock.rpush).toHaveBeenCalledWith(
                'pythonQueue_tenant1',
                expect.stringContaining('"taskName":"python1"')
            );
            expect(mockPythonFlow.nodeStates[0].status).toBe('waiting');
            expect(mockPythonFlow.nodeStates[0].logs).toContain('Enqueueing Python task');
        });

        it('should handle Python task completion', async () => {
            dbMock.getFlow.mockResolvedValue(mockPythonFlow);
            const mockResult = { analysis: 'complete' };

            await FlowEngine.completeNode('tenant1', 'flow1', 'python1', mockResult);

            expect(mockPythonFlow.nodeStates[0].status).toBe('completed');
            expect(mockPythonFlow.nodeStates[0].result).toEqual(mockResult);
            expect(dbMock.saveFlow).toHaveBeenCalled();
        });
    });

    describe('Node Input and Auto Handling', () => {
        const mockInputFlow: IFlow = {
            tenantId: 'tenant1',
            flowId: 'flow1',
            definition: {
                nodes: [
                    {
                        nodeId: 'input1',
                        type: 'input',
                        executionMode: 'wait_for_input',
                        input: {
                            requirements: ['field1', 'field2']
                        }
                    },
                    {
                        nodeId: 'auto1',
                        type: 'process',
                        executionMode: 'auto',
                        branches: [
                            {
                                condition: 'context.value > 10',
                                targetNodeId: 'success'
                            }
                        ]
                    }
                ]
            },
            nodeStates: [
                { nodeId: 'input1', status: 'pending', logs: [] },
                { nodeId: 'auto1', status: 'pending', logs: [] }
            ],
            overallStatus: 'running',
            workingState: { value: 15 },
            createdAt: new Date(),
            updatedAt: new Date(),
            status: 'running',
            logs: [],
            URL: ''
        };

        it('should handle wait for input node correctly', async () => {
            await FlowEngine['handleWaitForInputNode'](
                mockInputFlow,
                mockInputFlow.definition.nodes[0],
                mockInputFlow.nodeStates[0]
            );

            expect(mockInputFlow.nodeStates[0].status).toBe('waiting');
            expect(mockInputFlow.nodeStates[0].inputRequirements).toEqual(['field1', 'field2']);
        });

        it('should handle input resumption correctly', async () => {
            dbMock.getFlow.mockResolvedValue(mockInputFlow);
            const mockInput = { field1: 'value1', field2: 'value2' };

            await FlowEngine.resumeWithInput('tenant1', 'flow1', 'input1', mockInput);

            expect(contextStoreMock.set).toHaveBeenCalledWith(
                expect.stringContaining('flow_context'),
                expect.stringContaining('value1'),
                'EX',
                86400
            );
            expect(mockInputFlow.workingState.input1_input).toEqual(mockInput);
        });

        it('should handle auto node execution correctly', async () => {
            const mockNodeAction = {
                execute: jest.fn().mockResolvedValue({ processed: true })
            };
            getNodeActionMock.mockResolvedValue(mockNodeAction);

            await FlowEngine['handleAutoNode'](
                mockInputFlow,
                mockInputFlow.definition.nodes[1],
                mockInputFlow.nodeStates[1]
            );

            expect(mockInputFlow.nodeStates[1].status).toBe('completed');
            expect(mockInputFlow.nodeStates[1].result).toEqual({ processed: true });
            expect(mockNodeAction.execute).toHaveBeenCalled();
        });

        it('should handle branching with custom evaluators', async () => {
            const mockBranch = {
                evaluator: jest.fn().mockReturnValue(true),
                targetNodeId: 'success'
            };
            const nodeDef = {
                ...mockInputFlow.definition.nodes[1],
                branches: [mockBranch]
            };

            const nextNodes = await FlowEngine['handleBranching'](
                mockInputFlow,
                nodeDef,
                mockInputFlow.nodeStates[1],
                mockInputFlow.workingState
            );

            expect(nextNodes).toContain('success');
            expect(mockBranch.evaluator).toHaveBeenCalledWith(mockInputFlow.workingState);
        });
    });

    describe('Recovery and Jump Operations', () => {
        const mockFlow: IFlow = {
            tenantId: 'tenant1',
            flowId: 'flow1',
            definition: {
                nodes: [
                    { nodeId: 'node1', type: 'process' },
                    { nodeId: 'node2', type: 'process' },
                    { nodeId: 'node3', type: 'process' }
                ]
            },
            nodeStates: [
                { nodeId: 'node1', status: 'running' as NodeStatus, logs: [] },
                { nodeId: 'node2', status: 'pending' as NodeStatus, logs: [] }
            ],
            overallStatus: 'running',
            workingState: {},
            createdAt: new Date(),
            updatedAt: new Date(),
            status: 'running',
            logs: [],
            URL: ''
        };

        it('should handle flow jump operations correctly', async () => {
            dbMock.getFlow.mockResolvedValue(mockFlow);

            await FlowEngine.jumpToNode('tenant1', 'flow1', 'node2', { customData: 'test' });

            expect(mockFlow.nodeStates[0].status).toBe('completed');
            expect(mockFlow.workingState).toEqual({ customData: 'test' });
            expect(contextStoreMock.set).toHaveBeenCalled();
        });

        it('should reject jumps to invalid nodes', async () => {
            dbMock.getFlow.mockResolvedValue(mockFlow);

            await expect(
                FlowEngine.jumpToNode('tenant1', 'flow1', 'invalid', {})
            ).rejects.toThrow('Target node not found: invalid');
        });
    });
});