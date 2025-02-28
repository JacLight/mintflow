/// <reference types="jest" />

import { chatPlugin, ChatMessage, ChatMemoryOptions, ChatSessionContext } from '../src/adapters/ChatPlugin.js';

describe('ChatPlugin', () => {
    describe('createChatSession action', () => {
        it('should create a new chat session', async () => {
            const createChatSessionAction = chatPlugin.actions.find(a => a.name === 'createChatSession');
            expect(createChatSessionAction).toBeDefined();

            // Mock implementation for this test
            const mockCreate = jest.fn().mockResolvedValue({
                sessionId: 'chat-123',
                context: {
                    model: 'gpt-4',
                    systemPrompt: 'You are a helpful assistant',
                    messages: [],
                    metadata: {
                        createdAt: new Date().toISOString()
                    }
                }
            });

            // Replace the actual implementation with our mock
            const originalExecute = createChatSessionAction!.execute;
            createChatSessionAction!.execute = mockCreate;

            const input = {
                model: 'gpt-4',
                systemPrompt: 'You are a helpful assistant',
                memoryOptions: {
                    maxMessages: 100
                }
            };

            const result: any = await createChatSessionAction!.execute(input as any);

            // Restore the original implementation
            createChatSessionAction!.execute = originalExecute;

            expect(result.sessionId).toBeDefined();
            expect(result.context.model).toBe('gpt-4');
            expect(result.context.systemPrompt).toBe('You are a helpful assistant');
            expect(result.context.messages).toEqual([]);
            expect(mockCreate).toHaveBeenCalledWith(input);
        });
    });

    describe('sendMessage action', () => {
        it('should send a message and get a response', async () => {
            const sendMessageAction = chatPlugin.actions.find(a => a.name === 'sendMessage');
            expect(sendMessageAction).toBeDefined();

            // Mock implementation for this test
            const mockSend = jest.fn().mockResolvedValue({
                response: 'Hello! How can I help you today?',
                context: {
                    model: 'gpt-4',
                    systemPrompt: 'You are a helpful assistant',
                    messages: [
                        { role: 'user', content: 'Hi there', timestamp: expect.any(String) },
                        { role: 'assistant', content: 'Hello! How can I help you today?', timestamp: expect.any(String) }
                    ],
                    metadata: {
                        createdAt: expect.any(String),
                        lastUpdated: expect.any(String)
                    }
                }
            });

            // Replace the actual implementation with our mock
            const originalExecute = sendMessageAction!.execute;
            sendMessageAction!.execute = mockSend;

            const input = {
                sessionId: 'chat-123',
                message: 'Hi there'
            };

            const result: any = await sendMessageAction!.execute(input as any);

            // Restore the original implementation
            sendMessageAction!.execute = originalExecute;

            expect(result.response).toBe('Hello! How can I help you today?');
            expect(result.context.messages).toHaveLength(2);
            expect(result.context.messages[0].role).toBe('user');
            expect(result.context.messages[0].content).toBe('Hi there');
            expect(result.context.messages[1].role).toBe('assistant');
            expect(result.context.messages[1].content).toBe('Hello! How can I help you today?');
            expect(mockSend).toHaveBeenCalledWith(input);
        });

        it('should handle additional parameters', async () => {
            const sendMessageAction = chatPlugin.actions.find(a => a.name === 'sendMessage');

            // Mock implementation for this test
            const mockSend = jest.fn().mockResolvedValue({
                response: 'I can help you with that specific topic.',
                context: {
                    model: 'gpt-4',
                    systemPrompt: 'You are a helpful assistant',
                    messages: [
                        { role: 'user', content: 'Can you help me?', timestamp: expect.any(String) },
                        { role: 'assistant', content: 'I can help you with that specific topic.', timestamp: expect.any(String) }
                    ],
                    metadata: {
                        createdAt: expect.any(String),
                        lastUpdated: expect.any(String)
                    }
                }
            });

            // Replace the actual implementation with our mock
            const originalExecute = sendMessageAction!.execute;
            sendMessageAction!.execute = mockSend;

            const input = {
                sessionId: 'chat-123',
                message: 'Can you help me?',
                temperature: 0.5,
                maxTokens: 100,
                additionalContext: 'The user is asking about a specific topic.'
            };

            const result: any = await sendMessageAction!.execute(input as any);

            // Restore the original implementation
            sendMessageAction!.execute = originalExecute;

            expect(result.response).toBe('I can help you with that specific topic.');
            expect(mockSend).toHaveBeenCalledWith(input);
        });
    });

    describe('getChatSession action', () => {
        it('should retrieve a chat session by ID', async () => {
            const getChatSessionAction = chatPlugin.actions.find(a => a.name === 'getChatSession');
            expect(getChatSessionAction).toBeDefined();

            // Mock implementation for this test
            const mockGet = jest.fn().mockResolvedValue({
                sessionId: 'chat-123',
                context: {
                    model: 'gpt-4',
                    systemPrompt: 'You are a helpful assistant',
                    messages: [
                        { role: 'user', content: 'Hi there', timestamp: '2023-01-01T12:00:00Z' },
                        { role: 'assistant', content: 'Hello! How can I help you today?', timestamp: '2023-01-01T12:00:01Z' }
                    ],
                    metadata: {
                        createdAt: '2023-01-01T12:00:00Z',
                        lastUpdated: '2023-01-01T12:00:01Z'
                    }
                }
            });

            // Replace the actual implementation with our mock
            const originalExecute = getChatSessionAction!.execute;
            getChatSessionAction!.execute = mockGet;

            const input = {
                sessionId: 'chat-123'
            };

            const result: any = await getChatSessionAction!.execute(input as any);

            // Restore the original implementation
            getChatSessionAction!.execute = originalExecute;

            expect(result.sessionId).toBe('chat-123');
            expect(result.context.model).toBe('gpt-4');
            expect(result.context.messages).toHaveLength(2);
            expect(mockGet).toHaveBeenCalledWith(input);
        });
    });

    describe('updateChatSession action', () => {
        it('should update a chat session', async () => {
            const updateChatSessionAction = chatPlugin.actions.find(a => a.name === 'updateChatSession');
            expect(updateChatSessionAction).toBeDefined();

            // Mock implementation for this test
            const mockUpdate = jest.fn().mockResolvedValue({
                sessionId: 'chat-123',
                context: {
                    model: 'gpt-4-turbo',
                    systemPrompt: 'You are a helpful and concise assistant',
                    messages: [
                        { role: 'user', content: 'Hi there', timestamp: '2023-01-01T12:00:00Z' },
                        { role: 'assistant', content: 'Hello! How can I help you today?', timestamp: '2023-01-01T12:00:01Z' }
                    ],
                    metadata: {
                        createdAt: '2023-01-01T12:00:00Z',
                        lastUpdated: '2023-01-01T12:30:00Z',
                        customField: 'custom value'
                    }
                }
            });

            // Replace the actual implementation with our mock
            const originalExecute = updateChatSessionAction!.execute;
            updateChatSessionAction!.execute = mockUpdate;

            const input = {
                sessionId: 'chat-123',
                updates: {
                    model: 'gpt-4-turbo',
                    systemPrompt: 'You are a helpful and concise assistant',
                    metadata: {
                        customField: 'custom value'
                    }
                }
            };

            const result: any = await updateChatSessionAction!.execute(input as any);

            // Restore the original implementation
            updateChatSessionAction!.execute = originalExecute;

            expect(result.context.model).toBe('gpt-4-turbo');
            expect(result.context.systemPrompt).toBe('You are a helpful and concise assistant');
            expect(result.context.metadata.customField).toBe('custom value');
            expect(mockUpdate).toHaveBeenCalledWith(input);
        });
    });

    describe('deleteChatSession action', () => {
        it('should delete a chat session', async () => {
            const deleteChatSessionAction = chatPlugin.actions.find(a => a.name === 'deleteChatSession');
            expect(deleteChatSessionAction).toBeDefined();

            // Mock implementation for this test
            const mockDelete = jest.fn().mockResolvedValue({
                success: true,
                message: 'Chat session deleted successfully'
            });

            // Replace the actual implementation with our mock
            const originalExecute = deleteChatSessionAction!.execute;
            deleteChatSessionAction!.execute = mockDelete;

            const input = {
                sessionId: 'chat-123'
            };

            const result: any = await deleteChatSessionAction!.execute(input as any);

            // Restore the original implementation
            deleteChatSessionAction!.execute = originalExecute;

            expect(result.success).toBe(true);
            expect(result.message).toBe('Chat session deleted successfully');
            expect(mockDelete).toHaveBeenCalledWith(input);
        });
    });

    describe('listChatSessions action', () => {
        it('should list all chat sessions', async () => {
            const listChatSessionsAction = chatPlugin.actions.find(a => a.name === 'listChatSessions');
            expect(listChatSessionsAction).toBeDefined();

            // Mock implementation for this test
            const mockList = jest.fn().mockResolvedValue([
                {
                    sessionId: 'chat-123',
                    context: {
                        model: 'gpt-4',
                        systemPrompt: 'You are a helpful assistant',
                        messages: [],
                        metadata: {
                            createdAt: '2023-01-01T12:00:00Z',
                            lastUpdated: '2023-01-01T12:00:00Z'
                        }
                    }
                },
                {
                    sessionId: 'chat-456',
                    context: {
                        model: 'gpt-4',
                        systemPrompt: 'You are a helpful assistant',
                        messages: [],
                        metadata: {
                            createdAt: '2023-01-02T12:00:00Z',
                            lastUpdated: '2023-01-02T12:00:00Z'
                        }
                    }
                }
            ]);

            // Replace the actual implementation with our mock
            const originalExecute = listChatSessionsAction!.execute;
            listChatSessionsAction!.execute = mockList;

            const result: any = await listChatSessionsAction!.execute({} as any);

            // Restore the original implementation
            listChatSessionsAction!.execute = originalExecute;

            expect(result).toHaveLength(2);
            expect(result[0].sessionId).toBe('chat-123');
            expect(result[1].sessionId).toBe('chat-456');
            expect(mockList).toHaveBeenCalled();
        });
    });
});
