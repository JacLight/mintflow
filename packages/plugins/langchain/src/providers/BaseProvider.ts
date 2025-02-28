// Base provider interface for AI services

import { TextGenInput, TextGenerationResponse, EmbeddingInput, EmbeddingResponse } from '../interface/index.js';
import { ProviderServiceError } from '../errors/index.js';

/**
 * Base provider interface for AI services
 */
export abstract class BaseProvider {
    protected config: Record<string, any>;

    constructor(config: Record<string, any>) {
        this.config = config;
    }

    /**
     * Generate text using the provider's API
     */
    abstract generateText(input: TextGenInput): Promise<TextGenerationResponse>;

    /**
     * Generate embeddings using the provider's API
     */
    abstract generateEmbeddings(input: EmbeddingInput): Promise<EmbeddingResponse>;

    /**
     * Get the provider name
     */
    abstract getProviderName(): string;

    /**
     * Get supported models for this provider
     */
    abstract getSupportedModels(): string[];

    /**
     * Check if a model is supported by this provider
     */
    isModelSupported(model: string): boolean {
        return this.getSupportedModels().includes(model);
    }

    /**
     * Handle API errors
     */
    protected handleError(error: any): never {
        console.error(`${this.getProviderName()} API error:`, error);

        // Extract error message
        let message = 'Unknown error';
        if (error.response?.data?.error?.message) {
            message = error.response.data.error.message;
        } else if (error.response?.data?.message) {
            message = error.response.data.message;
        } else if (error.message) {
            message = error.message;
        }

        throw new ProviderServiceError(this.getProviderName(), message);
    }

    /**
     * Calculate token usage (implementation depends on provider)
     */
    protected calculateTokenUsage(prompt: string, response: string): {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    } {
        // Default implementation - very rough estimate
        // In real implementation, use provider-specific tokenizers
        const promptTokens = Math.ceil(prompt.length / 4);
        const completionTokens = Math.ceil(response.length / 4);

        return {
            promptTokens,
            completionTokens,
            totalTokens: promptTokens + completionTokens
        };
    }
}
