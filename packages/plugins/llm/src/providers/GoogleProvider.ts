// providers/GoogleProvider.ts

import axios from 'axios';
import { BaseProvider } from './BaseProvider.js';
import {
    GoogleConfig,
    TextGenerationParams,
    EmbeddingParams,
    TextGenerationResponse,
    EmbeddingResponse,
    StreamCallback,
    Model
} from '../interface/index.js';

export class GoogleProvider extends BaseProvider {
    private config: GoogleConfig;
    private cachedModels: Model[] | null = null;

    constructor(config: GoogleConfig) {
        super('google');
        this.config = config;
    }

    private getHeaders(): Record<string, string> {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.apiKey}`
        };
    }

    private getBaseUrl(): string {
        return this.config.baseUrl || 'https://generativelanguage.googleapis.com/v1beta';
    }

    async generateText(params: TextGenerationParams): Promise<TextGenerationResponse> {
        try {
            const { model, prompt, systemPrompt, temperature = 0.7, maxTokens, topP } = params;

            // Format model name for Gemini API if needed
            const modelName = this.formatModelName(model);

            // Build request body
            const requestBody: any = {
                contents: [
                    {
                        role: 'user',
                        parts: [{ text: prompt }]
                    }
                ],
                generationConfig: {
                    temperature,
                    maxOutputTokens: maxTokens,
                    topP
                }
            };

            // Add system prompt if provided
            if (systemPrompt) {
                requestBody.systemInstruction = {
                    parts: [{ text: systemPrompt }]
                };
            }

            // Make API request
            let url;
            if (this.config.projectId) {
                // Use the location-based endpoint if project ID is provided
                url = `${this.getBaseUrl()}/projects/${this.config.projectId}/locations/us-central1/models/${modelName}:generateContent`;
            } else {
                // Use the direct endpoint
                url = `${this.getBaseUrl()}/models/${modelName}:generateContent`;
            }

            const apiKey = this.config.apiKey;
            const queryParams = apiKey.startsWith('AIza') ? `?key=${apiKey}` : '';
            const headers = apiKey.startsWith('AIza') ? { 'Content-Type': 'application/json' } : this.getHeaders();

            const response = await axios.post(
                `${url}${queryParams}`,
                requestBody,
                { headers }
            );

            // Process response
            const content = response.data.candidates[0].content;
            const text = content.parts.map((part: any) => part.text).join('');

            // Extract usage info if available
            const usage = response.data.usageMetadata ? {
                promptTokens: response.data.usageMetadata.promptTokenCount,
                completionTokens: response.data.usageMetadata.candidatesTokenCount,
                totalTokens: response.data.usageMetadata.totalTokenCount
            } : undefined;

            return {
                text,
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

            // Format model name for Gemini API if needed
            const modelName = this.formatModelName(model);

            // Build request body
            const requestBody: any = {
                contents: [
                    {
                        role: 'user',
                        parts: [{ text: prompt }]
                    }
                ],
                generationConfig: {
                    temperature,
                    maxOutputTokens: maxTokens,
                    topP
                },
                streamGenerationConfig: {
                    streamContentTypes: ["text"]
                }
            };

            // Add system prompt if provided
            if (systemPrompt) {
                requestBody.systemInstruction = {
                    parts: [{ text: systemPrompt }]
                };
            }

            // Make API request
            let url;
            if (this.config.projectId) {
                // Use the location-based endpoint if project ID is provided
                url = `${this.getBaseUrl()}/projects/${this.config.projectId}/locations/us-central1/models/${modelName}:streamGenerateContent`;
            } else {
                // Use the direct endpoint
                url = `${this.getBaseUrl()}/models/${modelName}:streamGenerateContent`;
            }

            const apiKey = this.config.apiKey;
            const queryParams = apiKey.startsWith('AIza') ? `?key=${apiKey}` : '';
            const headers = apiKey.startsWith('AIza') ? { 'Content-Type': 'application/json' } : this.getHeaders();

            const response = await axios.post(
                `${url}${queryParams}`,
                requestBody,
                {
                    headers,
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
                    try {
                        const parsed = JSON.parse(line);

                        // Check for content in the response
                        if (parsed.candidates && parsed.candidates.length > 0) {
                            const candidate = parsed.candidates[0];

                            if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
                                const textPart = candidate.content.parts[0].text || '';
                                if (textPart) {
                                    fullText += textPart;
                                    callback({ text: textPart, isComplete: false });
                                }
                            }

                            // If we have finish reason, mark as complete
                            if (candidate.finishReason) {
                                callback({ text: '', isComplete: true });
                            }
                        }

                        // Extract usage info if available
                        if (parsed.usageMetadata) {
                            usage = {
                                promptTokens: parsed.usageMetadata.promptTokenCount,
                                completionTokens: parsed.usageMetadata.candidatesTokenCount,
                                totalTokens: parsed.usageMetadata.totalTokenCount
                            };
                        }
                    } catch (e) {
                        // Non-JSON line, ignore
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
        } catch (error) {
            return this.handleError(error);
        }
    }

    async generateEmbedding(params: EmbeddingParams): Promise<EmbeddingResponse> {
        try {
            const { model, input } = params;

            // Format model name for Embedding API if needed
            const modelName = this.formatEmbeddingModelName(model);

            // Convert input to array if it's a string
            const textInputs = Array.isArray(input) ? input : [input];

            // Build request body
            const requestBody = {
                model: modelName,
                texts: textInputs
            };

            // Make API request
            let url;
            if (this.config.projectId) {
                url = `${this.getBaseUrl()}/projects/${this.config.projectId}/locations/us-central1/models/${modelName}:embedText`;
            } else {
                url = `${this.getBaseUrl()}/models/${modelName}:embedText`;
            }

            const apiKey = this.config.apiKey;
            const queryParams = apiKey.startsWith('AIza') ? `?key=${apiKey}` : '';
            const headers = apiKey.startsWith('AIza') ? { 'Content-Type': 'application/json' } : this.getHeaders();

            const response = await axios.post(
                `${url}${queryParams}`,
                requestBody,
                { headers }
            );

            // Process response
            const embeddings = response.data.embeddings.map((embedding: any) => embedding.values);

            // Extract usage info if available
            const usage = response.data.usageMetadata ? {
                promptTokens: response.data.usageMetadata.tokenCount,
                totalTokens: response.data.usageMetadata.tokenCount
            } : undefined;

            return {
                embeddings,
                usage
            };
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

            // Hardcoded list of Google's Gemini models since their API 
            // doesn't have a clean way to list models with capabilities
            this.cachedModels = [
                {
                    id: 'gemini-pro',
                    name: 'Gemini Pro',
                    capabilities: ['text-generation'],
                    contextWindow: 32768,
                    provider: 'Google'
                },
                {
                    id: 'gemini-pro-vision',
                    name: 'Gemini Pro Vision',
                    capabilities: ['text-generation', 'vision'],
                    contextWindow: 16384,
                    provider: 'Google'
                },
                {
                    id: 'gemini-ultra',
                    name: 'Gemini Ultra',
                    capabilities: ['text-generation', 'vision'],
                    contextWindow: 32768,
                    provider: 'Google'
                },
                {
                    id: 'text-embedding-004',
                    name: 'Text Embedding',
                    capabilities: ['embeddings'],
                    contextWindow: 2048,
                    provider: 'Google'
                }
            ];

            return this.cachedModels;
        } catch (error) {
            return this.handleError(error);
        }
    }

    async validateModel(modelId: string): Promise<boolean> {
        try {
            const models = await this.listModels();
            return models.some(model => model.id === modelId || this.formatModelName(model.id) === modelId);
        } catch {
            return false;
        }
    }

    // Helper to format model name for Gemini API
    private formatModelName(modelId: string): string {
        // If it already starts with 'models/' return as is
        if (modelId.startsWith('models/')) {
            return modelId;
        }

        // Otherwise add the prefix
        return `models/${modelId}`;
    }

    // Helper to format model name for embedding API
    private formatEmbeddingModelName(modelId: string): string {
        // If it's the embedding model ID and doesn't have the prefix
        if (modelId === 'text-embedding-004' && !modelId.startsWith('models/')) {
            return 'models/text-embedding-004';
        }

        // Otherwise use the general formatter
        return this.formatModelName(modelId);
    }

    // Clear the model cache
    clearModelCache(): void {
        this.cachedModels = null;
    }
}