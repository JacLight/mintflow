// src/plugins/ai/providers/BaseProvider.ts

import { ProviderServiceError } from 'src/errors/index.js';
import { EmbeddingParams, EmbeddingResponse, Model, StreamCallback, TextGenerationParams, TextGenerationResponse } from 'src/interface/index.js';

// Common interfaces for all AI operations


// Base provider interface that all AI providers must implement
export abstract class BaseProvider {
    protected providerName: string;

    constructor(providerName: string) {
        this.providerName = providerName;
    }

    // Common error handler
    protected handleError(error: any): never {
        console.error(`${this.providerName} error:`, error);
        throw new ProviderServiceError(
            this.providerName,
            (error as Error).message || 'Unknown error'
        );
    }

    // All providers must implement these methods
    abstract generateText(params: TextGenerationParams): Promise<TextGenerationResponse>;

    abstract generateTextStream(
        params: TextGenerationParams,
        callback: StreamCallback
    ): Promise<TextGenerationResponse>;

    abstract generateEmbedding(params: EmbeddingParams): Promise<EmbeddingResponse>;

    abstract listModels(): Promise<Model[]>;

    // Helper method to validate if model is supported
    abstract validateModel(modelId: string): Promise<boolean>;
}