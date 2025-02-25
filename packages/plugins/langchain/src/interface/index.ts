// Interface definitions for the langchain plugin

/**
 * Configuration for AI plugin
 */
export interface AIPluginConfig {
    apiKey?: string;
    apiUrl?: string;
    organization?: string;
    defaultProvider?: string;
    providers?: {
        openai?: {
            apiKey?: string;
            apiUrl?: string;
            organization?: string;
        };
        anthropic?: {
            apiKey?: string;
            apiUrl?: string;
        };
        google?: {
            apiKey?: string;
            apiUrl?: string;
        };
        ollama?: {
            apiUrl?: string;
        };
    };
}

/**
 * Input for text generation
 */
export interface TextGenInput {
    model: string;
    prompt: string;
    systemPrompt?: string;
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
    stop?: string[];
}

/**
 * Input for embedding generation
 */
export interface EmbeddingInput {
    model: string;
    text: string | string[];
}

/**
 * Response from text generation
 */
export interface TextGenerationResponse {
    text: string;
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
    finishReason?: string;
    metadata?: Record<string, any>;
}

/**
 * Response from embedding generation
 */
export interface EmbeddingResponse {
    embeddings: number[][];
    usage?: {
        promptTokens: number;
        totalTokens: number;
    };
}

/**
 * Message interface for conversation
 */
export interface ChatMessage {
    role: 'user' | 'assistant' | 'system' | 'function' | 'human_agent';
    content: string;
    name?: string;
    function_call?: {
        name: string;
        arguments: string;
    };
    metadata?: {
        timestamp?: Date;
        userId?: string;
        agentId?: string;
        embedding?: number[];
        handoffReason?: string;
    };
}

/**
 * Tool interface for chat function calling
 */
export interface ChatTool {
    name: string;
    description: string;
    parameters: {
        type: string;
        properties: Record<string, any>;
        required?: string[];
    };
    execute: (params: Record<string, any>, context: any) => Promise<any>;
}

/**
 * Chat memory options
 */
export interface ChatMemoryOptions {
    useEmbeddings?: boolean;
    maxMessages?: number;
    summarizeThreshold?: number;
    ttl?: number;
    namespace?: string;
}

/**
 * Session context for a chat conversation
 */
export interface ChatSessionContext {
    sessionId: string;
    userId: string;
    metadata: Record<string, any>;
    status: 'active' | 'waiting_for_human' | 'with_human' | 'ended';
    humanAgentId?: string;
    customData?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Plugin action interface
 */
export interface PluginAction {
    name: string;
    description?: string;
    inputSchema?: Record<string, any>;
    outputSchema?: Record<string, any>;
    execute: (input: any) => Promise<any>;
}

/**
 * Plugin interface
 */
export interface Plugin {
    id: string;
    name: string;
    icon?: string;
    description?: string;
    documentation?: string;
    inputSchema?: Record<string, any>;
    outputSchema?: Record<string, any>;
    exampleInput?: Record<string, any>;
    exampleOutput?: Record<string, any>;
    method?: string;
    actions: PluginAction[];
}

/**
 * Document interface for RAG
 */
export interface Document {
    id: string;
    text: string;
    metadata?: Record<string, any>;
    embedding?: number[];
}

/**
 * Vector store interface for RAG
 */
export interface VectorStore {
    addDocuments(documents: Document[]): Promise<void>;
    similaritySearch(query: string | number[], k?: number): Promise<Document[]>;
    delete(ids: string[]): Promise<void>;
}

/**
 * Memory interface for LangChain
 */
export interface Memory {
    getMessages(): Promise<ChatMessage[]>;
    addMessage(message: ChatMessage): Promise<void>;
    clear(): Promise<void>;
}
