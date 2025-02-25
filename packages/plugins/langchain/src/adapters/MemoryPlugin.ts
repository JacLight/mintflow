// plugins/MemoryPlugin.ts
import { RedisService } from '../services/RedisService.js';
import { ConfigService } from '../services/ConfigService.js';
import { logger } from '@mintflow/common';

/**
 * Memory options for configuring memory behavior
 */
interface MemoryOptions {
    maxMessages?: number; // Maximum number of messages to keep in buffer
    summarizeThreshold?: number; // Number of messages that triggers summarization
    ttl?: number; // Time to live in seconds for memory
    namespace?: string; // Namespace for multi-tenant isolation
}

/**
 * Memory state interface for storing in Redis
 */
interface MemoryState {
    messages: Message[];
    summary?: string;
    metadata: Record<string, any>;
    lastUpdated: Date;
    threadId?: string;
}

/**
 * Message interface for conversation history
 */
interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp?: Date;
    metadata?: Record<string, any>;
}

export class MemoryService {
    private static instance: MemoryService;
    private redis = RedisService.getInstance();
    private config = ConfigService.getInstance().getConfig();

    private constructor() { }

    static getInstance(): MemoryService {
        if (!MemoryService.instance) {
            MemoryService.instance = new MemoryService();
        }
        return MemoryService.instance;
    }

    /**
     * Creates a new conversation memory
     */
    async createMemory(
        key: string,
        initialMessages: Message[] = [],
        options: MemoryOptions = {}
    ): Promise<string> {
        const memoryState: MemoryState = {
            messages: initialMessages,
            metadata: {
                options: {
                    maxMessages: options.maxMessages || 50,
                    summarizeThreshold: options.summarizeThreshold || 30,
                    ttl: options.ttl || 60 * 60 * 24 * 30, // Default 30 days
                    namespace: options.namespace || 'default'
                }
            },
            lastUpdated: new Date()
        };

        const memoryKey = this.getMemoryKey(key, options.namespace);
        await this.redis.client.set(memoryKey, JSON.stringify(memoryState));

        // Set TTL if specified
        if (options.ttl) {
            await this.redis.client.expire(memoryKey, options.ttl);
        }

        return key;
    }

    /**
     * Adds a message to the conversation memory
     */
    async addMessage(
        key: string,
        message: Message,
        namespace?: string
    ): Promise<MemoryState> {
        const memoryKey = this.getMemoryKey(key, namespace);
        let memoryState = await this.getMemory(key, namespace);

        if (!memoryState) {
            // Create a new memory if it doesn't exist
            await this.createMemory(key, [], { namespace });
            memoryState = await this.getMemory(key, namespace);

            if (!memoryState) {
                throw new Error(`Failed to create memory for key: ${key}`);
            }
        }

        // Add timestamp if not provided
        if (!message.timestamp) {
            message.timestamp = new Date();
        }

        // Add message to the history
        memoryState.messages.push(message);
        memoryState.lastUpdated = new Date();

        // Check if we need to summarize based on threshold
        const options = memoryState.metadata.options;
        if (options.summarizeThreshold &&
            memoryState.messages.length >= options.summarizeThreshold) {
            await this.summarizeMemory(key, namespace);
            // Reload memory after summarization
            memoryState = (await this.getMemory(key, namespace))!;
        }
        // Trim to max messages if needed
        else if (options.maxMessages &&
            memoryState.messages.length > options.maxMessages) {
            memoryState.messages = memoryState.messages.slice(-options.maxMessages);
        }

        // Save updated memory
        await this.redis.client.set(memoryKey, JSON.stringify(memoryState));

        // Reset TTL if specified
        if (options.ttl) {
            await this.redis.client.expire(memoryKey, options.ttl);
        }

        return memoryState;
    }

    /**
     * Retrieves the conversation memory
     */
    async getMemory(key: string, namespace?: string): Promise<MemoryState | null> {
        const memoryKey = this.getMemoryKey(key, namespace);
        const data = await this.redis.client.get(memoryKey);

        if (!data) return null;

        try {
            return JSON.parse(data) as MemoryState;
        } catch (error) {
            logger.error(`Error parsing memory state for key: ${memoryKey}`, error);
            return null;
        }
    }

