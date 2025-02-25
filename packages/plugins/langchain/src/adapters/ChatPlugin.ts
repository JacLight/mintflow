// plugins/ChatPlugin.ts

import {
    AIPluginConfig,
    TextGenerationResponse
} from '../interface/index.js';
import { logger } from '@mintflow/common';
import { RedisService } from '../services/RedisService.js';
import { ConfigService } from '../services/ConfigService.js';

/**
 * Message interface for conversation
 */
export interface ChatMessage {
    role: 'user' | 'assistant' | 'system' | 'function' | 'human_agent';
    content: string | null;
    name?: string;
    function_call?: {
        name: string;
        arguments: string;
    };
    metadata?: {
        timestamp?: Date;
        userId?: string;
        agentId?: string;
        embedding?: number[];
        handoffReason?: string;
        error?: string;
    };
}

/**
 * Tool interface for chat function calling
 */
export interface ChatTool {
    name: string;
    description: string;
    parameters: {
        type: string;
        properties: Record<string, any>;
        required?: string[];
    };
    execute: (params: Record<string, any>, context: ChatSessionContext) => Promise<any>;
}

/**
 * Chat memory options
 */
export interface ChatMemoryOptions {
    useEmbeddings?: boolean;
    maxMessages?: number;
    summarizeThreshold?: number;
    ttl?: number;
    namespace?: string;
}

/**
 * Session context for a chat conversation
 */
export interface ChatSessionContext {
    sessionId: string;
    userId: string;
    metadata: Record<string, any>;
    status: 'active' | 'waiting_for_human' | 'with_human' | 'ended';
    humanAgentId?: string;
    customData?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Chat service for handling conversations with memory, tools, and human handoff
 */
export class ChatService {
    private static instance: ChatService;
    private redis = RedisService.getInstance();
    private config = ConfigService.getInstance().getConfig();
    private tools: Map<string, ChatTool> = new Map();

    private constructor() {
        // Register default tools
        this.registerTool(this.getHumanHandoffTool());
    }

    static getInstance(): ChatService {
        if (!ChatService.instance) {
            ChatService.instance = new ChatService();
        }
        return ChatService.instance;
    }

