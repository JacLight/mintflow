// providers/BaseProvider.ts

import {
    TextGenerationParams,
    EmbeddingParams,
    TextGenerationResponse,
    EmbeddingResponse,
    StreamCallback,
    Model,
    ChatParams,
    ChatResponse,
    ImageAnalysisParams,
    ImageAnalysisResponse
} from '../interface/index.js';
import { ProviderServiceError } from '../errors/index.js';

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
    
    // Chat methods - may be implemented by providers that support chat
    chat(params: ChatParams): Promise<ChatResponse> {
        throw new ProviderServiceError(
            this.providerName,
            'Chat functionality not supported by this provider'
        );
    }
    
    chatStream(
        params: ChatParams,
        callback: StreamCallback
    ): Promise<ChatResponse> {
        throw new ProviderServiceError(
            this.providerName,
            'Chat streaming functionality not supported by this provider'
        );
    }
    
    // Image analysis methods - may be implemented by providers that support vision
    analyzeImage(params: ImageAnalysisParams): Promise<ImageAnalysisResponse> {
        throw new ProviderServiceError(
            this.providerName,
            'Image analysis functionality not supported by this provider'
        );
    }
}
