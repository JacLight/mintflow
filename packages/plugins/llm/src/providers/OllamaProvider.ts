// src/plugins/ai/providers/OllamaProvider.ts

import axios from 'axios';
import { TextGenerationParams, EmbeddingParams, TextGenerationResponse, EmbeddingResponse, StreamCallback, Model, OllamaConfig, EventSourceParser } from '../interface/index.js';
import { BaseProvider, } from './BaseProvider.js';


// Simple implementation of createParser that matches what we need
const createParser: EventSourceParser = (onParse) => {
    return {
        feed: (chunk: string) => {
            const lines = chunk.split('\n').filter(line => line.trim() !== '');
            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const data = line.substring(6);
                    onParse({ type: 'event', data });
                }
            }
        }
    };
};

export class OllamaProvider extends BaseProvider {
    private config: OllamaConfig;
    private cachedModels: Model[] | null = null;

    constructor(config: OllamaConfig) {
        super('ollama');
        this.config = {
            baseUrl: config.baseUrl || 'http://localhost:11434',
            keepAlive: config.keepAlive !== undefined ? config.keepAlive : true
        };
    }

    private getBaseUrl(): string {
        return this.config.baseUrl;
    }

    async generateText(params: TextGenerationParams): Promise<TextGenerationResponse> {
        try {
            const { model, prompt, systemPrompt, temperature = 0.7, maxTokens, topP } = params;

            const requestBody: any = {
                model,
                prompt,
                temperature,
                num_predict: maxTokens,
                top_p: topP,
                raw: false,
                keep_alive: this.config.keepAlive ? '5m' : '0s'
            };

            if (systemPrompt) {
                requestBody.system = systemPrompt;
            }

            const response = await axios.post(
                `${this.getBaseUrl()}/api/generate`,
                requestBody
            );

            // Calculate token usage if available
            const usage = response.data.eval_count ? {
                promptTokens: response.data.prompt_eval_count || 0,
                completionTokens: response.data.eval_count - (response.data.prompt_eval_count || 0),
                totalTokens: response.data.eval_count
            } : undefined;

            return {
                text: response.data.response,
                usage
            };
        } catch (error) {
            return this.handleError(error);
        }
    }

    async generateTextStream(
        params: TextGenerationParams,
        callback: StreamCallback
    ): Promise<TextGenerationResponse> {
        try {
            const { model, prompt, systemPrompt, temperature = 0.7, maxTokens, topP } = params;

            const requestBody: any = {
                model,
                prompt,
                temperature,
                num_predict: maxTokens,
                top_p: topP,
                stream: true,
                raw: false,
                keep_alive: this.config.keepAlive ? '5m' : '0s'
            };

            if (systemPrompt) {
                requestBody.system = systemPrompt;
            }

            const response = await axios.post(
                `${this.getBaseUrl()}/api/generate`,
                requestBody,
                { responseType: 'stream' }
            );

            let fullText = '';
            let promptEvalCount = 0;
            let evalCount = 0;

            // Create a parser for the event stream
            const parser = createParser((event) => {
                if (event.type === 'event' && event.data) {
                    try {
                        const data = JSON.parse(event.data);

                        // Check if this is a content response
                        if (data.response) {
                            fullText += data.response;
                            callback({ text: data.response, isComplete: false });
                        }

                        // Check if this is the final response
                        if (data.done) {
                            callback({ text: '', isComplete: true });

                            // Store token counts for usage metrics
                            if (data.prompt_eval_count) {
                                promptEvalCount = data.prompt_eval_count;
                            }
                            if (data.eval_count) {
                                evalCount = data.eval_count;
                            }
                        }
                    } catch (e) {
                        console.error('Error parsing Ollama stream data:', e);
                    }
                }
            });

            // Process the streaming response
            response.data.on('data', (chunk: Buffer) => {
                const str = chunk.toString();
                parser.feed(str);
            });

            // Return a Promise that resolves once the stream is complete
            return new Promise((resolve, reject) => {
                response.data.on('end', () => {
                    // Calculate token usage if available
                    const usage = evalCount ? {
                        promptTokens: promptEvalCount,
                        completionTokens: evalCount - promptEvalCount,
                        totalTokens: evalCount
                    } : undefined;

                    resolve({
                        text: fullText,
                        usage
                    });
                });

                response.data.on('error', (err: Error) => {
                    reject(err);
                });
            });
        } catch (error) {
            return this.handleError(error);
        }
    }

