
export type ProviderType = 'openai' | 'anthropic' | 'google' | 'ollama';

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

export interface EventSourceParser {
    (onParse: (event: { type: string; data?: string; }) => void): { feed: (chunk: string) => void };
}

// Input parameters for AI plugin actions
export interface TextGenInput {
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
    provider?: ProviderType;
    model: string;
    input: string | string[];
}

export interface ListModelsInput {
    provider?: ProviderType;
    capability?: string;
}


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