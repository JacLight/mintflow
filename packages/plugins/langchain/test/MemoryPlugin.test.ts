/// <reference types="jest" />

import memoryPlugin, { MemoryService, MemoryState, Message } from '../src/adapters/MemoryPlugin.js';
import { RedisService } from '../src/services/RedisService.js';

// Mock the RedisService
jest.mock('../src/services/RedisService.js', () => {
    const mockRedisClient = {
        set: jest.fn().mockResolvedValue('OK'),
        get: jest.fn(),
        del: jest.fn().mockResolvedValue(1),
        expire: jest.fn().mockResolvedValue(1),
        exists: jest.fn().mockResolvedValue(1),
        keys: jest.fn().mockResolvedValue([]),
    };

    return {
        RedisService: {
            getInstance: jest.fn().mockReturnValue({
                client: mockRedisClient
            })
        }
    };
});

// Mock the ConfigService
jest.mock('../src/services/ConfigService.js', () => {
    return {
        ConfigService: {
            getInstance: jest.fn().mockReturnValue({
                getConfig: jest.fn().mockReturnValue({
                    ai: {
                        provider: 'openai',
                        model: 'gpt-3.5-turbo'
                    }
                })
            })
        }
    };
});

describe('MemoryPlugin', () => {
    let redisClient: any;

    beforeEach(() => {
        // Reset mocks before each test
        jest.clearAllMocks();
        redisClient = RedisService.getInstance().client;
    });

    describe('createMemory action', () => {
        it('should create a new memory with default options', async () => {
            const createMemoryAction = memoryPlugin.actions.find(a => a.name === 'createMemory');
            expect(createMemoryAction).toBeDefined();

            const result = await createMemoryAction!.execute({
                key: 'test-memory'
            } as any);

            expect(result).toBe('test-memory');
            expect(redisClient.set).toHaveBeenCalledTimes(1);

            // Check that the memory was created with default options
            const setCall = redisClient.set.mock.calls[0];
            expect(setCall[0]).toBe('memory:default:test-memory');

            const memoryState = JSON.parse(setCall[1]);
            expect(memoryState.messages).toEqual([]);
            expect(memoryState.metadata.options.maxMessages).toBe(50);
            expect(memoryState.metadata.options.summarizeThreshold).toBe(30);
            expect(memoryState.metadata.options.ttl).toBe(60 * 60 * 24 * 30); // 30 days
        });

        it('should create a new memory with custom options', async () => {
            const createMemoryAction = memoryPlugin.actions.find(a => a.name === 'createMemory');

            const result = await createMemoryAction!.execute({
                key: 'test-memory',
                initialMessages: [{ role: 'system', content: 'Initial message' }],
                options: {
                    maxMessages: 10,
                    summarizeThreshold: 5,
                    ttl: 3600,
                    namespace: 'custom'
                }
            } as any);

            expect(result).toBe('test-memory');
            expect(redisClient.set).toHaveBeenCalledTimes(1);

            // Check that the memory was created with custom options
            const setCall = redisClient.set.mock.calls[0];
            expect(setCall[0]).toBe('memory:custom:test-memory');

            const memoryState = JSON.parse(setCall[1]);
            expect(memoryState.messages).toEqual([{ role: 'system', content: 'Initial message' }]);
            expect(memoryState.metadata.options.maxMessages).toBe(10);
            expect(memoryState.metadata.options.summarizeThreshold).toBe(5);
            expect(memoryState.metadata.options.ttl).toBe(3600);

            // Check that TTL was set
            expect(redisClient.expire).toHaveBeenCalledWith('memory:custom:test-memory', 3600);
        });
    });

    describe('addMessage action', () => {
        it('should add a message to existing memory', async () => {
            // Mock the getMemory response
            const mockMemoryState: MemoryState = {
                messages: [{ role: 'system', content: 'Initial message' }],
                metadata: {
                    options: {
                        maxMessages: 50,
                        summarizeThreshold: 30,
                        ttl: 60 * 60 * 24 * 30,
                        namespace: 'default'
                    }
                },
                lastUpdated: new Date()
            };

            redisClient.get.mockResolvedValueOnce(JSON.stringify(mockMemoryState));

            const addMessageAction = memoryPlugin.actions.find(a => a.name === 'addMessage');
            expect(addMessageAction).toBeDefined();

            const newMessage: Message = { role: 'user', content: 'Hello' };
            const result = await addMessageAction!.execute({
                key: 'test-memory',
                message: newMessage
            } as any);

            expect(result.messages).toHaveLength(2);
            expect(result.messages[0]).toEqual({ role: 'system', content: 'Initial message' });
            expect(result.messages[1].role).toBe('user');
            expect(result.messages[1].content).toBe('Hello');
            expect(result.messages[1].timestamp).toBeDefined();

            // Check that the updated memory was saved
            expect(redisClient.set).toHaveBeenCalledTimes(1);
            const setCall = redisClient.set.mock.calls[0];
            expect(setCall[0]).toBe('memory:default:test-memory');
        });

        it('should create a new memory if it does not exist', async () => {
            // Mock the getMemory response to return null (memory doesn't exist)
            redisClient.get.mockResolvedValueOnce(null);

            // Mock the second getMemory call after creation
            const newMemoryState: MemoryState = {
                messages: [],
                metadata: {
                    options: {
                        maxMessages: 50,
                        summarizeThreshold: 30,
                        ttl: 60 * 60 * 24 * 30,
                        namespace: 'default'
                    }
                },
                lastUpdated: new Date()
            };
            redisClient.get.mockResolvedValueOnce(JSON.stringify(newMemoryState));

            const addMessageAction = memoryPlugin.actions.find(a => a.name === 'addMessage');

            const newMessage: Message = { role: 'user', content: 'Hello' };
            await addMessageAction!.execute({
                key: 'test-memory',
                message: newMessage
            } as any);

            // Check that createMemory was called
            expect(redisClient.set).toHaveBeenCalledTimes(2);
            const firstSetCall = redisClient.set.mock.calls[0];
            expect(firstSetCall[0]).toBe('memory:default:test-memory');
        });

        it('should trim messages when exceeding maxMessages', async () => {
            // Create a memory state with maxMessages = 3 and 3 existing messages
            const mockMemoryState: MemoryState = {
                messages: [
                    { role: 'system', content: 'Message 1' },
                    { role: 'user', content: 'Message 2' },
                    { role: 'assistant', content: 'Message 3' }
                ],
                metadata: {
                    options: {
                        maxMessages: 3,
                        summarizeThreshold: 10,
                        ttl: 3600,
                        namespace: 'default'
                    }
                },
                lastUpdated: new Date()
            };

            redisClient.get.mockResolvedValueOnce(JSON.stringify(mockMemoryState));

            const addMessageAction = memoryPlugin.actions.find(a => a.name === 'addMessage');

            const newMessage: Message = { role: 'user', content: 'Message 4' };
            const result = await addMessageAction!.execute({
                key: 'test-memory',
                message: newMessage
            } as any);

            // Should have trimmed the oldest message
            expect(result.messages).toHaveLength(3);
            expect(result.messages[0].content).toBe('Message 2');
            expect(result.messages[1].content).toBe('Message 3');
            expect(result.messages[2].content).toBe('Message 4');
        });
    });

    describe('getMemory action', () => {
        it('should retrieve memory by key', async () => {
            const mockMemoryState: MemoryState = {
                messages: [{ role: 'system', content: 'Test message' }],
                metadata: {
                    options: {
                        maxMessages: 50,
                        summarizeThreshold: 30,
                        ttl: 3600,
                        namespace: 'default'
                    }
                },
                lastUpdated: new Date()
            };

            redisClient.get.mockResolvedValueOnce(JSON.stringify(mockMemoryState));

            const getMemoryAction = memoryPlugin.actions.find(a => a.name === 'getMemory');
            expect(getMemoryAction).toBeDefined();

            const result = await getMemoryAction!.execute({
                key: 'test-memory'
            } as any);

            expect(result).toEqual(mockMemoryState);
            expect(redisClient.get).toHaveBeenCalledWith('memory:default:test-memory');
        });

        it('should return null if memory does not exist', async () => {
            redisClient.get.mockResolvedValueOnce(null);

            const getMemoryAction = memoryPlugin.actions.find(a => a.name === 'getMemory');

            const result = await getMemoryAction!.execute({
                key: 'non-existent-memory'
            } as any);

            expect(result).toBeNull();
        });
    });

    describe('clearMemory action', () => {
        it('should delete memory by key', async () => {
            const clearMemoryAction = memoryPlugin.actions.find(a => a.name === 'clearMemory');
            expect(clearMemoryAction).toBeDefined();

            await clearMemoryAction!.execute({
                key: 'test-memory'
            } as any);

            expect(redisClient.del).toHaveBeenCalledWith('memory:default:test-memory');
        });
    });

    describe('getRecentMessages action', () => {
        it('should retrieve recent messages with default count', async () => {
            // Create a memory with 20 messages
            const messages: Message[] = Array.from({ length: 20 }, (_, i) => ({
                role: i % 2 === 0 ? 'user' : 'assistant',
                content: `Message ${i + 1}`
            }));

            const mockMemoryState: MemoryState = {
                messages,
                metadata: {
                    options: {
                        maxMessages: 50,
                        summarizeThreshold: 30,
                        ttl: 3600,
                        namespace: 'default'
                    }
                },
                lastUpdated: new Date()
            };

            redisClient.get.mockResolvedValueOnce(JSON.stringify(mockMemoryState));

            const getRecentMessagesAction = memoryPlugin.actions.find(a => a.name === 'getRecentMessages');
            expect(getRecentMessagesAction).toBeDefined();

            const result = await getRecentMessagesAction!.execute({
                key: 'test-memory'
            } as any);

            // Should return the 10 most recent messages by default
            expect(result).toHaveLength(10);
            expect(result[0].content).toBe('Message 11');
            expect(result[9].content).toBe('Message 20');
        });

        it('should retrieve specified number of recent messages', async () => {
            // Create a memory with 20 messages
            const messages: Message[] = Array.from({ length: 20 }, (_, i) => ({
                role: i % 2 === 0 ? 'user' : 'assistant',
                content: `Message ${i + 1}`
            }));

            const mockMemoryState: MemoryState = {
                messages,
                metadata: {
                    options: {
                        maxMessages: 50,
                        summarizeThreshold: 30,
                        ttl: 3600,
                        namespace: 'default'
                    }
                },
                lastUpdated: new Date()
            };

            redisClient.get.mockResolvedValueOnce(JSON.stringify(mockMemoryState));

            const getRecentMessagesAction = memoryPlugin.actions.find(a => a.name === 'getRecentMessages');

            const result = await getRecentMessagesAction!.execute({
                key: 'test-memory',
                count: 5
            } as any);

            // Should return the 5 most recent messages
            expect(result).toHaveLength(5);
            expect(result[0].content).toBe('Message 16');
            expect(result[4].content).toBe('Message 20');
        });
    });

    describe('optimizeContext action', () => {
        it('should select messages that fit within token limit', async () => {
            // Create messages with varying lengths
            const messages: Message[] = [
                { role: 'system', content: 'Short message' }, // ~3 tokens
                { role: 'user', content: 'A' + 'a'.repeat(1000) }, // ~250 tokens
                { role: 'assistant', content: 'B' + 'b'.repeat(2000) }, // ~500 tokens
                { role: 'user', content: 'C' + 'c'.repeat(4000) }, // ~1000 tokens
                { role: 'assistant', content: 'D' + 'd'.repeat(8000) }, // ~2000 tokens
                { role: 'user', content: 'E' + 'e'.repeat(400) } // ~100 tokens
            ];

            const mockMemoryState: MemoryState = {
                messages,
                metadata: {
                    options: {
                        maxMessages: 50,
                        summarizeThreshold: 30,
                        ttl: 3600,
                        namespace: 'default'
                    }
                },
                lastUpdated: new Date()
            };

            redisClient.get.mockResolvedValueOnce(JSON.stringify(mockMemoryState));

            const optimizeContextAction = memoryPlugin.actions.find(a => a.name === 'optimizeContext');
            expect(optimizeContextAction).toBeDefined();

            // Set a token limit of 1000
            const result = await optimizeContextAction!.execute({
                key: 'test-memory',
                maxTokens: 1000
            } as any);

            // Should include messages that fit within the token limit
            // Starting from the most recent and working backwards
            expect(result).toHaveLength(3);
            expect(result[0].content.startsWith('C')).toBeTruthy(); // ~1000 tokens
            expect(result[1].content.startsWith('B')).toBeTruthy(); // ~500 tokens
            expect(result[2].content.startsWith('E')).toBeTruthy(); // ~100 tokens
            // Total: ~1600 tokens, which exceeds 1000, but we stop once we exceed the limit
        });
    });
});
