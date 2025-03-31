import axios from 'axios';
import { logger } from '@mintflow/common';
import { ENV } from '../config/env.js';

/**
 * Types for OpenAI API
 */
interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

interface ChatCompletionRequest {
    model: string;
    messages: ChatMessage[];
    temperature?: number;
    max_tokens?: number;
    stream?: boolean;
}

interface ChatCompletionResponse {
    id: string;
    object: string;
    created: number;
    model: string;
    choices: {
        index: number;
        message: ChatMessage;
        finish_reason: string;
    }[];
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}

interface StreamChunk {
    text: string;
    isComplete: boolean;
}

type StreamCallback = (chunk: StreamChunk) => void;

/**
 * AIAssistant class for personal assistant functionality
 * This is a dedicated implementation for internal use, separate from customer-facing AI plugins
 */
export class AIAssistant {
    private apiKey: string;
    private baseUrl: string;
    private defaultModel: string;
    private systemPrompt: string;
    private conversationHistory: Map<string, ChatMessage[]>;
    private activeRequests: Map<string, boolean>;

    constructor() {
        this.apiKey = ENV.OPENAI_API_KEY;
        this.baseUrl = ENV.OPENAI_BASE_URL || 'https://api.openai.com/v1';
        this.defaultModel = ENV.OPENAI_DEFAULT_MODEL || 'gpt-4o';

        // Enhanced system prompt for workflow commands
        this.systemPrompt = ENV.OPENAI_SYSTEM_PROMPT ||
            `You are a helpful personal assistant for MintFlow users. Help them get things done efficiently.
            
You can help users with workflow automation by understanding their intent and executing commands:

1. When a user asks to create a flow, respond with "create flow [name]" where [name] is a suitable name for the flow.
2. When a user asks to add a node to a flow, respond with "add [node-type] node" where [node-type] is one of: info, dynamic, app-view, form, action, condition, switch, image.
3. When a user asks to list flows, respond with "list flows".

For example:
- If user says "I want to create a workflow for email automation", respond with "create flow email-automation"
- If user says "Add a condition node to check email status", respond with "add condition node"
- If user says "Show me all my workflows", respond with "list flows"

Always try to understand the user's intent and respond with the appropriate command format.`;
        this.conversationHistory = new Map();
        this.activeRequests = new Map();

        if (!this.apiKey) {
            logger.warn('[AIAssistant] OpenAI API key not configured. Assistant functionality will be limited.');
        }
    }

