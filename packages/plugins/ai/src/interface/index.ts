// interface/index.ts
// No imports to fix in this file

// Provider types
export type ProviderType = 'openai' | 'anthropic' | 'google' | 'ollama';

// Capability types
export type CapabilityType = 'text-generation' | 'embeddings' | 'vision' | 'chat';

// Provider configurations
export interface OpenAIConfig {
    apiKey: string;
    baseUrl?: string;
    organization?: string;
    apiVersion?: string;
}

export interface AnthropicConfig {
    apiKey: string;
    baseUrl?: string;
    apiVersion?: string;
}

export interface GoogleConfig {
    apiKey: string;
    projectId?: string;
    baseUrl?: string;
}

export interface OllamaConfig {
    baseUrl: string;
    keepAlive?: boolean;
}

// Configuration for the AI plugin
export interface AIPluginConfig {
    defaultProvider: ProviderType;
    fallbackProvider?: ProviderType;
    providers: {
        openai?: OpenAIConfig;
        anthropic?: AnthropicConfig;
        google?: GoogleConfig;
        ollama?: OllamaConfig;
    };
}

// Common interfaces for all AI operations
export interface TextGenerationParams {
    model: string;
    prompt: string;
    systemPrompt?: string;
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    stream?: boolean;
}

export interface EmbeddingParams {
    model: string;
    input: string | string[];
}

export interface TextGenerationResponse {
    text: string;
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
}

export interface StreamChunk {
    text: string;
    isComplete: boolean;
}

export type StreamCallback = (chunk: StreamChunk) => void;

export interface EmbeddingResponse {
    embeddings: number[][];
    usage?: {
        promptTokens: number;
        totalTokens: number;
    };
}

export interface Model {
    id: string;
    name: string;
    capabilities: string[];
    contextWindow: number;
    tokenLimit?: number;
    provider: string;
}

// Chat interfaces
export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string | ChatContent[];
}

export interface ChatContent {
    type: 'text' | 'image';
    text?: string;
    imageUrl?: string;
    imageData?: {
        data: string;
        mimeType: string;
    };
}

export interface ChatParams {
    model: string;
    messages: ChatMessage[];
    systemPrompt?: string;
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    stream?: boolean;
    memoryKey?: string;
}

export interface ChatResponse {
    text: string;
    messages: ChatMessage[];
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
}

// Image analysis interfaces
export interface ImageAnalysisParams {
    model: string;
    prompt: string;
    image: {
        data: string;
        mimeType: string;
        filename?: string;
    };
    temperature?: number;
    maxTokens?: number;
    topP?: number;
}

export interface ImageAnalysisResponse {
    text: string;
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
}

// Input parameters for AI plugin actions
export interface TextGenInput {
    config: AIPluginConfig;
    provider?: ProviderType;
    model: string;
    prompt: string;
    systemPrompt?: string;
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    stream?: boolean;
}

export interface EmbeddingInput {
    config: AIPluginConfig;
    provider?: ProviderType;
    model: string;
    input: string | string[];
}

export interface ChatInput {
    config: AIPluginConfig;
    provider?: ProviderType;
    model: string;
    messages: ChatMessage[];
    systemPrompt?: string;
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    stream?: boolean;
    memoryKey?: string;
    store?: any; // Storage interface for persisting chat history
}

export interface ImageAnalysisInput {
    config: AIPluginConfig;
    provider?: ProviderType;
    model: string;
    prompt: string;
    image: {
        data: string;
        mimeType: string;
        filename?: string;
    };
    temperature?: number;
    maxTokens?: number;
    topP?: number;
}

export interface ListModelsInput {
    config: AIPluginConfig;
    provider?: ProviderType;
    capability?: string;
}

export interface ValidateModelInput {
    config: AIPluginConfig;
    provider?: ProviderType;
    model: string;
}