    /**
     * Creates a new chat session
     */
    async createChatSession(
        userId: string,
        initialContext?: Record<string, any>,
        initialSystemMessage?: string
    ): Promise<string> {
        const sessionId = `chat-${userId}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        // Create session context
        const context: ChatSessionContext = {
            sessionId,
            userId,
            metadata: initialContext || {},
            status: 'active',
            customData: {},
            createdAt: new Date(),
            updatedAt: new Date()
        };

        // Save session context
        await this.saveSessionContext(sessionId, context);

        // Initialize memory with system message if provided
        if (initialSystemMessage) {
            await this.addMessage(sessionId, {
                role: 'system',
                content: initialSystemMessage
            });
        }

        return sessionId;
    }

    /**
     * Registers a tool for use in chat
     */
    registerTool(tool: ChatTool): void {
        this.tools.set(tool.name, tool);
        logger.info(`Registered chat tool: ${tool.name}`);
    }

    /**
     * Gets all available tools
     */
    getTools(): ChatTool[] {
        return Array.from(this.tools.values());
    }

    /**
     * Gets a specific tool by name
     */
    getTool(name: string): ChatTool | undefined {
        return this.tools.get(name);
    }

    /**
     * Gets enabled tools for a specific session (could be customized per session)
     */
    async getEnabledTools(sessionId: string): Promise<ChatTool[]> {
        const context = await this.getSessionContext(sessionId);
        if (!context) return this.getTools();

        // Check if the session has specific tool restrictions
        if (context.metadata.enabledTools) {
            return context.metadata.enabledTools
                .map((name: string) => this.tools.get(name))
                .filter(Boolean);
        }

        // Default to all tools
        return this.getTools();
    }

    /**
     * Gets session context
     */
    async getSessionContext(sessionId: string): Promise<ChatSessionContext | null> {
        const key = `chat:session:${sessionId}`;
        const data = await this.redis.client.get(key);

        if (!data) return null;

        try {
            return JSON.parse(data) as ChatSessionContext;
        } catch (error) {
            logger.error(`Error parsing session context for ${sessionId}:`, error);
            return null;
        }
    }

    /**
     * Saves session context
     */
    private async saveSessionContext(sessionId: string, context: ChatSessionContext): Promise<void> {
        const key = `chat:session:${sessionId}`;
        await this.redis.client.set(key, JSON.stringify(context));
    }

    /**
     * Updates session context
     */
    async updateSessionContext(
        sessionId: string,
        updates: Partial<ChatSessionContext>
    ): Promise<ChatSessionContext> {
        const context = await this.getSessionContext(sessionId);
        if (!context) {
            throw new Error(`Session not found: ${sessionId}`);
        }

        const updatedContext: ChatSessionContext = {
            ...context,
            ...updates,
            updatedAt: new Date()
        };

        await this.saveSessionContext(sessionId, updatedContext);
        return updatedContext;
    }

    /**
     * Adds a message to the chat history
     */
    async addMessage(
        sessionId: string,
        message: ChatMessage,
        options?: ChatMemoryOptions
    ): Promise<void> {
        const memoryKey = `chat:memory:${sessionId}`;

        // Get existing messages
        const messages = await this.getMessages(sessionId);

        // Add timestamp if not provided
        if (!message.metadata) {
            message.metadata = {};
        }
        if (!message.metadata.timestamp) {
            message.metadata.timestamp = new Date();
        }

        // Use embeddings if enabled
        if (options?.useEmbeddings !== false) {
            // Generate embedding for message content
            try {
                message.metadata.embedding = await this.generateEmbedding(message.content);
            } catch (error) {
                logger.error(`Error generating embedding for message in ${sessionId}:`, error);
            }
        }

        // Add message to history
        messages.push(message);

        // Apply memory management
        const opts = {
            maxMessages: options?.maxMessages || 100,
            summarizeThreshold: options?.summarizeThreshold || 50,
            ttl: options?.ttl || 60 * 60 * 24 * 30 // 30 days default
        };

        // Check if we need to summarize
        let finalMessages = messages;
        if (messages.length >= opts.summarizeThreshold) {
            finalMessages = await this.summarizeMessages(sessionId, messages);
        }

        // Or just trim to max messages
        else if (messages.length > opts.maxMessages) {
            finalMessages = messages.slice(-opts.maxMessages);
        }

        // Save messages
        await this.redis.client.set(memoryKey, JSON.stringify(finalMessages));

        // Set TTL if specified
        if (opts.ttl) {
            await this.redis.client.expire(memoryKey, opts.ttl);
        }

        // Update session context
        await this.updateSessionContext(sessionId, { updatedAt: new Date() });
    }

    /**
     * Gets all messages for a session
     */
    async getMessages(sessionId: string): Promise<ChatMessage[]> {
        const memoryKey = `chat:memory:${sessionId}`;
        const data = await this.redis.client.get(memoryKey);

        if (!data) return [];

        try {
            return JSON.parse(data) as ChatMessage[];
        } catch (error) {
            logger.error(`Error parsing messages for ${sessionId}:`, error);
            return [];
        }
    }

    /**
     * Gets recent messages within a count limit
     */
    async getRecentMessages(
        sessionId: string,
        count: number = 10
    ): Promise<ChatMessage[]> {
        const messages = await this.getMessages(sessionId);
        return messages.slice(-count);
    }

    /**
     * Gets relevant messages using embeddings
     */
    async getRelevantMessages(
        sessionId: string,
        query: string,
        count: number = 5
    ): Promise<ChatMessage[]> {
        const messages = await this.getMessages(sessionId);

        // Filter messages that have embeddings
        const messagesWithEmbeddings = messages.filter(
            msg => msg.metadata?.embedding && Array.isArray(msg.metadata.embedding)
        );

        if (messagesWithEmbeddings.length === 0) {
            // Fall back to recent messages if no embeddings
            return this.getRecentMessages(sessionId, count);
        }

        try {
            // Generate embedding for query
            const queryEmbedding = await this.generateEmbedding(query);

            // Calculate similarity scores
            const scoredMessages = messagesWithEmbeddings.map(msg => ({
                message: msg,
                score: this.cosineSimilarity(queryEmbedding, msg.metadata!.embedding!)
            }));

            // Sort by similarity (highest first) and take top results
            return scoredMessages
                .sort((a, b) => b.score - a.score)
                .slice(0, count)
                .map(item => item.message);

        } catch (error) {
            logger.error(`Error finding relevant messages for ${sessionId}:`, error);
            return this.getRecentMessages(sessionId, count);
        }
    }

    /**
     * Generates embedding for text
     */
    private async generateEmbedding(text: string | null): Promise<number[]> {
        try {
            // Handle null content
            if (text === null) {
                text = '';
            }

            // TODO: In production, call your AI embedding provider here

            // Mock implementation - replace with actual embedding API call
            // This would use your existing AI plugin in actual implementation
            return Array.from(
                { length: 1536 },
                () => Math.random() * 2 - 1
            );
        } catch (error) {
            logger.error('Error generating embedding:', error);
            throw error;
        }
    }

    /**
     * Calculates cosine similarity between two embeddings
     */
    private cosineSimilarity(a: number[], b: number[]): number {
        if (a.length !== b.length) {
            throw new Error('Vectors must have the same length');
        }

        let dotProduct = 0;
        let aMagnitude = 0;
        let bMagnitude = 0;

        for (let i = 0; i < a.length; i++) {
            dotProduct += a[i] * b[i];
            aMagnitude += a[i] * a[i];
            bMagnitude += b[i] * b[i];
        }

        aMagnitude = Math.sqrt(aMagnitude);
        bMagnitude = Math.sqrt(bMagnitude);

        if (aMagnitude === 0 || bMagnitude === 0) {
            return 0;
        }

        return dotProduct / (aMagnitude * bMagnitude);
    }

    /**
     * Summarizes messages to reduce context size
     */
    private async summarizeMessages(
        sessionId: string,
        messages: ChatMessage[]
    ): Promise<ChatMessage[]> {
        try {
            // In production, this would call your AI model to generate a summary
            // For now, we'll just keep the system messages and most recent messages

            const systemMessages = messages.filter(msg => msg.role === 'system');
            const recentCount = Math.min(20, messages.length / 2);
            const recentMessages = messages.slice(-recentCount);

            // Create a summary message
            const summaryMessage: ChatMessage = {
                role: 'system',
                content: `This conversation contains ${messages.length} previous messages that have been summarized.`,
                metadata: {
                    timestamp: new Date()
                }
            };

            return [...systemMessages, summaryMessage, ...recentMessages];
        } catch (error) {
            logger.error(`Error summarizing messages for ${sessionId}:`, error);

            // If summarization fails, just return most recent messages
            return messages.slice(-50);
        }
    }

    /**
     * Sends a message and gets a response
     */
    async sendMessage(
        sessionId: string,
        message: string,
        aiConfig: AIPluginConfig & {
            provider?: string;
            model: string;
            temperature?: number;
            maxTokens?: number;
        }
    ): Promise<{
        response: ChatMessage;
        handoff?: {
            requested: boolean;
            reason?: string;
        };
    }> {
        // Get session context
        const context = await this.getSessionContext(sessionId);
        if (!context) {
            throw new Error(`Session not found: ${sessionId}`);
        }

        // If session is with human agent, route to human
        if (context.status === 'with_human' || context.status === 'waiting_for_human') {
            return this.routeToHuman(sessionId, message, context);
        }

        // Add user message to history
        const userMessage: ChatMessage = {
            role: 'user',
            content: message,
            metadata: {
                userId: context.userId,
                timestamp: new Date()
            }
        };

        await this.addMessage(sessionId, userMessage);

        // Get recent messages for context
        const recentMessages = await this.getRecentMessages(sessionId, 20);

        // Get enabled tools
        const enabledTools = await this.getEnabledTools(sessionId);

        // Format tools for the AI model if any are available
        const tools = enabledTools.map(tool => ({
            type: 'function',
            function: {
                name: tool.name,
                description: tool.description,
                parameters: tool.parameters
            }
        }));

        // Prepare the API request
        try {
            // In production, call your AI service here
            // Mock implementation - replace with actual AI API call
            const aiResponse = await this.mockAIResponse(
                recentMessages,
                tools.length > 0 ? tools : undefined,
                message
            );

            // Check if the response is a function call
            if (aiResponse.function_call) {
                // Process function call
                const functionResult = await this.executeTool(
                    sessionId,
                    aiResponse.function_call.name,
                    JSON.parse(aiResponse.function_call.arguments),
                    context
                );

                // Add function result to history
                const functionMessage: ChatMessage = {
                    role: 'function',
                    name: aiResponse.function_call.name,
                    content: JSON.stringify(functionResult)
                };

                await this.addMessage(sessionId, functionMessage);

                // Check for human handoff request
                if (
                    aiResponse.function_call.name === 'transferToHuman' &&
                    functionResult.status === 'queued'
                ) {
                    // Update session status
                    await this.updateSessionContext(sessionId, {
                        status: 'waiting_for_human',
                        metadata: {
                            ...context.metadata,
                            handoffReason: JSON.parse(aiResponse.function_call.arguments).reason
                        }
                    });

                    // Return handoff information
                    return {
                        response: {
                            role: 'assistant',
                            content: functionResult.message || 'I\'m transferring you to a human agent. Please wait a moment.',
                            metadata: {
                                timestamp: new Date()
                            }
                        },
                        handoff: {
                            requested: true,
                            reason: JSON.parse(aiResponse.function_call.arguments).reason
                        }
                    };
                }

                // For other function calls, generate a follow-up response
                // In production, you'd call the AI again with the function result
                const followUpResponse: ChatMessage = {
                    role: 'assistant',
                    content: `I've processed your request. ${functionResult.message || JSON.stringify(functionResult)}`,
                    metadata: {
                        timestamp: new Date()
                    }
                };