    /**
     * Get headers for OpenAI API requests
     */
    private getHeaders(): Record<string, string> {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
        };
    }

    /**
     * Get conversation history for a user
     * @param userId User ID or session ID
     * @returns Array of chat messages
     */
    public getConversationHistory(userId: string): ChatMessage[] {
        if (!this.conversationHistory.has(userId)) {
            // Initialize with system prompt
            this.conversationHistory.set(userId, [
                { role: 'system', content: this.systemPrompt }
            ]);
        }

        return this.conversationHistory.get(userId) || [];
    }

    /**
     * Clear conversation history for a user
     * @param userId User ID or session ID
     */
    public clearConversationHistory(userId: string): void {
        // Reset to just the system prompt
        this.conversationHistory.set(userId, [
            { role: 'system', content: this.systemPrompt }
        ]);

        logger.info(`[AIAssistant] Cleared conversation history for user ${userId}`);
    }

    /**
     * Add a message to the conversation history
     * @param userId User ID or session ID
     * @param message Chat message to add
     */
    public addMessageToHistory(userId: string, message: ChatMessage): void {
        const history = this.getConversationHistory(userId);
        history.push(message);

        // Limit history size to prevent token overflow
        const maxHistorySize = 100; // Adjust as needed
        if (history.length > maxHistorySize) {
            // Keep system prompt and trim oldest messages
            const systemPrompts = history.filter(msg => msg.role === 'system');
            const nonSystemMessages = history.filter(msg => msg.role !== 'system');
            const trimmedMessages = nonSystemMessages.slice(-maxHistorySize + systemPrompts.length);
            this.conversationHistory.set(userId, [...systemPrompts, ...trimmedMessages]);
        } else {
            this.conversationHistory.set(userId, history);
        }
    }

    /**
     * Check if a user has an active request
     * @param userId User ID or session ID
     * @returns True if the user has an active request
     */
    public hasActiveRequest(userId: string): boolean {
        return this.activeRequests.has(userId) && this.activeRequests.get(userId) === true;
    }

    /**
     * Set the active request status for a user
     * @param userId User ID or session ID
     * @param active Whether the user has an active request
     */
    private setActiveRequest(userId: string, active: boolean): void {
        if (active) {
            this.activeRequests.set(userId, true);
        } else {
            this.activeRequests.delete(userId);
        }
    }

    /**
     * Process a user message and generate a response
     * @param userId User ID or session ID
     * @param userMessage User's message
     * @param model OpenAI model to use (optional)
     * @returns Assistant's response
     */
    public async processMessage(
        userId: string,
        userMessage: string,
        model?: string
    ): Promise<string> {
        try {
            // If OpenAI API key is not configured, inform the user
            if (!this.apiKey) {
                logger.warn('[AIAssistant] OpenAI API key not configured');

                // Add user message to history anyway
                this.addMessageToHistory(userId, { role: 'user', content: userMessage });

                // Add error message to history
                const errorMessage = "OpenAI API key not configured. Please set the OPENAI_API_KEY environment variable to enable AI assistant functionality.";
                this.addMessageToHistory(userId, { role: 'system', content: errorMessage });

                return errorMessage;
            }

            // Check if user already has an active request
            if (this.hasActiveRequest(userId)) {
                logger.warn(`[AIAssistant] User ${userId} already has an active request`);
                return "You already have an active request. Please wait for it to complete.";
            }

            // Mark user as having an active request
            this.setActiveRequest(userId, true);

            // Add user message to history
            this.addMessageToHistory(userId, { role: 'user', content: userMessage });

            // Get conversation history
            const messages = this.getConversationHistory(userId);

            // Create request
            const request: ChatCompletionRequest = {
                model: model || this.defaultModel,
                messages,
                temperature: 0.7,
                max_tokens: 2048
            };

            // Make API request
            const response = await axios.post<ChatCompletionResponse>(
                `${this.baseUrl}/chat/completions`,
                request,
                { headers: this.getHeaders() }
            );

            // Extract assistant's response
            const assistantMessage = response.data.choices[0].message;

            // Add assistant's response to history
            this.addMessageToHistory(userId, assistantMessage);

            // Clear active request status
            this.setActiveRequest(userId, false);

            return assistantMessage.content;
        } catch (error: any) {
            logger.error('[AIAssistant] Error processing message', {
                error: error.message,
                userId
            });

            // Clear active request status on error
            this.setActiveRequest(userId, false);

            // Add error message to history
            let errorMessage = '';

            // Handle circular JSON structure errors
            if (error.message && error.message.includes('circular structure')) {
                errorMessage = 'Error processing response: Circular reference detected';
            } else if (axios.isAxiosError(error) && error.response) {
                errorMessage = `Error connecting to OpenAI API: ${error.response.status} - ${JSON.stringify(error.response.data)}`;
            } else {
                errorMessage = `Error connecting to OpenAI API: ${error.message}`;
            }

            this.addMessageToHistory(userId, { role: 'system', content: errorMessage });

            return errorMessage;
        }
    }

    /**
     * Process a user message and generate a streaming response
     * @param userId User ID or session ID
     * @param userMessage User's message
     * @param callback Callback function for streaming chunks
     * @param model OpenAI model to use (optional)
     * @returns Complete assistant's response
     */
    public async processMessageStream(
        userId: string,
        userMessage: string,
        callback: StreamCallback,
        model?: string
    ): Promise<string> {
        try {
            // If OpenAI API key is not configured, inform the user
            if (!this.apiKey) {
                logger.warn('[AIAssistant] OpenAI API key not configured');

                // Add user message to history anyway
                this.addMessageToHistory(userId, { role: 'user', content: userMessage });

                // Add error message to history
                const errorMessage = "OpenAI API key not configured. Please set the OPENAI_API_KEY environment variable to enable AI assistant functionality.";
                this.addMessageToHistory(userId, { role: 'system', content: errorMessage });

                callback({ text: errorMessage, isComplete: true });
                return errorMessage;
            }

            // Check if user already has an active request
            if (this.hasActiveRequest(userId)) {
                logger.warn(`[AIAssistant] User ${userId} already has an active request`);

                const errorMessage = "You already have an active request. Please wait for it to complete.";
                callback({ text: errorMessage, isComplete: true });
                return errorMessage;
            }

            // Mark user as having an active request
            this.setActiveRequest(userId, true);

            // Add user message to history
            this.addMessageToHistory(userId, { role: 'user', content: userMessage });

            // Get conversation history
            const messages = this.getConversationHistory(userId);

            // Create request
            const request: ChatCompletionRequest = {
                model: model || this.defaultModel,
                messages,
                temperature: 0.7,
                max_tokens: 2048,
                stream: true
            };

            // Make streaming API request
            const response = await axios.post(
                `${this.baseUrl}/chat/completions`,
                request,
                {
                    headers: this.getHeaders(),
                    responseType: 'stream',
                    maxRedirects: 5,
                    timeout: 60000,
                    // Prevent circular references in the response
                    transformResponse: [(data) => data] // Don't transform the response data
                }
            );

            let fullText = '';

            // Return a Promise that resolves once the stream is complete
            return new Promise((resolve, reject) => {
                response.data.on('data', (chunk: Buffer) => {
                    try {
                        // Log the chunk constructor and basic info
                        logger.debug('[AIAssistant] Stream data chunk received:', {
                            chunkType: chunk.constructor.name,
                            chunkLength: chunk.length,
                            userId
                        });

                        const chunkStr = chunk.toString();
                        const lines = chunkStr
                            .split('\n')
                            .filter(line => line.trim() !== '');

                        logger.debug('[AIAssistant] Chunk content:', {
                            linesCount: lines.length,
                            firstLine: lines.length > 0 ? lines[0].substring(0, 50) : 'No lines'
                        });

                        for (const line of lines) {
                            if (line.startsWith('data: ')) {
                                const data = line.substring(6);
                                if (data === '[DONE]') {
                                    logger.debug('[AIAssistant] Stream complete signal received');
                                    callback({ text: '', isComplete: true });
                                    continue;
                                }

                                try {
                                    const parsed = JSON.parse(data);
                                    logger.debug('[AIAssistant] Parsed JSON data:', {
                                        hasChoices: !!parsed.choices,
                                        choicesLength: parsed.choices?.length
                                    });

                                    if (parsed.choices && parsed.choices.length > 0) {
                                        const delta = parsed.choices[0].delta;
                                        logger.debug('[AIAssistant] Delta content:', {
                                            hasDelta: !!delta,
                                            hasContent: delta?.content ? true : false,
                                            contentLength: delta?.content?.length
                                        });

                                        if (delta && delta.content) {
                                            fullText += delta.content;
                                            callback({ text: delta.content, isComplete: false });
                                        }
                                    }
                                } catch (e) {
                                    // Handle parsing errors gracefully
                                    logger.error('[AIAssistant] Error parsing stream:', {
                                        error: e instanceof Error ? e.message : String(e),
                                        data: data.substring(0, 100) // Log only the first 100 chars to avoid huge logs
                                    });
                                }
                            }
                        }
                    } catch (chunkError) {
                        logger.error('[AIAssistant] Error processing chunk:', {
                            error: chunkError instanceof Error ? chunkError.message : String(chunkError),
                            userId
                        });
                    }
                });

                response.data.on('end', () => {
                    // Add assistant's response to history
                    this.addMessageToHistory(userId, {
                        role: 'assistant',
                        content: fullText
                    });

                    // Clear active request status
                    this.setActiveRequest(userId, false);

                    resolve(fullText);
                });

                response.data.on('error', (err: Error) => {
                    // Detailed logging for debugging
                    logger.error('[AIAssistant] Stream error:', {
                        error: err instanceof Error ? err.message : String(err),
                        userId
                    });

                    // Log the error object properties to understand its structure
                    try {
                        const errorProps = Object.getOwnPropertyNames(err);
                        logger.error('[AIAssistant] Error object properties:', {
                            properties: errorProps,
                            name: err.name,
                            stack: err.stack?.substring(0, 500) // Limit stack trace size
                        });

                        // If it's a specific type of error, log more details
                        if (err.name === 'AxiosError' && (err as any).request) {
                            logger.error('[AIAssistant] Axios error details:', {
                                config: {
                                    url: (err as any).config?.url,
                                    method: (err as any).config?.method,
                                    headers: (err as any).config?.headers
                                },
                                status: (err as any).response?.status,
                                statusText: (err as any).response?.statusText
                            });
                        }
                    } catch (logError) {
                        logger.error('[AIAssistant] Error while logging error details:', logError);
                    }

                    // Clear active request status on error
                    this.setActiveRequest(userId, false);

                    // Handle circular JSON structure errors
                    if (err.message && err.message.includes('circular structure')) {
                        const errorMessage = 'Error processing response: Circular reference detected';
                        this.addMessageToHistory(userId, { role: 'system', content: errorMessage });
                        reject(new Error(errorMessage));
                    } else {
                        reject(err);
                    }
                });
            });
        } catch (error: any) {
            // Detailed logging for debugging
            logger.error('[AIAssistant] Error processing message stream', {
                error: error.message,
                userId,
                errorType: error.constructor.name
            });

            // Log detailed error information
            try {
                const errorProps = Object.getOwnPropertyNames(error);
                logger.error('[AIAssistant] Catch block error details:', {
                    properties: errorProps,
                    name: error.name,
                    code: error.code,
                    stack: error.stack?.substring(0, 500) // Limit stack trace size
                });

                // If it's an Axios error, log more details - but be careful with circular references
                if (axios.isAxiosError(error)) {
                    // Only log safe properties that won't cause circular references
                    logger.error('[AIAssistant] Axios error in catch block:', {
                        config: error.config ? {
                            url: error.config.url,
                            method: error.config.method,
                            baseURL: error.config.baseURL
                            // Avoid logging headers as they might contain sensitive info
                        } : 'No config',
                        status: error.response?.status,
                        statusText: error.response?.statusText,
                        // Avoid logging the full response data or request objects
                        message: error.message,
                        code: error.code
                    });
                }
            } catch (logError) {
                logger.error('[AIAssistant] Error while logging error details in catch block:', logError);
            }

            // Clear active request status on error
            this.setActiveRequest(userId, false);

            // Add error message to history
            let errorMessage = '';

            // Handle circular JSON structure errors
            if (error.message && error.message.includes('circular structure')) {
                errorMessage = 'Error processing response: Circular reference detected';
            } else if (axios.isAxiosError(error) && error.response) {
                errorMessage = `Error connecting to OpenAI API: ${error.response.status} - ${JSON.stringify(error.response.data)}`;
            } else {
                errorMessage = `Error connecting to OpenAI API: ${error.message}`;
            }

            this.addMessageToHistory(userId, { role: 'system', content: errorMessage });

            callback({ text: errorMessage, isComplete: true });
            return errorMessage;
        }
    }
}

// Export singleton instance
export const aiAssistant = new AIAssistant();