    /**
     * Gets a window of recent messages from memory
     */
    async getRecentMessages(
        key: string,
        count: number = 10,
        namespace?: string
    ): Promise<Message[]> {
        const memory = await this.getMemory(key, namespace);
        if (!memory) return [];

        // Get the most recent messages
        return memory.messages.slice(-count);
    }

    /**
     * Summarizes the conversation memory to reduce token usage
     */
    async summarizeMemory(
        key: string,
        namespace?: string
    ): Promise<void> {
        const memoryKey = this.getMemoryKey(key, namespace);
        const memory = await this.getMemory(key, namespace);

        if (!memory) return;

        try {
            // First attempt: if we already have a summary, keep only
            // the summary as a system message and the most recent messages
            if (memory.summary) {
                const options = memory.metadata.options;
                const recentMessageCount = Math.min(
                    Math.floor(options.maxMessages / 2),
                    memory.messages.length
                );

                const recentMessages = memory.messages.slice(-recentMessageCount);

                // Create a new system message with the existing summary
                const summaryMessage: Message = {
                    role: 'system',
                    content: `Previous conversation summary: ${memory.summary}`,
                    timestamp: new Date()
                };

                // Replace the conversation with summary + recent messages
                memory.messages = [summaryMessage, ...recentMessages];
            }
            // If no existing summary, generate one using our AI service
            // In a real implementation, you'd call your AI plugin here
            else {
                // For demonstration, we'll just truncate old messages
                const options = memory.metadata.options;
                const keepMessages = Math.min(
                    Math.ceil(options.maxMessages / 2),
                    memory.messages.length
                );

                // Extract older messages that will be summarized
                const oldMessages = memory.messages.slice(0, -keepMessages);
                const recentMessages = memory.messages.slice(-keepMessages);

                // Generate a placeholder summary
                // In production, you'd generate this with an AI call
                const summaryContent = `This conversation had ${oldMessages.length} earlier messages`;
                memory.summary = summaryContent;

                // Create a summary message
                const summaryMessage: Message = {
                    role: 'system',
                    content: `Previous conversation summary: ${summaryContent}`,
                    timestamp: new Date()
                };

                // Replace the conversation with summary + recent messages
                memory.messages = [summaryMessage, ...recentMessages];
            }

            // Save the updated memory
            await this.redis.client.set(memoryKey, JSON.stringify(memory));

        } catch (error) {
            logger.error(`Error summarizing memory for key: ${memoryKey}`, error);
        }
    }

    /**
     * Clears the conversation memory
     */
    async clearMemory(key: string, namespace?: string): Promise<void> {
        const memoryKey = this.getMemoryKey(key, namespace);
        await this.redis.client.del(memoryKey);
    }

    /**
     * Updates metadata for the memory
     */
    async updateMetadata(
        key: string,
        metadata: Record<string, any>,
        namespace?: string
    ): Promise<void> {
        const memoryKey = this.getMemoryKey(key, namespace);
        const memory = await this.getMemory(key, namespace);

        if (!memory) return;

        memory.metadata = {
            ...memory.metadata,
            ...metadata
        };
        memory.lastUpdated = new Date();

        await this.redis.client.set(memoryKey, JSON.stringify(memory));
    }

    /**
     * Formats the memory key with optional namespace
     */
    private getMemoryKey(key: string, namespace?: string): string {
        const ns = namespace || 'default';
        return `memory:${ns}:${key}`;
    }