                await this.addMessage(sessionId, followUpResponse);

                return {
                    response: followUpResponse
                };
            }

            // Normal text response
            const assistantMessage: ChatMessage = {
                role: 'assistant',
                content: aiResponse.content,
                metadata: {
                    timestamp: new Date()
                }
            };

            await this.addMessage(sessionId, assistantMessage);

            return {
                response: assistantMessage
            };
        } catch (error) {
            logger.error(`Error in AI response for ${sessionId}:`, error);

            // Return error message
            const errorMessage: ChatMessage = {
                role: 'assistant',
                content: 'I\'m sorry, I encountered an error processing your message.Please try again.',
                metadata: {
                    timestamp: new Date(),
                    error: String(error)
                }
            };

            await this.addMessage(sessionId, errorMessage);

            return {
                response: errorMessage
            };
        }
    }

    /**
     * Routes a message to a human agent
     */
    private async routeToHuman(
        sessionId: string,
        message: string,
        context: ChatSessionContext
    ): Promise<{
        response: ChatMessage;
        handoff?: {
            requested: boolean;
            reason?: string;
        };
    }> {
        // Add user message to history
        const userMessage: ChatMessage = {
            role: 'user',
            content: message,
            metadata: {
                userId: context.userId,
                timestamp: new Date()
            }
        };

        await this.addMessage(sessionId, userMessage);

        // If no human agent assigned yet
        if (context.status === 'waiting_for_human') {
            const waitingMessage: ChatMessage = {
                role: 'assistant',
                content: 'You\'re still in the queue waiting for a human agent. We appreciate your patience.',
                metadata: {
                    timestamp: new Date()
                }
            };

            await this.addMessage(sessionId, waitingMessage);

            return {
                response: waitingMessage,
                handoff: {
                    requested: true,
                    reason: context.metadata.handoffReason
                }
            };
        }

        // If human agent is assigned, store message for them
        // In production, this would notify the human agent of the new message

        // Mock waiting response
        const humanResponse: ChatMessage = {
            role: 'human_agent',
            content: 'I\'ve received your message and am reviewing your situation. I\'ll respond shortly.',
            name: 'Agent',
            metadata: {
                agentId: context.humanAgentId,
                timestamp: new Date()
            }
        };

        await this.addMessage(sessionId, humanResponse);

        return {
            response: humanResponse
        };
    }

    /**
     * Executes a chat tool
     */
    async executeTool(
        sessionId: string,
        toolName: string,
        params: Record<string, any>,
        context: ChatSessionContext
    ): Promise<any> {
        const tool = this.tools.get(toolName);
        if (!tool) {
            throw new Error(`Tool not found: ${toolName}`);
        }

        try {
            // Execute the tool
            return await tool.execute(params, context);
        } catch (error) {
            logger.error(`Error executing tool ${toolName}:`, error);
            throw error;
        }
    }

    /**
     * Human agent takes over a chat
     */
    async humanTakeoverChat(
        sessionId: string,
        agentId: string,
        agentName: string
    ): Promise<ChatSessionContext> {
        const context = await this.getSessionContext(sessionId);
        if (!context) {
            throw new Error(`Session not found: ${sessionId}`);
        }

        if (context.status !== 'waiting_for_human') {
            throw new Error(`Chat session ${sessionId} is not waiting for human takeover`);
        }

        // Update session status
        const updatedContext = await this.updateSessionContext(sessionId, {
            status: 'with_human',
            humanAgentId: agentId
        });

        // Add notification message
        const takeoverMessage: ChatMessage = {
            role: 'human_agent',
            content: `${agentName} has joined the conversation and will assist you.`,
            name: agentName,
            metadata: {
                agentId,
                timestamp: new Date()
            }
        };

        await this.addMessage(sessionId, takeoverMessage);

        return updatedContext;
    }

    /**
     * Human agent sends a message
     */
    async sendHumanAgentMessage(
        sessionId: string,
        message: string,
        agentId: string,
        agentName: string
    ): Promise<void> {
        const context = await this.getSessionContext(sessionId);
        if (!context) {
            throw new Error(`Session not found: ${sessionId}`);
        }

        if (context.status !== 'with_human' || context.humanAgentId !== agentId) {
            throw new Error(`Agent ${agentId} is not assigned to chat session ${sessionId}`);
        }

        // Add human agent message
        const agentMessage: ChatMessage = {
            role: 'human_agent',
            content: message,
            name: agentName,
            metadata: {
                agentId,
                timestamp: new Date()
            }
        };

        await this.addMessage(sessionId, agentMessage);
    }

    /**
     * Human agent transfers chat back to AI
     */
    async transferToAI(
        sessionId: string,
        agentId: string,
        transferMessage?: string
    ): Promise<ChatSessionContext> {
        const context = await this.getSessionContext(sessionId);
        if (!context) {
            throw new Error(`Session not found: ${sessionId}`);
        }

        if (context.status !== 'with_human' || context.humanAgentId !== agentId) {
            throw new Error(`Agent ${agentId} is not assigned to chat session ${sessionId}`);
        }

        // Add transfer message if provided
        if (transferMessage) {
            const message: ChatMessage = {
                role: 'human_agent',
                content: transferMessage,
                metadata: {
                    agentId,
                    timestamp: new Date()
                }
            };

            await this.addMessage(sessionId, message);
        }

        // Add system notification
        const systemMessage: ChatMessage = {
            role: 'system',
            content: 'This conversation has been transferred back to the AI assistant.',
            metadata: {
                timestamp: new Date()
            }
        };

        await this.addMessage(sessionId, systemMessage);

        // Update session status
        return this.updateSessionContext(sessionId, {
            status: 'active',
            humanAgentId: undefined
        });
    }

    /**
     * Mock AI response for development
     */
    private async mockAIResponse(
        messages: ChatMessage[],
        tools?: any[],
        latestMessage?: string
    ): Promise<{
        content: string | null;
        function_call?: {
            name: string;
            arguments: string;
        };
    }> {
        // Check if this is a request that should trigger human handoff
        const triggerHandoffKeywords = [
            'speak to human', 'talk to agent', 'human agent',
            'real person', 'customer service', 'representative'
        ];

        if (latestMessage && triggerHandoffKeywords.some(kw => latestMessage.toLowerCase().includes(kw))) {
            return {
                content: null,
                function_call: {
                    name: 'transferToHuman',
                    arguments: JSON.stringify({
                        reason: 'Customer explicitly requested human assistance',
                        urgency: 'medium'
                    })
                }
            };
        }

        // Generate a simple response based on the latest message
        return {
            content: `I understand your message about "${latestMessage?.substring(0, 30)}...". How else can I help you?`
        };
    }

    /**
     * Default human handoff tool
     */
    private getHumanHandoffTool(): ChatTool {
        return {
            name: 'transferToHuman',
            description: 'Transfer this conversation to a human support agent',
            parameters: {
                type: 'object',
                properties: {
                    reason: {
                        type: 'string',
                        description: 'Reason for transferring to human'
                    },
                    urgency: {
                        type: 'string',
                        enum: ['low', 'medium', 'high'],
                        description: 'Urgency level of the request'
                    }
                },
                required: ['reason']
            },
            execute: async (params, context) => {
                // In production, this would queue the conversation for a human agent
                // For demo purposes, we'll mock the response

                // Track handoff reason
                await this.updateSessionContext(context.sessionId, {
                    metadata: {
                        ...context.metadata,
                        handoffReason: params.reason,
                        handoffUrgency: params.urgency || 'medium'
                    }
                });

                // Return standard response
                return {
                    status: 'queued',
                    estimatedWaitTime: '2-5 minutes',
                    ticketId: `ticket-${Date.now()}`,
                    message: 'I\'m transferring you to a human agent who can better assist you. Please wait a few moments while I connect you.'
                };
            }
        };
    }
}

