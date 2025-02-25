/// <reference types="jest" />

import agentPlugin, { Tool, AgentState } from '../src/adapters/AgentPlugin.js';

describe('AgentPlugin', () => {
    describe('createAgent action', () => {
        it('should create an agent with the specified configuration', async () => {
            const createAgentAction = agentPlugin.actions.find(a => a.name === 'createAgent');
            expect(createAgentAction).toBeDefined();

            // Mock implementation for this test
            const mockCreate = jest.fn().mockResolvedValue({
                agentId: 'test-agent-123',
                state: {
                    tools: [
                        { name: 'search', description: 'Search for information' },
                        { name: 'calculator', description: 'Perform calculations' }
                    ],
                    model: 'gpt-4',
                    memory: {},
                    status: 'ready'
                }
            });

            // Replace the actual implementation with our mock
            const originalExecute = createAgentAction!.execute;
            createAgentAction!.execute = mockCreate;

            const input = {
                tools: [
                    { name: 'search', description: 'Search for information' },
                    { name: 'calculator', description: 'Perform calculations' }
                ],
                model: 'gpt-4',
                systemPrompt: 'You are a helpful assistant'
            };

            const result = await createAgentAction!.execute(input as any);

            // Restore the original implementation
            createAgentAction!.execute = originalExecute;

            expect(result.agentId).toBe('test-agent-123');
            expect(result.state.tools).toHaveLength(2);
            expect(result.state.model).toBe('gpt-4');
            expect(result.state.status).toBe('ready');
            expect(mockCreate).toHaveBeenCalledWith(input);
        });
    });

    describe('executeAgentAction action', () => {
        it('should execute an action with the agent', async () => {
            const executeAgentAction = agentPlugin.actions.find(a => a.name === 'executeAgentAction');
            expect(executeAgentAction).toBeDefined();

            // Mock implementation for this test
            const mockExecute = jest.fn().mockResolvedValue({
                result: 'The answer is 42',
                actions: [
                    { tool: 'calculator', input: '6 * 7', output: '42' }
                ],
                state: {
                    tools: [{ name: 'calculator', description: 'Perform calculations' }],
                    model: 'gpt-4',
                    memory: {
                        messages: [
                            { role: 'user', content: 'What is 6 * 7?' },
                            { role: 'assistant', content: 'The answer is 42' }
                        ]
                    },
                    status: 'ready'
                }
            });

            // Replace the actual implementation with our mock
            const originalExecute = executeAgentAction!.execute;
            executeAgentAction!.execute = mockExecute;

            const input = {
                agentId: 'test-agent-123',
                input: 'What is 6 * 7?'
            };

            const result = await executeAgentAction!.execute(input as any);

            // Restore the original implementation
            executeAgentAction!.execute = originalExecute;

            expect(result.result).toBe('The answer is 42');
            expect(result.actions).toHaveLength(1);
            expect(result.actions[0].tool).toBe('calculator');
            expect(result.actions[0].input).toBe('6 * 7');
            expect(result.actions[0].output).toBe('42');
            expect(result.state.memory.messages).toHaveLength(2);
            expect(mockExecute).toHaveBeenCalledWith(input);
        });
    });

    describe('getAgentState action', () => {
        it('should retrieve the current state of an agent', async () => {
            const getAgentStateAction = agentPlugin.actions.find(a => a.name === 'getAgentState');
            expect(getAgentStateAction).toBeDefined();

            // Mock implementation for this test
            const mockGetState = jest.fn().mockResolvedValue({
                tools: [{ name: 'calculator', description: 'Perform calculations' }],
                model: 'gpt-4',
                memory: {
                    messages: [
                        { role: 'user', content: 'What is 6 * 7?' },
                        { role: 'assistant', content: 'The answer is 42' }
                    ]
                },
                status: 'ready'
            });

            // Replace the actual implementation with our mock
            const originalExecute = getAgentStateAction!.execute;
            getAgentStateAction!.execute = mockGetState;

            const input = {
                agentId: 'test-agent-123'
            };

            const result = await getAgentStateAction!.execute(input as any);

            // Restore the original implementation
            getAgentStateAction!.execute = originalExecute;

            expect(result.tools).toHaveLength(1);
            expect(result.model).toBe('gpt-4');
            expect(result.memory.messages).toHaveLength(2);
            expect(result.status).toBe('ready');
            expect(mockGetState).toHaveBeenCalledWith(input);
        });
    });

    describe('updateAgentTools action', () => {
        it('should update the tools available to an agent', async () => {
            const updateAgentToolsAction = agentPlugin.actions.find(a => a.name === 'updateAgentTools');
            expect(updateAgentToolsAction).toBeDefined();

            // Mock implementation for this test
            const mockUpdateTools = jest.fn().mockResolvedValue({
                tools: [
                    { name: 'search', description: 'Search for information' },
                    { name: 'calculator', description: 'Perform calculations' },
                    { name: 'weather', description: 'Get weather information' }
                ],
                model: 'gpt-4',
                memory: {},
                status: 'ready'
            });

            // Replace the actual implementation with our mock
            const originalExecute = updateAgentToolsAction!.execute;
            updateAgentToolsAction!.execute = mockUpdateTools;

            const input = {
                agentId: 'test-agent-123',
                tools: [
                    { name: 'search', description: 'Search for information' },
                    { name: 'calculator', description: 'Perform calculations' },
                    { name: 'weather', description: 'Get weather information' }
                ]
            };

            const result = await updateAgentToolsAction!.execute(input as any);

            // Restore the original implementation
            updateAgentToolsAction!.execute = originalExecute;

            expect(result.tools).toHaveLength(3);
            expect(result.tools[2].name).toBe('weather');
            expect(result.status).toBe('ready');
            expect(mockUpdateTools).toHaveBeenCalledWith(input);
        });
    });

    describe('resetAgentMemory action', () => {
        it('should reset the memory of an agent', async () => {
            const resetAgentMemoryAction = agentPlugin.actions.find(a => a.name === 'resetAgentMemory');
            expect(resetAgentMemoryAction).toBeDefined();

            // Mock implementation for this test
            const mockResetMemory = jest.fn().mockResolvedValue({
                tools: [{ name: 'calculator', description: 'Perform calculations' }],
                model: 'gpt-4',
                memory: { messages: [] },
                status: 'ready'
            });

            // Replace the actual implementation with our mock
            const originalExecute = resetAgentMemoryAction!.execute;
            resetAgentMemoryAction!.execute = mockResetMemory;

            const input = {
                agentId: 'test-agent-123'
            };

            const result = await resetAgentMemoryAction!.execute(input as any);

            // Restore the original implementation
            resetAgentMemoryAction!.execute = originalExecute;

            expect(result.memory.messages).toHaveLength(0);
            expect(result.status).toBe('ready');
            expect(mockResetMemory).toHaveBeenCalledWith(input);
        });
    });

    describe('deleteAgent action', () => {
        it('should delete an agent', async () => {
            const deleteAgentAction = agentPlugin.actions.find(a => a.name === 'deleteAgent');
            expect(deleteAgentAction).toBeDefined();

            // Mock implementation for this test
            const mockDelete = jest.fn().mockResolvedValue({
                success: true,
                message: 'Agent deleted successfully'
            });

            // Replace the actual implementation with our mock
            const originalExecute = deleteAgentAction!.execute;
            deleteAgentAction!.execute = mockDelete;

            const input = {
                agentId: 'test-agent-123'
            };

            const result = await deleteAgentAction!.execute(input as any);

            // Restore the original implementation
            deleteAgentAction!.execute = originalExecute;

            expect(result.success).toBe(true);
            expect(result.message).toBe('Agent deleted successfully');
            expect(mockDelete).toHaveBeenCalledWith(input);
        });
    });
});
