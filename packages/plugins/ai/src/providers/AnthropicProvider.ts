// providers/AnthropicProvider.ts

import axios from 'axios';
import { BaseProvider } from './BaseProvider.js';
import {
    AnthropicConfig,
    TextGenerationParams,
    EmbeddingParams,
    TextGenerationResponse,
    EmbeddingResponse,
    StreamCallback,
    Model
} from '../interface/index.js';

export class AnthropicProvider extends BaseProvider {
    private config: AnthropicConfig;
    private cachedModels: Model[] | null = null;
    private readonly defaultApiVersion = '2023-06-01';

    constructor(config: AnthropicConfig) {
        super('anthropic');
        this.config = config;
    }

    private getHeaders(): Record<string, string> {
        return {
            'Content-Type': 'application/json',
            'x-api-key': this.config.apiKey,
            'anthropic-version': this.config.apiVersion || this.defaultApiVersion
        };
    }

    private getBaseUrl(): string {
        return this.config.baseUrl || 'https://api.anthropic.com/v1';
    }

    async generateText(params: TextGenerationParams): Promise<TextGenerationResponse> {
        try {
            const { model, prompt, systemPrompt, temperature = 0.7, maxTokens = 1000, topP } = params;

            const isClaude3 = model.includes('claude-3');

            if (isClaude3) {
                // Claude 3 API
                const requestBody: any = {
                    model,
                    max_tokens: maxTokens,
                    temperature,
                    top_p: topP,
                    messages: [{ role: 'user', content: prompt }]
                };

                if (systemPrompt) {
                    requestBody.system = systemPrompt;
                }

                const response = await axios.post(
                    `${this.getBaseUrl()}/messages`,
                    requestBody,
                    { headers: this.getHeaders() }
                );

                return {
                    text: response.data.content[0].text,
                    usage: {
                        promptTokens: response.data.usage.input_tokens,
                        completionTokens: response.data.usage.output_tokens,
                        totalTokens: response.data.usage.input_tokens + response.data.usage.output_tokens
                    }
                };
            } else {
                // Claude 2 API (legacy)
                const requestBody: any = {
                    model,
                    prompt: `${systemPrompt ? `${systemPrompt}\n\n` : ''}Human: ${prompt}\n\nAssistant:`,
                    max_tokens_to_sample: maxTokens,
                    temperature,
                    top_p: topP
                };

                const response = await axios.post(
                    `${this.getBaseUrl()}/completions`,
                    requestBody,
                    { headers: this.getHeaders() }
                );

                return {
                    text: response.data.completion.trim()
                };
            }
        } catch (error) {
            return this.handleError(error);
        }
    }