    /**
     * Optimizes context window usage by selecting relevant messages
     */
    async optimizeContext(
        key: string,
        maxTokens: number = 4000,
        namespace?: string
    ): Promise<Message[]> {
        const memory = await this.getMemory(key, namespace);
        if (!memory) return [];

        // Simple estimation: ~4 chars per token on average
        const estimateTokens = (text: string): number => {
            return Math.ceil(text.length / 4);
        };

        // Keep track of token usage
        let tokenCount = 0;
        const selectedMessages: Message[] = [];

        // Always include summary if available
        if (memory.summary) {
            const summaryMessage: Message = {
                role: 'system',
                content: `Previous conversation summary: ${memory.summary}`,
                timestamp: new Date()
            };

            const summaryTokens = estimateTokens(summaryMessage.content);
            if (summaryTokens < maxTokens) {
                selectedMessages.push(summaryMessage);
                tokenCount += summaryTokens;
            }
        }

        // Start from most recent and work backwards
        const reversedMessages = [...memory.messages].reverse();

        for (const message of reversedMessages) {
            const messageTokens = estimateTokens(message.content);

            // Skip if this message alone exceeds our limit
            if (messageTokens > maxTokens) continue;

            // Add message if it fits within our token budget
            if (tokenCount + messageTokens <= maxTokens) {
                selectedMessages.unshift(message); // Add to beginning to maintain chronological order
                tokenCount += messageTokens;
            } else {
                // Stop once we've exceeded the token limit
                break;
            }
        }

        return selectedMessages;
    }
}




const memoryPlugin = {
    id: "memory",
    name: "Memory Management Plugin",
    icon: "GiMemory",
    description: "Manages conversation memory and context for AI interactions",
    documentation: "https://docs.example.com/memory",

    inputSchema: {
        key: { type: 'string' },
        namespace: { type: 'string' },
        message: {
            type: 'object',
            properties: {
                role: { type: 'string', enum: ['user', 'assistant', 'system'] },
                content: { type: 'string' },
                timestamp: { type: 'string' },
                metadata: { type: 'object' }
            },
            required: ['role', 'content']
        },
        count: { type: 'number' },
        maxTokens: { type: 'number' },
        metadata: { type: 'object' },
        options: {
            type: 'object',
            properties: {
                maxMessages: { type: 'number' },
                summarizeThreshold: { type: 'number' },
                ttl: { type: 'number' },
                namespace: { type: 'string' }
            }
        }
    },

    actions: [
        {
            name: 'createMemory',
            execute: async function (input: {
                key: string;
                initialMessages?: Message[];
                options?: MemoryOptions;
            }): Promise<string> {
                return MemoryService.getInstance().createMemory(
                    input.key,
                    input.initialMessages || [],
                    input.options || {}
                );
            }
        },
        {
            name: 'addMessage',
            execute: async function (input: {
                key: string;
                message: Message;
                namespace?: string;
            }): Promise<MemoryState> {
                return MemoryService.getInstance().addMessage(
                    input.key,
                    input.message,
                    input.namespace
                );
            }
        },
        {
            name: 'getMemory',
            execute: async function (input: {
                key: string;
                namespace?: string;
            }): Promise<MemoryState | null> {
                return MemoryService.getInstance().getMemory(
                    input.key,
                    input.namespace
                );
            }
        },
        {
            name: 'getRecentMessages',
            execute: async function (input: {
                key: string;
                count?: number;
                namespace?: string;
            }): Promise<Message[]> {
                return MemoryService.getInstance().getRecentMessages(
                    input.key,
                    input.count,
                    input.namespace
                );
            }
        },
        {
            name: 'summarizeMemory',
            execute: async function (input: {
                key: string;
                namespace?: string;
            }): Promise<void> {
                return MemoryService.getInstance().summarizeMemory(
                    input.key,
                    input.namespace
                );
            }
        },
        {
            name: 'clearMemory',
            execute: async function (input: {
                key: string;
                namespace?: string;
            }): Promise<void> {
                return MemoryService.getInstance().clearMemory(
                    input.key,
                    input.namespace
                );
            }
        },
        {
            name: 'updateMetadata',
            execute: async function (input: {
                key: string;
                metadata: Record<string, any>;
                namespace?: string;
            }): Promise<void> {
                return MemoryService.getInstance().updateMetadata(
                    input.key,
                    input.metadata,
                    input.namespace
                );
            }
        },
        {
            name: 'optimizeContext',
            execute: async function (input: {
                key: string;
                maxTokens?: number;
                namespace?: string;
            }): Promise<Message[]> {
                return MemoryService.getInstance().optimizeContext(
                    input.key,
                    input.maxTokens,
                    input.namespace
                );
            }
        }
    ]
};
export default memoryPlugin;