    async generateEmbedding(params: EmbeddingParams): Promise<EmbeddingResponse> {
        try {
            const { model, input } = params;

            // Handle arrays by processing each item separately
            if (Array.isArray(input)) {
                const embeddings = [];
                for (const text of input) {
                    const response = await axios.post(`${this.getBaseUrl()}/api/embeddings`, {
                        model,
                        prompt: text,
                        keep_alive: this.config.keepAlive ? '5m' : '0s'
                    });
                    embeddings.push(response.data.embedding);
                }

                return { embeddings };
            } else {
                // Single string input
                const response = await axios.post(`${this.getBaseUrl()}/api/embeddings`, {
                    model,
                    prompt: input,
                    keep_alive: this.config.keepAlive ? '5m' : '0s'
                });

                return {
                    embeddings: [response.data.embedding]
                };
            }
        } catch (error) {
            return this.handleError(error);
        }
    }

    async listModels(): Promise<Model[]> {
        try {
            // Return cached models if available
            if (this.cachedModels) {
                return this.cachedModels;
            }

            // Fetch models from Ollama
            const response = await axios.get(`${this.getBaseUrl()}/api/tags`);

            // Map Ollama response to our Model interface
            const models: Model[] = response.data.models.map((model: any) => {
                // Determine capabilities based on model name/properties
                const capabilities = ['text-generation'];

                // Add embedding capability for models that support it
                // Many Ollama models support embeddings, but it's hard to determine automatically
                // This would require knowledge of specific models or testing each one
                if (model.name.includes('embed') ||
                    model.name.includes('nomic') ||
                    model.name.includes('gte') ||
                    model.name.toLowerCase().includes('e5')) {
                    capabilities.push('embeddings');
                }

                // Add vision capability for multimodal models
                if (model.name.includes('llava') ||
                    model.name.includes('bakllava') ||
                    model.name.includes('vision') ||
                    model.name.includes('multimodal')) {
                    capabilities.push('vision');
                }

                // Estimate context window based on model family if available
                let contextWindow = 4096; // default for most models

                if (model.details && model.details.parameter_size) {
                    // Llama 3 models
                    if (model.name.includes('llama3') || model.name.includes('llama-3')) {
                        if (model.name.includes('8b')) {
                            contextWindow = 8192;
                        } else if (model.name.includes('70b')) {
                            contextWindow = 8192;
                        }
                    }
                    // Llama 2 models
                    else if (model.name.includes('llama2') || model.name.includes('llama-2')) {
                        if (model.name.includes('70b')) {
                            contextWindow = 4096;
                        } else {
                            contextWindow = 4096;
                        }
                    }
                    // Mistral models
                    else if (model.name.includes('mistral')) {
                        contextWindow = 8192;
                    }
                    // Mixtral models
                    else if (model.name.includes('mixtral')) {
                        contextWindow = 32768;
                    }
                }

                return {
                    id: model.name,
                    name: model.name,
                    capabilities,
                    contextWindow,
                    provider: 'Ollama'
                };
            });

            this.cachedModels = models;
            return models;
        } catch (error) {
            return this.handleError(error);
        }
    }

    async validateModel(modelId: string): Promise<boolean> {
        try {
            const models = await this.listModels();
            return models.some(model => model.id === modelId);
        } catch {
            return false;
        }
    }

    clearModelCache(): void {
        this.cachedModels = null;
    }
}