    async generateTextStream(
        params: TextGenerationParams,
        callback: StreamCallback
    ): Promise<TextGenerationResponse> {
        try {
            const { model, prompt, systemPrompt, temperature = 0.7, maxTokens = 1000, topP } = params;

            const isClaude3 = model.includes('claude-3');

            if (isClaude3) {
                // Claude 3 streaming API
                const requestBody: any = {
                    model,
                    max_tokens: maxTokens,
                    temperature,
                    top_p: topP,
                    messages: [{ role: 'user', content: prompt }],
                    stream: true
                };

                if (systemPrompt) {
                    requestBody.system = systemPrompt;
                }

                const response = await axios.post(
                    `${this.getBaseUrl()}/messages`,
                    requestBody,
                    {
                        headers: this.getHeaders(),
                        responseType: 'stream'
                    }
                );

                let fullText = '';
                let usage = {
                    promptTokens: 0,
                    completionTokens: 0,
                    totalTokens: 0
                };

                // Handle streaming response
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
                                return;
                            }

                            try {
                                const parsed = JSON.parse(data);
                                if (parsed.type === 'content_block_delta') {
                                    if (parsed.delta && parsed.delta.text) {
                                        fullText += parsed.delta.text;
                                        callback({ text: parsed.delta.text, isComplete: false });
                                    }
                                } else if (parsed.type === 'message_stop') {
                                    callback({ text: '', isComplete: true });
                                }

                                // Get usage from the final message_stop event
                                if (parsed.type === 'message_stop' && parsed.usage) {
                                    usage = {
                                        promptTokens: parsed.usage.input_tokens,
                                        completionTokens: parsed.usage.output_tokens,
                                        totalTokens: parsed.usage.input_tokens + parsed.usage.output_tokens
                                    };
                                }
                            } catch (e) {
                                console.error('Error parsing stream:', e);
                            }
                        }
                    }
                });

                // Return a Promise that resolves once the stream is complete
                return new Promise((resolve, reject) => {
                    response.data.on('end', () => {
                        resolve({
                            text: fullText,
                            usage
                        });
                    });

                    response.data.on('error', (err: Error) => {
                        reject(err);
                    });
                });
            } else {
                // Claude 2 streaming API (legacy)
                const requestBody: any = {
                    model,
                    prompt: `${systemPrompt ? `${systemPrompt}\n\n` : ''}Human: ${prompt}\n\nAssistant:`,
                    max_tokens_to_sample: maxTokens,
                    temperature,
                    top_p: topP,
                    stream: true
                };

                const response = await axios.post(
                    `${this.getBaseUrl()}/completions`,
                    requestBody,
                    {
                        headers: this.getHeaders(),
                        responseType: 'stream'
                    }
                );

                let fullText = '';

                // Handle streaming response
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
                                return;
                            }

                            try {
                                const parsed = JSON.parse(data);
                                if (parsed.completion) {
                                    const text = parsed.completion;
                                    fullText += text;
                                    callback({ text, isComplete: false });
                                }

                                if (parsed.stop_reason) {
                                    callback({ text: '', isComplete: true });
                                }
                            } catch (e) {
                                console.error('Error parsing stream:', e);
                            }
                        }
                    }
                });

                // Return a Promise that resolves once the stream is complete
                return new Promise((resolve, reject) => {
                    response.data.on('end', () => {
                        resolve({
                            text: fullText
                        });
                    });

                    response.data.on('error', (err: Error) => {
                        reject(err);
                    });
                });
            }
        } catch (error) {
            return this.handleError(error);
        }
    }

    async generateEmbedding(params: EmbeddingParams): Promise<EmbeddingResponse> {
        try {
            // As of now, Anthropic doesn't have a separate embeddings endpoint
            // This is a placeholder for when they add one
            throw new Error('Embedding generation is not supported by Anthropic');
        } catch (error) {
            return this.handleError(error);
        }
    }

    async listModels(): Promise<Model[]> {
        // Anthropic doesn't have a list models endpoint, so we hardcode the known models
        if (this.cachedModels) {
            return this.cachedModels;
        }

        this.cachedModels = [
            {
                id: 'claude-3-opus-20240229',
                name: 'Claude 3 Opus',
                capabilities: ['text-generation', 'vision'],
                contextWindow: 200000,
                provider: 'Anthropic'
            },
            {
                id: 'claude-3-sonnet-20240229',
                name: 'Claude 3 Sonnet',
                capabilities: ['text-generation', 'vision'],
                contextWindow: 200000,
                provider: 'Anthropic'
            },
            {
                id: 'claude-3-haiku-20240307',
                name: 'Claude 3 Haiku',
                capabilities: ['text-generation', 'vision'],
                contextWindow: 200000,
                provider: 'Anthropic'
            },
            {
                id: 'claude-2.1',
                name: 'Claude 2.1',
                capabilities: ['text-generation'],
                contextWindow: 100000,
                provider: 'Anthropic'
            },
            {
                id: 'claude-2.0',
                name: 'Claude 2.0',
                capabilities: ['text-generation'],
                contextWindow: 100000,
                provider: 'Anthropic'
            },
            {
                id: 'claude-instant-1.2',
                name: 'Claude Instant 1.2',
                capabilities: ['text-generation'],
                contextWindow: 100000,
                provider: 'Anthropic'
            }
        ];

        return this.cachedModels;
    }

    async validateModel(modelId: string): Promise<boolean> {
        const models = await this.listModels();
        return models.some(model => model.id === modelId);
    }

    // In case Anthropic adds new models or capabilities
    clearModelCache(): void {
        this.cachedModels = null;
    }
}