// Create a singleton instance
const chatService = ChatService.getInstance();
// Register default tools
const weatherTool: ChatTool = {
    name: 'getWeather',
    description: 'Get current weather for a location',
    parameters: {
        type: 'object',
        properties: {
            location: {
                type: 'string',
                description: 'City and state/country'
            }
        },
        required: ['location']
    },
    execute: async (params) => {
        // Mock weather data - in production, call a weather API
        return {
            location: params.location,
            temperature: Math.floor(Math.random() * 30) + 10,
            conditions: ['Sunny', 'Cloudy', 'Rainy', 'Snowy'][Math.floor(Math.random() * 4)],
            humidity: Math.floor(Math.random() * 50) + 30
        };
    }
};

chatService.registerTool(weatherTool);

// Plugin definition for integration with workflow engine
const chatPlugin = {
    id: "chat",
    name: "Chat Plugin",
    icon: "GiChat",
    description: "Manages chat conversations with memory, tools, and human handoff",
    documentation: "https://docs.example.com/chat",

    inputSchema: {
        userId: { type: 'string' },
        sessionId: { type: 'string' },
        message: { type: 'string' },
        initialContext: { type: 'object' },
        initialSystemMessage: { type: 'string' },
        config: { type: 'object' },
        provider: { type: 'string' },
        model: { type: 'string' },
        temperature: { type: 'number' },
        maxTokens: { type: 'number' },
        agentId: { type: 'string' },
        agentName: { type: 'string' },
        transferMessage: { type: 'string' },
        tool: { type: 'object' },
        toolName: { type: 'string' },
        params: { type: 'object' },
        count: { type: 'number' },
        query: { type: 'string' },
        updates: { type: 'object' }
    },

    actions: [
        {
            name: 'createChatSession',
            execute: async function (input: {
                userId: string;
                initialContext?: Record<string, any>;
                initialSystemMessage?: string;
            }): Promise<string> {
                return chatService.createChatSession(
                    input.userId,
                    input.initialContext,
                    input.initialSystemMessage
                );
            }
        },
        {
            name: 'sendMessage',
            execute: async function (input: {
                sessionId: string;
                message: string;
                config: AIPluginConfig & {
                    provider?: string;
                    model: string;
                    temperature?: number;
                    maxTokens?: number;
                };
            }): Promise<{
                response: ChatMessage;
                handoff?: {
                    requested: boolean;
                    reason?: string;
                };
            }> {
                return chatService.sendMessage(
                    input.sessionId,
                    input.message,
                    input.config
                );
            }
        },
        {
            name: 'getMessages',
            execute: async function (input: {
                sessionId: string;
            }): Promise<ChatMessage[]> {
                return chatService.getMessages(input.sessionId);
            }
        },
        {
            name: 'getRecentMessages',
            execute: async function (input: {
                sessionId: string;
                count?: number;
            }): Promise<ChatMessage[]> {
                return chatService.getRecentMessages(
                    input.sessionId,
                    input.count
                );
            }
        },
        {
            name: 'getRelevantMessages',
            execute: async function (input: {
                sessionId: string;
                query: string;
                count?: number;
            }): Promise<ChatMessage[]> {
                return chatService.getRelevantMessages(
                    input.sessionId,
                    input.query,
                    input.count
                );
            }
        },
        {
            name: 'updateSessionContext',
            execute: async function (input: {
                sessionId: string;
                updates: Partial<ChatSessionContext>;
            }): Promise<ChatSessionContext> {
                return chatService.updateSessionContext(
                    input.sessionId,
                    input.updates
                );
            }
        },
        {
            name: 'registerTool',
            execute: async function (input: {
                tool: ChatTool;
            }): Promise<void> {
                chatService.registerTool(input.tool);
            }
        },
        {
            name: 'getTools',
            execute: async function (): Promise<ChatTool[]> {
                return chatService.getTools();
            }
        },
        {
            name: 'executeTool',
            execute: async function (input: {
                sessionId: string;
                toolName: string;
                params: Record<string, any>;
            }): Promise<any> {
                const context = await chatService.getSessionContext(input.sessionId);
                if (!context) {
                    throw new Error(`Session not found: ${input.sessionId}`);
                }

                return chatService.executeTool(
                    input.sessionId,
                    input.toolName,
                    input.params,
                    context
                );
            }
        },
        {
            name: 'humanTakeoverChat',
            execute: async function (input: {
                sessionId: string;
                agentId: string;
                agentName: string;
            }): Promise<ChatSessionContext> {
                return chatService.humanTakeoverChat(
                    input.sessionId,
                    input.agentId,
                    input.agentName
                );
            }
        },
        {
            name: 'sendHumanAgentMessage',
            execute: async function (input: {
                sessionId: string;
                message: string;
                agentId: string;
                agentName: string;
            }): Promise<void> {
                return chatService.sendHumanAgentMessage(
                    input.sessionId,
                    input.message,
                    input.agentId,
                    input.agentName
                );
            }
        },
        {
            name: 'transferToAI',
            execute: async function (input: {
                sessionId: string;
                agentId: string;
                transferMessage?: string;
            }): Promise<ChatSessionContext> {
                return chatService.transferToAI(
                    input.sessionId,
                    input.agentId,
                    input.transferMessage
                );
            }
        },
        {
            name: 'addMessage',
            execute: async function (input: {
                sessionId: string;
                message: ChatMessage;
                options?: ChatMemoryOptions;
            }): Promise<void> {
                return chatService.addMessage(
                    input.sessionId,
                    input.message,
                    input.options
                );
            }
        },
        {
            name: 'getSessionContext',
            execute: async function (input: {
                sessionId: string;
            }): Promise<ChatSessionContext | null> {
                return chatService.getSessionContext(input.sessionId);
            }
        }
    ]
};

export { chatPlugin };
