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
    Model,
    ChatParams,
    ChatResponse,
    ChatMessage,
    ImageAnalysisParams,
    ImageAnalysisResponse
} from '../interface/index.js';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { nanoid } from 'nanoid';

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

    // Chat implementation
    override async chat(params: ChatParams): Promise<ChatResponse> {
        try {
            const { model, messages, systemPrompt, temperature = 0.7, maxTokens, topP, memoryKey } = params;
            
            // Format model name for Gemini API if needed
            const modelName = this.formatModelName(model);
            
            // Import GoogleGenerativeAI dynamically
            const { GoogleGenerativeAI } = await import('@google/generative-ai');
            
            // Initialize the API client
            const genAI = new GoogleGenerativeAI(this.config.apiKey);
            const geminiModel = genAI.getGenerativeModel({ model: modelName });
            
            // Convert messages to Gemini format
            const geminiMessages = messages.map(msg => {
                return {
                    role: msg.role === 'assistant' ? 'model' : msg.role,
                    parts: Array.isArray(msg.content) 
                        ? msg.content.map(part => {
                            if (part.type === 'text') {
                                return { text: part.text };
                            } else if (part.type === 'image' && part.imageData) {
                                return { 
                                    inlineData: {
                                        data: part.imageData.data,
                                        mimeType: part.imageData.mimeType
                                    }
                                };
                            } else if (part.type === 'image' && part.imageUrl) {
                                return { fileUri: part.imageUrl };
                            }
                            return { text: '' };
                        })
                        : [{ text: msg.content as string }]
                };
            });
            
            // Create chat session
            const chat = geminiModel.startChat({
                history: geminiMessages,
                systemInstruction: systemPrompt ? { parts: [{ text: systemPrompt }] } : undefined,
                generationConfig: {
                    temperature,
                    maxOutputTokens: maxTokens,
                    topP
                }
            });
            
            // Get the last user message
            const lastUserMessage = messages[messages.length - 1];
            const lastUserContent = Array.isArray(lastUserMessage.content) 
                ? lastUserMessage.content.find(part => part.type === 'text')?.text || ''
                : lastUserMessage.content as string;
            
            // Send message and get response
            const result = await chat.sendMessage(lastUserContent);
            const responseText = result.response.text();
            
            // Add the response to the messages
            const updatedMessages = [...messages, {
                role: 'assistant',
                content: responseText
            }];
            
            // Get usage information if available
            const usage = result.response.usageMetadata ? {
                promptTokens: result.response.usageMetadata.promptTokenCount || 0,
                completionTokens: result.response.usageMetadata.candidatesTokenCount || 0,
                totalTokens: result.response.usageMetadata.totalTokenCount || 0
            } : undefined;
            
            return {
                text: responseText,
                messages: updatedMessages,
                usage
            };
        } catch (error) {
            return this.handleError(error);
        }
    }
    
    // Chat streaming implementation
    override async chatStream(params: ChatParams, callback: StreamCallback): Promise<ChatResponse> {
        try {
            const { model, messages, systemPrompt, temperature = 0.7, maxTokens, topP } = params;
            
            // Format model name for Gemini API if needed
            const modelName = this.formatModelName(model);
            
            // Import GoogleGenerativeAI dynamically
            const { GoogleGenerativeAI } = await import('@google/generative-ai');
            
            // Initialize the API client
            const genAI = new GoogleGenerativeAI(this.config.apiKey);
            const geminiModel = genAI.getGenerativeModel({ 
                model: modelName,
                generationConfig: {
                    temperature,
                    maxOutputTokens: maxTokens,
                    topP
                }
            });
            
            // Convert messages to Gemini format
            const geminiMessages = messages.map(msg => {
                return {
                    role: msg.role === 'assistant' ? 'model' : msg.role,
                    parts: Array.isArray(msg.content) 
                        ? msg.content.map(part => {
                            if (part.type === 'text') {
                                return { text: part.text };
                            } else if (part.type === 'image' && part.imageData) {
                                return { 
                                    inlineData: {
                                        data: part.imageData.data,
                                        mimeType: part.imageData.mimeType
                                    }
                                };
                            } else if (part.type === 'image' && part.imageUrl) {
                                return { fileUri: part.imageUrl };
                            }
                            return { text: '' };
                        })
                        : [{ text: msg.content as string }]
                };
            });
            
            // Create chat session
            const chat = geminiModel.startChat({
                history: geminiMessages.slice(0, -1), // Exclude the last message
                systemInstruction: systemPrompt ? { parts: [{ text: systemPrompt }] } : undefined,
            });
            
            // Get the last user message
            const lastUserMessage = messages[messages.length - 1];
            const lastUserContent = Array.isArray(lastUserMessage.content) 
                ? lastUserMessage.content.find(part => part.type === 'text')?.text || ''
                : lastUserMessage.content as string;
            
            // Send message and stream response
            let fullText = '';
            const streamResult = await chat.sendMessageStream(lastUserContent);
            
            for await (const chunk of streamResult.stream) {
                const chunkText = chunk.text();
                fullText += chunkText;
                callback({ text: chunkText, isComplete: false });
            }
            
            // Signal completion
            callback({ text: '', isComplete: true });
            
            // Add the response to the messages
            const updatedMessages = [...messages, {
                role: 'assistant',
                content: fullText
            }];
            
            // Get usage information if available
            const usage = streamResult.response.usageMetadata ? {
                promptTokens: streamResult.response.usageMetadata.promptTokenCount || 0,
                completionTokens: streamResult.response.usageMetadata.candidatesTokenCount || 0,
                totalTokens: streamResult.response.usageMetadata.totalTokenCount || 0
            } : undefined;
            
            return {
                text: fullText,
                messages: updatedMessages,
                usage
            };
        } catch (error) {
            return this.handleError(error);
        }
    }
    
    // Image analysis implementation
    override async analyzeImage(params: ImageAnalysisParams): Promise<ImageAnalysisResponse> {
        // Declare variables outside try block so they're accessible in finally
        let tempFilePath = '';
        let fileManager;
        let uploadResult;
        
        try {
            const { model, prompt, image, temperature = 0.7, maxTokens, topP } = params;
            
            // Format model name for Gemini API if needed
            const modelName = this.formatModelName(model);
            
            // Import GoogleGenerativeAI dynamically
            const { GoogleGenerativeAI } = await import('@google/generative-ai');
            
            // Initialize the API client
            const genAI = new GoogleGenerativeAI(this.config.apiKey);
            const geminiModel = genAI.getGenerativeModel({ 
                model: modelName,
                generationConfig: {
                    temperature,
                    maxOutputTokens: maxTokens,
                    topP
                }
            });
            
            // Check if we need to use the FileManager API (for Google AI Studio API keys)
            if (this.config.apiKey.startsWith('AIza')) {
                // Create a temporary file
                const { GoogleAIFileManager } = await import('@google/generative-ai/server');
                fileManager = new GoogleAIFileManager(this.config.apiKey);
                
                tempFilePath = path.join(os.tmpdir(), `gemini-image-${nanoid()}.${image.mimeType.split('/')[1]}`);
                await fs.promises.writeFile(tempFilePath, Buffer.from(image.data, 'base64'));
                
                // Upload the file
                uploadResult = await fileManager.uploadFile(tempFilePath, {
                    mimeType: image.mimeType,
                    displayName: image.filename || 'image'
                });
                
                // Generate content with the uploaded file
                const result = await geminiModel.generateContent([
                    prompt,
                    {
                        fileData: {
                            fileUri: uploadResult.file.uri,
                            mimeType: uploadResult.file.mimeType
                        }
                    }
                ]);
                
                const response = result.response;
                const responseText = response.text();
                
                // Get usage information if available
                const usage = response.usageMetadata ? {
                    promptTokens: response.usageMetadata.promptTokenCount || 0,
                    completionTokens: response.usageMetadata.candidatesTokenCount || 0,
                    totalTokens: response.usageMetadata.totalTokenCount || 0
                } : undefined;
                
                return {
                    text: responseText,
                    usage
                };
            } else {
                // Use direct API with base64 image data
                const result = await geminiModel.generateContent([
                    prompt,
                    {
                        inlineData: {
                            data: image.data,
                            mimeType: image.mimeType
                        }
                    }
                ]);
                
                const response = result.response;
                const responseText = response.text();
                
                // Get usage information if available
                const usage = response.usageMetadata ? {
                    promptTokens: response.usageMetadata.promptTokenCount || 0,
                    completionTokens: response.usageMetadata.candidatesTokenCount || 0,
                    totalTokens: response.usageMetadata.totalTokenCount || 0
                } : undefined;
                
                return {
                    text: responseText,
                    usage
                };
            }
        } catch (error) {
            return this.handleError(error);
        } finally {
            // Clean up any temporary files
            try {
                if (typeof tempFilePath === 'string' && tempFilePath) {
                    await fs.promises.unlink(tempFilePath);
                }
            } catch (e) {
                console.error('Error cleaning up temporary file:', e);
            }
        }
    }
}
