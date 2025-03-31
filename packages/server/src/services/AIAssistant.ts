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
        this.systemPrompt = ENV.OPENAI_SYSTEM_PROMPT ||
            'You are a helpful personal assistant for MintFlow users. Help them get things done efficiently.';
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
     * Process a user message and generate a response
     * @param userId User ID or session ID
     * @param userMessage User's message
     * @param model OpenAI model to use (optional)
     * @returns Assistant's response
     */
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

    public async processMessage(
        userId: string,
        userMessage: string,
        model?: string
    ): Promise<string> {
        try {
            if (!this.apiKey) {
                return "OpenAI API key not configured. Please set the OPENAI_API_KEY environment variable.";
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

            if (axios.isAxiosError(error) && error.response) {
                logger.error('[AIAssistant] OpenAI API error', {
                    status: error.response.status,
                    data: error.response.data
                });

                return `Error processing your request: ${error.response.status} - ${JSON.stringify(error.response.data)}`;
            }

            return `Error processing your request: ${error.message}`;
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
            if (!this.apiKey) {
                callback({
                    text: "OpenAI API key not configured. Please set the OPENAI_API_KEY environment variable.",
                    isComplete: true
                });
                return "OpenAI API key not configured. Please set the OPENAI_API_KEY environment variable.";
            }

            // Check if user already has an active request
            if (this.hasActiveRequest(userId)) {
                logger.warn(`[AIAssistant] User ${userId} already has an active request`);
                callback({
                    text: "You already have an active request. Please wait for it to complete.",
                    isComplete: true
                });
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
                max_tokens: 2048,
                stream: true
            };

            // Make streaming API request
            const response = await axios.post(
                `${this.baseUrl}/chat/completions`,
                request,
                {
                    headers: this.getHeaders(),
                    responseType: 'stream'
                }
            );

            let fullText = '';

            // Return a Promise that resolves once the stream is complete
            return new Promise((resolve, reject) => {
                response.data.on('data', (chunk: Buffer) => {
                    const lines = chunk
                        .toString()
                        .split('\n')
                        .filter(line => line.trim() !== '');

                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const data = line.substring(6);
                            if (data === '[DONE]') {
                                callback({ text: '', isComplete: true });
                                continue;
                            }

                            try {
                                const parsed = JSON.parse(data);
                                if (parsed.choices && parsed.choices.length > 0) {
                                    const delta = parsed.choices[0].delta;
                                    if (delta.content) {
                                        fullText += delta.content;
                                        callback({ text: delta.content, isComplete: false });
                                    }
                                }
                            } catch (e) {
                                logger.error('[AIAssistant] Error parsing stream:', e);
                            }
                        }
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
                    logger.error('[AIAssistant] Stream error:', err);

                    // Clear active request status on error
                    this.setActiveRequest(userId, false);

                    reject(err);
                });
            });
        } catch (error: any) {
            logger.error('[AIAssistant] Error processing message stream', {
                error: error.message,
                userId
            });

            // Clear active request status on error
            this.setActiveRequest(userId, false);

            if (axios.isAxiosError(error) && error.response) {
                logger.error('[AIAssistant] OpenAI API error', {
                    status: error.response.status,
                    data: error.response.data
                });

                const errorMessage = `Error processing your request: ${error.response.status} - ${JSON.stringify(error.response.data)}`;
                callback({ text: errorMessage, isComplete: true });
                return errorMessage;
            }

            const errorMessage = `Error processing your request: ${error.message}`;
            callback({ text: errorMessage, isComplete: true });
            return errorMessage;
        }
    }
}

// Export singleton instance
export const aiAssistant = new AIAssistant();
