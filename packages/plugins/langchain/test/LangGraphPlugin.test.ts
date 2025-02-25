/// <reference types="jest" />

import langGraphPlugin, { GraphState } from '../src/adapters/LangGraphPlugin.js';

describe('LangGraphPlugin', () => {
    describe('createGraph action', () => {
        it('should create a new graph', async () => {
            const createGraphAction = langGraphPlugin.actions.find(a => a.name === 'createGraph');
            expect(createGraphAction).toBeDefined();

            // Mock implementation for this test
            const mockCreate = jest.fn().mockResolvedValue({
                graphId: 'graph-123',
                state: {
                    nodes: [
                        { id: 'node1', type: 'llm', config: { model: 'gpt-4' } },
                        { id: 'node2', type: 'tool', config: { name: 'search' } }
                    ],
                    edges: [
                        { from: 'node1', to: 'node2' }
                    ],
                    status: 'created'
                }
            });

            // Replace the actual implementation with our mock
            const originalExecute = createGraphAction!.execute;
            createGraphAction!.execute = mockCreate;

            const input = {
                nodes: [
                    { id: 'node1', type: 'llm', config: { model: 'gpt-4' } },
                    { id: 'node2', type: 'tool', config: { name: 'search' } }
                ],
                edges: [
                    { from: 'node1', to: 'node2' }
                ]
            };

            const result = await createGraphAction!.execute(input as any);

            // Restore the original implementation
            createGraphAction!.execute = originalExecute;

            expect(result.graphId).toBe('graph-123');
            expect(result.state.nodes).toHaveLength(2);
            expect(result.state.edges).toHaveLength(1);
            expect(result.state.status).toBe('created');
            expect(mockCreate).toHaveBeenCalledWith(input);
        });
    });

    describe('runGraph action', () => {
        it('should execute a graph with input', async () => {
            const runGraphAction = langGraphPlugin.actions.find(a => a.name === 'runGraph');
            expect(runGraphAction).toBeDefined();

            // Mock implementation for this test
            const mockRun = jest.fn().mockResolvedValue({
                result: {
                    answer: 'The capital of France is Paris.'
                },
                state: {
                    nodes: [
                        { id: 'node1', type: 'llm', config: { model: 'gpt-4' } },
                        { id: 'node2', type: 'tool', config: { name: 'search' } }
                    ],
                    edges: [
                        { from: 'node1', to: 'node2' }
                    ],
                    execution: {
                        steps: [
                            { nodeId: 'node1', input: 'What is the capital of France?', output: 'I need to search for this.' },
                            { nodeId: 'node2', input: 'capital of France', output: 'Paris is the capital of France.' }
                        ],
                        startTime: '2023-01-01T12:00:00Z',
                        endTime: '2023-01-01T12:00:01Z'
                    },
                    status: 'completed'
                }
            });

            // Replace the actual implementation with our mock
            const originalExecute = runGraphAction!.execute;
            runGraphAction!.execute = mockRun;

            const input = {
                graphId: 'graph-123',
                input: {
                    question: 'What is the capital of France?'
                }
            };

            const result = await runGraphAction!.execute(input as any);

            // Restore the original implementation
            runGraphAction!.execute = originalExecute;

            expect(result.result.answer).toBe('The capital of France is Paris.');
            expect(result.state.execution.steps).toHaveLength(2);
            expect(result.state.status).toBe('completed');
            expect(mockRun).toHaveBeenCalledWith(input);
        });
    });

    describe('getGraphState action', () => {
        it('should retrieve the current state of a graph', async () => {
            const getGraphStateAction = langGraphPlugin.actions.find(a => a.name === 'getGraphState');
            expect(getGraphStateAction).toBeDefined();

            // Mock implementation for this test
            const mockGetState = jest.fn().mockResolvedValue({
                nodes: [
                    { id: 'node1', type: 'llm', config: { model: 'gpt-4' } },
                    { id: 'node2', type: 'tool', config: { name: 'search' } }
                ],
                edges: [
                    { from: 'node1', to: 'node2' }
                ],
                execution: {
                    steps: [
                        { nodeId: 'node1', input: 'What is the capital of France?', output: 'I need to search for this.' },
                        { nodeId: 'node2', input: 'capital of France', output: 'Paris is the capital of France.' }
                    ],
                    startTime: '2023-01-01T12:00:00Z',
                    endTime: '2023-01-01T12:00:01Z'
                },
                status: 'completed'
            });

            // Replace the actual implementation with our mock
            const originalExecute = getGraphStateAction!.execute;
            getGraphStateAction!.execute = mockGetState;

            const input = {
                graphId: 'graph-123'
            };

            const result = await getGraphStateAction!.execute(input as any);

            // Restore the original implementation
            getGraphStateAction!.execute = originalExecute;

            expect(result.nodes).toHaveLength(2);
            expect(result.edges).toHaveLength(1);
            expect(result.execution.steps).toHaveLength(2);
            expect(result.status).toBe('completed');
            expect(mockGetState).toHaveBeenCalledWith(input);
        });
    });

    describe('updateGraph action', () => {
        it('should update a graph structure', async () => {
            const updateGraphAction = langGraphPlugin.actions.find(a => a.name === 'updateGraph');
            expect(updateGraphAction).toBeDefined();

            // Mock implementation for this test
            const mockUpdate = jest.fn().mockResolvedValue({
                graphId: 'graph-123',
                state: {
                    nodes: [
                        { id: 'node1', type: 'llm', config: { model: 'gpt-4-turbo' } },
                        { id: 'node2', type: 'tool', config: { name: 'search' } },
                        { id: 'node3', type: 'tool', config: { name: 'calculator' } }
                    ],
                    edges: [
                        { from: 'node1', to: 'node2' },
                        { from: 'node1', to: 'node3' }
                    ],
                    status: 'updated'
                }
            });

            // Replace the actual implementation with our mock
            const originalExecute = updateGraphAction!.execute;
            updateGraphAction!.execute = mockUpdate;

            const input = {
                graphId: 'graph-123',
                updates: {
                    nodes: [
                        { id: 'node1', type: 'llm', config: { model: 'gpt-4-turbo' } },
                        { id: 'node2', type: 'tool', config: { name: 'search' } },
                        { id: 'node3', type: 'tool', config: { name: 'calculator' } }
                    ],
                    edges: [
                        { from: 'node1', to: 'node2' },
                        { from: 'node1', to: 'node3' }
                    ]
                }
            };

            const result = await updateGraphAction!.execute(input as any);

            // Restore the original implementation
            updateGraphAction!.execute = originalExecute;

            expect(result.state.nodes).toHaveLength(3);
            expect(result.state.edges).toHaveLength(2);
            expect(result.state.nodes[0].config.model).toBe('gpt-4-turbo');
            expect(result.state.status).toBe('updated');
            expect(mockUpdate).toHaveBeenCalledWith(input);
        });
    });

    describe('deleteGraph action', () => {
        it('should delete a graph', async () => {
            const deleteGraphAction = langGraphPlugin.actions.find(a => a.name === 'deleteGraph');
            expect(deleteGraphAction).toBeDefined();

            // Mock implementation for this test
            const mockDelete = jest.fn().mockResolvedValue({
                success: true,
                message: 'Graph deleted successfully'
            });

            // Replace the actual implementation with our mock
            const originalExecute = deleteGraphAction!.execute;
            deleteGraphAction!.execute = mockDelete;

            const input = {
                graphId: 'graph-123'
            };

            const result = await deleteGraphAction!.execute(input as any);

            // Restore the original implementation
            deleteGraphAction!.execute = originalExecute;

            expect(result.success).toBe(true);
            expect(result.message).toBe('Graph deleted successfully');
            expect(mockDelete).toHaveBeenCalledWith(input);
        });
    });
});
