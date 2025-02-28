// providers/OpenAIProvider.ts

import axios from 'axios';
import { BaseProvider } from './BaseProvider.js';
import {
    OpenAIConfig,
    TextGenerationParams,
    EmbeddingParams,
    TextGenerationResponse,
    EmbeddingResponse,
    StreamCallback,
    Model,
    ChatParams,
    ChatResponse,
    ChatMessage,
    ImageAnalysisParams,
    ImageAnalysisResponse
} from '../interface/index.js';

export class OpenAIProvider extends BaseProvider {
    private config: OpenAIConfig;
    private cachedModels: Model[] | null = null;

    constructor(config: OpenAIConfig) {
        super('openai');
        this.config = config;
    }

    private getHeaders(): Record<string, string> {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.apiKey}`
        };

        if (this.config.organization) {
            headers['OpenAI-Organization'] = this.config.organization;
        }

        if (this.config.apiVersion) {
            headers['OpenAI-Version'] = this.config.apiVersion;
        }

        return headers;
    }

    private getBaseUrl(): string {
        return this.config.baseUrl || 'https://api.openai.com/v1';
    }

    async generateText(params: TextGenerationParams): Promise<TextGenerationResponse> {
        try {
            const { model, prompt, systemPrompt, temperature = 0.7, maxTokens, topP } = params;

            const messages = [];
            if (systemPrompt) {
                messages.push({ role: 'system', content: systemPrompt });
            }
            messages.push({ role: 'user', content: prompt });

            const response = await axios.post(
                `${this.getBaseUrl()}/chat/completions`,
                {
                    model,
                    messages,
                    temperature,
                    max_tokens: maxTokens,
                    top_p: topP
                },
                { headers: this.getHeaders() }
            );

            return {
                text: response.data.choices[0].message.content,
                usage: {
                    promptTokens: response.data.usage.prompt_tokens,
                    completionTokens: response.data.usage.completion_tokens,
                    totalTokens: response.data.usage.total_tokens
                }
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

            const messages = [];
            if (systemPrompt) {
                messages.push({ role: 'system', content: systemPrompt });
            }
            messages.push({ role: 'user', content: prompt });

            const response = await axios.post(
                `${this.getBaseUrl()}/chat/completions`,
                {
                    model,
                    messages,
                    temperature,
                    max_tokens: maxTokens,
                    top_p: topP,
                    stream: true
                },
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
                            if (parsed.choices && parsed.choices.length > 0) {
                                const delta = parsed.choices[0].delta;
                                if (delta.content) {
                                    fullText += delta.content;
                                    callback({ text: delta.content, isComplete: false });
                                }
                            }

                            // Get usage from the final chunk if available
                            if (parsed.usage) {
                                usage = {
                                    promptTokens: parsed.usage.prompt_tokens,
                                    completionTokens: parsed.usage.completion_tokens,
                                    totalTokens: parsed.usage.total_tokens
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
        } catch (error) {
            return this.handleError(error);
        }
    }

    async generateEmbedding(params: EmbeddingParams): Promise<EmbeddingResponse> {
        try {
            const { model, input } = params;

            const response = await axios.post(
                `${this.getBaseUrl()}/embeddings`,
                {
                    model,
                    input
                },
                { headers: this.getHeaders() }
            );

            return {
                embeddings: response.data.data.map((item: any) => item.embedding),
                usage: {
                    promptTokens: response.data.usage.prompt_tokens,
                    totalTokens: response.data.usage.total_tokens
                }
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

            const response = await axios.get(
                `${this.getBaseUrl()}/models`,
                { headers: this.getHeaders() }
            );

            // Map API response to our Model interface
            const models: Model[] = response.data.data.map((model: any) => {
                // Determine capabilities based on model name/family
                const capabilities = [];
                if (model.id.includes('gpt-4') || model.id.includes('gpt-3.5')) {
                    capabilities.push('text-generation');
                    capabilities.push('function-calling');
                    capabilities.push('chat');
                }
                if (model.id.includes('vision') || model.id.includes('gpt-4-vision')) {
                    capabilities.push('vision');
                }
                if (model.id.includes('embedding')) {
                    capabilities.push('embeddings');
                }

                // Estimate context window based on model name
                let contextWindow = 4096; // default
                if (model.id.includes('16k')) {
                    contextWindow = 16384;
                } else if (model.id.includes('32k')) {
                    contextWindow = 32768;
                } else if (model.id.includes('gpt-4-turbo') || model.id.includes('gpt-4o')) {
                    contextWindow = 128000;
                }

                return {
                    id: model.id,
                    name: model.id.replace('gpt-', 'GPT ').replace(/-/g, ' ').replace('turbo', 'Turbo'),
                    capabilities,
                    contextWindow,
                    provider: 'OpenAI'
                };
            });

            // Only include models that have some capabilities
            this.cachedModels = models.filter(model => model.capabilities.length > 0);
            return this.cachedModels;
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

    // Helper to clear cached models - useful if models change during runtime
    clearModelCache(): void {
        this.cachedModels = null;
    }

    // Chat implementation
    override async chat(params: ChatParams): Promise<ChatResponse> {
        try {
            const { model, messages, systemPrompt, temperature = 0.7, maxTokens, topP } = params;
            
            // Prepare messages for OpenAI format
            const openaiMessages = [...messages];
            
            // Add system prompt if provided and not already in messages
            if (systemPrompt && !messages.some(msg => msg.role === 'system')) {
                openaiMessages.unshift({
                    role: 'system',
                    content: systemPrompt
                });
            }
            
            // Convert any message with content array to OpenAI format
            const formattedMessages = openaiMessages.map(msg => {
                if (typeof msg.content === 'string') {
                    return {
                        role: msg.role,
                        content: msg.content
                    };
                } else {
                    // Handle multimodal content (text + images)
                    const content = msg.content.map(part => {
                        if (part.type === 'text') {
                            return { type: 'text', text: part.text };
                        } else if (part.type === 'image') {
                            if (part.imageUrl) {
                                return {
                                    type: 'image_url',
                                    image_url: {
                                        url: part.imageUrl
                                    }
                                };
                            } else if (part.imageData) {
                                return {
                                    type: 'image_url',
                                    image_url: {
                                        url: `data:${part.imageData.mimeType};base64,${part.imageData.data}`
                                    }
                                };
                            }
                        }
                        return null;
                    }).filter(Boolean);
                    
                    return {
                        role: msg.role,
                        content
                    };
                }
            });
            
            // Make API request
            const response = await axios.post(
                `${this.getBaseUrl()}/chat/completions`,
                {
                    model,
                    messages: formattedMessages,
                    temperature,
                    max_tokens: maxTokens,
                    top_p: topP
                },
                { headers: this.getHeaders() }
            );
            
            // Extract response text
            const responseText = response.data.choices[0].message.content;
            
            // Add the response to the messages
            const updatedMessages = [...messages, {
                role: 'assistant',
                content: responseText
            }];
            
            return {
                text: responseText,
                messages: updatedMessages,
                usage: {
                    promptTokens: response.data.usage.prompt_tokens,
                    completionTokens: response.data.usage.completion_tokens,
                    totalTokens: response.data.usage.total_tokens
                }
            };
        } catch (error) {
            return this.handleError(error);
        }
    }
    
    // Chat streaming implementation
    override async chatStream(
        params: ChatParams,
        callback: StreamCallback
    ): Promise<ChatResponse> {
        try {
            const { model, messages, systemPrompt, temperature = 0.7, maxTokens, topP } = params;
            
            // Prepare messages for OpenAI format
            const openaiMessages = [...messages];
            
            // Add system prompt if provided and not already in messages
            if (systemPrompt && !messages.some(msg => msg.role === 'system')) {
                openaiMessages.unshift({
                    role: 'system',
                    content: systemPrompt
                });
            }
            
            // Convert any message with content array to OpenAI format
            const formattedMessages = openaiMessages.map(msg => {
                if (typeof msg.content === 'string') {
                    return {
                        role: msg.role,
                        content: msg.content
                    };
                } else {
                    // Handle multimodal content (text + images)
                    const content = msg.content.map(part => {
                        if (part.type === 'text') {
                            return { type: 'text', text: part.text };
                        } else if (part.type === 'image') {
                            if (part.imageUrl) {
                                return {
                                    type: 'image_url',
                                    image_url: {
                                        url: part.imageUrl
                                    }
                                };
                            } else if (part.imageData) {
                                return {
                                    type: 'image_url',
                                    image_url: {
                                        url: `data:${part.imageData.mimeType};base64,${part.imageData.data}`
                                    }
                                };
                            }
                        }
                        return null;
                    }).filter(Boolean);
                    
                    return {
                        role: msg.role,
                        content
                    };
                }
            });
            
            // Make API request
            const response = await axios.post(
                `${this.getBaseUrl()}/chat/completions`,
                {
                    model,
                    messages: formattedMessages,
                    temperature,
                    max_tokens: maxTokens,
                    top_p: topP,
                    stream: true
                },
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
                            if (parsed.choices && parsed.choices.length > 0) {
                                const delta = parsed.choices[0].delta;
                                if (delta.content) {
                                    fullText += delta.content;
                                    callback({ text: delta.content, isComplete: false });
                                }
                            }
                            
                            // Get usage from the final chunk if available
                            if (parsed.usage) {
                                usage = {
                                    promptTokens: parsed.usage.prompt_tokens,
                                    completionTokens: parsed.usage.completion_tokens,
                                    totalTokens: parsed.usage.total_tokens
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
                    // Add the response to the messages
                    const updatedMessages = [...messages, {
                        role: 'assistant',
                        content: fullText
                    }];
                    
                    resolve({
                        text: fullText,
                        messages: updatedMessages,
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
    
    // Image analysis implementation
    override async analyzeImage(params: ImageAnalysisParams): Promise<ImageAnalysisResponse> {
        try {
            const { model, prompt, image, temperature = 0.7, maxTokens, topP } = params;
            
            // For OpenAI, we use the chat endpoint with vision capability
            // Check if the model supports vision
            const models = await this.listModels();
            const selectedModel = models.find(m => m.id === model);
            
            if (!selectedModel || !selectedModel.capabilities.includes('vision')) {
                throw new Error(`Model ${model} does not support vision capabilities`);
            }
            
            // Prepare the message with the image
            const messages = [
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: prompt },
                        {
                            type: 'image_url',
                            image_url: {
                                url: `data:${image.mimeType};base64,${image.data}`
                            }
                        }
                    ]
                }
            ];
            
            // Make API request
            const response = await axios.post(
                `${this.getBaseUrl()}/chat/completions`,
                {
                    model,
                    messages,
                    temperature,
                    max_tokens: maxTokens,
                    top_p: topP
                },
                { headers: this.getHeaders() }
            );
            
            // Extract response text
            const responseText = response.data.choices[0].message.content;
            
            return {
                text: responseText,
                usage: {
                    promptTokens: response.data.usage.prompt_tokens,
                    completionTokens: response.data.usage.completion_tokens,
                    totalTokens: response.data.usage.total_tokens
                }
            };
        } catch (error) {
            return this.handleError(error);
        }
    }
}
