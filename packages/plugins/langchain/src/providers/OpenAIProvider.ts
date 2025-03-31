// OpenAI provider implementation

import { BaseProvider } from './BaseProvider.js';
import { TextGenInput, TextGenerationResponse, EmbeddingInput, EmbeddingResponse } from '../interface/index.js';
import { UnsupportedModelError, AuthenticationError, RateLimitError, TimeoutError } from '../errors/index.js';
import axios from 'axios';

/**
 * OpenAI provider implementation
 */
export class OpenAIProvider extends BaseProvider {
    private apiKey: string;
    private apiUrl?: string;
    private organization?: string;

    constructor(config: {
        apiKey?: string;
        apiUrl?: string;
        organization?: string;
    }) {
        super(config);
        this.apiKey = config.apiKey || process.env.OPENAI_API_KEY || '';
        this.apiUrl = config.apiUrl || 'https://api.openai.com/v1';
        this.organization = config.organization;

        if (!this.apiKey) {
            throw new AuthenticationError('OpenAI', 'API key is required');
        }
    }

    /**
     * Get the provider name
     */
    getProviderName(): string {
        return 'OpenAI';
    }

    /**
     * Get supported models
     */
    getSupportedModels(): string[] {
        return [
            // GPT-4 models
            'gpt-4', 'gpt-4-turbo', 'gpt-4o', 'gpt-4-32k', 'gpt-4-vision',
            // GPT-3.5 models
            'gpt-3.5-turbo', 'gpt-3.5-turbo-16k',
            // Base models
            'text-davinci-003', 'text-davinci-002',
            // Embedding models
            'text-embedding-ada-002', 'text-embedding-3-small', 'text-embedding-3-large'
        ];
    }

    /**
     * Generate text using OpenAI API
     */
    async generateText(input: TextGenInput): Promise<TextGenerationResponse> {
        if (!this.isModelSupported(input.model)) {
            throw new UnsupportedModelError(this.getProviderName(), input.model);
        }

        try {
            // Prepare request
            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            };

            if (this.organization) {
                headers['OpenAI-Organization'] = this.organization;
            }

            // Prepare messages
            const messages = [];
            if (input.systemPrompt) {
                messages.push({
                    role: 'system',
                    content: input.systemPrompt
                });
            }

            messages.push({
                role: 'user',
                content: input.prompt
            });

            // Make API request
            const response = await axios.post(
                `${this.apiUrl}/chat/completions`,
                {
                    model: input.model,
                    messages,
                    temperature: input.temperature || 0.7,
                    max_tokens: input.maxTokens,
                    top_p: input.topP,
                    frequency_penalty: input.frequencyPenalty,
                    presence_penalty: input.presencePenalty,
                    stop: input.stop
                },
                { headers }
            );

            // Extract response
            const result = response.data.choices[0].message.content;
            const usage = response.data.usage;

            return {
                text: result,
                usage: {
                    promptTokens: usage.prompt_tokens,
                    completionTokens: usage.completion_tokens,
                    totalTokens: usage.total_tokens
                },
                finishReason: response.data.choices[0].finish_reason
            };
        } catch (error: any) {
            if (error.response?.status === 401) {
                throw new AuthenticationError(this.getProviderName(), 'Invalid API key');
            } else if (error.response?.status === 429) {
                throw new RateLimitError(this.getProviderName(), 'Rate limit exceeded');
            } else if (error.code === 'ETIMEDOUT' || error.code === 'ESOCKETTIMEDOUT') {
                throw new TimeoutError(this.getProviderName(), 30000);
            }
            return this.handleError(error);
        }
    }

    /**
     * Generate embeddings using OpenAI API
     */
    async generateEmbeddings(input: EmbeddingInput): Promise<EmbeddingResponse> {
        // Default to text-embedding-ada-002 if not specified
        const model = input.model || 'text-embedding-ada-002';

        if (!this.isModelSupported(model)) {
            throw new UnsupportedModelError(this.getProviderName(), model);
        }

        try {
            // Prepare request
            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            };

            if (this.organization) {
                headers['OpenAI-Organization'] = this.organization;
            }

            // Prepare input
            const texts = Array.isArray(input.text) ? input.text : [input.text];

            // Make API request
            const response = await axios.post(
                `${this.apiUrl}/embeddings`,
                {
                    model,
                    input: texts
                },
                { headers }
            );

            // Extract embeddings
            const embeddings = response.data.data.map(item => item.embedding);
            const usage = response.data.usage;

            return {
                embeddings,
                usage: {
                    promptTokens: usage.prompt_tokens,
                    totalTokens: usage.total_tokens
                }
            };
        } catch (error: any) {
            if (error.response?.status === 401) {
                throw new AuthenticationError(this.getProviderName(), 'Invalid API key');
            } else if (error.response?.status === 429) {
                throw new RateLimitError(this.getProviderName(), 'Rate limit exceeded');
            } else if (error.code === 'ETIMEDOUT' || error.code === 'ESOCKETTIMEDOUT') {
                throw new TimeoutError(this.getProviderName(), 30000);
            }
            return this.handleError(error);
        }
    }
}
