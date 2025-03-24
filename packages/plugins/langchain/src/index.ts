// Import all plugins from adapters
import { default as agentPlugin, Tool, AgentState } from './adapters/AgentPlugin.js';
import { chatPlugin, ChatMessage, ChatMemoryOptions, ChatSessionContext } from './adapters/ChatPlugin.js';
import { default as documentPlugin, LoadedDocument, LoadOptions } from './adapters/DocumentPlugin.js';
import { default as documentTransformerPlugin, TransformerOptions } from './adapters/DocumentTransformerPlugin.js';
import { default as embeddingPlugin, EmbeddingOptions } from './adapters/EmbeddingPlugin.js';
import { default as evaluationPlugin, EvaluationOptions, RetrievalEvaluationPluginOptions, GenerationEvaluationPluginOptions, AgentEvaluationPluginOptions } from './adapters/EvaluationPlugin.js';
import { default as langchainAdapterPlugin } from './adapters/LangChainAdapterPlugin.js';
import { default as langGraphPlugin, GraphState } from './adapters/LangGraphPlugin.js';
import { default as memoryPlugin, MemoryOptions, MemoryState, Message } from './adapters/MemoryPlugin.js';
import { default as modelPlugin, ModelOptions } from './adapters/ModelPlugin.js';
import { default as multiModalPlugin, ImageLoadOptions, AudioLoadOptions, MultiModalOptions } from './adapters/MultiModalPlugin.js';
import { default as outputParserPlugin, OutputFormat, ParseResult, ParserOptions } from './adapters/OutputParserPlugin.js';
import { default as promptPlugin, PromptTemplate, TemplateVersion } from './adapters/PromptPlugin.js';
import { default as promptTemplateRegistryPlugin } from './adapters/PromptTemplateRegistryPlugin.js';
import { default as contentValidatorPlugin } from './adapters/ContentValidatorPlugin.js';
import { default as evaluationChainPlugin } from './adapters/EvaluationChainPlugin.js';
import { default as feedbackPlugin } from './adapters/FeedbackPlugin.js';
import { default as ragPlugin, Document, ChunkOptions, RetrievalOptions, SearchResult } from './adapters/RAGPlugin.js';
import { default as retrieverPlugin, RetrieverOptions } from './adapters/RetrieverPlugin.js';
import { default as streamingPlugin, StreamingOptions, StreamingChainOptions, StreamingAgentOptions } from './adapters/StreamingPlugin.js';
import { default as textSplitterPlugin, SplitOptions } from './adapters/TextSplitterPlugin.js';

// Import factories, registry, parsers, and chains
import { ComponentRegistry } from './registry/ComponentRegistry.js';
import * as parsers from './parsers/index.js';
import * as chains from './chains/index.js';
import { 
  ChromaFactory, 
  FAISSFactory, 
  PineconeFactory,
  QdrantFactory,
  WeaviateFactory,
  RedisFactory,
  MilvusFactory
} from './factories/vectorstores/index.js';
import {
  // File loaders
  PDFLoaderFactory,
  DocxLoaderFactory,
  CSVLoaderFactory,
  JSONLoaderFactory,
  // Web loaders
  WebPageLoaderFactory,
  SitemapLoaderFactory,
  GitHubLoaderFactory,
  // Database loaders
  SQLLoaderFactory,
  MongoDBLoaderFactory,
  ElasticsearchLoaderFactory
} from './factories/loaders/index.js';
import {
  // Text splitters
  CharacterTextSplitterFactory,
  TokenTextSplitterFactory,
  RecursiveCharacterTextSplitterFactory,
  MarkdownTextSplitterFactory
} from './factories/splitters/index.js';

// Export plugins
export {
    agentPlugin,
    chatPlugin,
    contentValidatorPlugin,
    documentPlugin,
    documentTransformerPlugin,
    embeddingPlugin,
    evaluationChainPlugin,
    evaluationPlugin,
    feedbackPlugin,
    langchainAdapterPlugin,
    langGraphPlugin,
    memoryPlugin,
    modelPlugin,
    multiModalPlugin,
    outputParserPlugin,
    promptPlugin,
    promptTemplateRegistryPlugin,
    ragPlugin,
    retrieverPlugin,
    streamingPlugin,
    textSplitterPlugin
};

// Export types
export type {
    Tool, AgentState,
    ChatMessage, ChatMemoryOptions, ChatSessionContext,
    LoadedDocument, LoadOptions,
    TransformerOptions,
    EmbeddingOptions,
    EvaluationOptions, RetrievalEvaluationPluginOptions, GenerationEvaluationPluginOptions, AgentEvaluationPluginOptions,
    GraphState,
    MemoryOptions, MemoryState, Message,
    ModelOptions,
    ImageLoadOptions, AudioLoadOptions, MultiModalOptions,
    OutputFormat, ParseResult, ParserOptions,
    PromptTemplate, TemplateVersion,
    Document, ChunkOptions, RetrievalOptions, SearchResult,
    RetrieverOptions,
    StreamingOptions, StreamingChainOptions, StreamingAgentOptions,
    SplitOptions
};

// Import model factories
import {
  ChatOpenAIFactory,
  ChatAnthropicFactory,
  AnthropicEmbeddingsFactory,
  ChatGoogleGenerativeAIFactory,
  GoogleGenerativeAIEmbeddingsFactory,
  OllamaLLMFactory,
  LlamaCppFactory,
  LocalAIFactory
} from './factories/models/index.js';

// Export registry, factories, and parsers
export {
    ComponentRegistry,
    // Vector store factories
    ChromaFactory, 
    FAISSFactory, 
    PineconeFactory,
    QdrantFactory,
    WeaviateFactory,
    RedisFactory,
    MilvusFactory,
    // Document loader factories
    // File loaders
    PDFLoaderFactory,
    DocxLoaderFactory,
    CSVLoaderFactory,
    JSONLoaderFactory,
    // Web loaders
    WebPageLoaderFactory,
    SitemapLoaderFactory,
    GitHubLoaderFactory,
    // Database loaders
    SQLLoaderFactory,
    MongoDBLoaderFactory,
    ElasticsearchLoaderFactory,
    // Text splitters
    CharacterTextSplitterFactory,
    TokenTextSplitterFactory,
    RecursiveCharacterTextSplitterFactory,
    MarkdownTextSplitterFactory,
    // Model factories
    ChatOpenAIFactory,
    ChatAnthropicFactory,
    AnthropicEmbeddingsFactory,
    ChatGoogleGenerativeAIFactory,
    GoogleGenerativeAIEmbeddingsFactory,
    OllamaLLMFactory,
    LlamaCppFactory,
    LocalAIFactory
};

// Import agents, memory, streaming, evaluation, and feedback
import * as agents from './agents/index.js';
import * as memory from './memory/index.js';
import * as streaming from './streaming/index.js';
import * as evaluation from './evaluation/index.js';
import * as feedback from './feedback/index.js';

// Export parsers, chains, agents, memory, streaming, evaluation, and feedback
export { parsers, chains, agents, memory, streaming, evaluation, feedback };

// Main plugin that combines all functionality
const langchainPlugin = {
    name: "LangChain Integration",
    icon: "GiArtificialIntelligence",
    description: "Integrates LangChain and LangGraph capabilities with MintFlow",
    id: "langchain",
    runner: "node",
    inputSchema: {
        type: "object",
        properties: {
            // Common properties across all sub-plugins
            config: { type: "object" },
            provider: { type: "string" },
            model: { type: "string" },
            prompt: { type: "string" },
            systemPrompt: { type: "string" },
            temperature: { type: "number" },
            maxTokens: { type: "number" }
        }
    },
    outputSchema: {
        type: "object",
        properties: {
            result: { type: "any" }
        }
    },
    documentation: "https://js.langchain.com/docs/",
    method: "exec",
    actions: [
        ...langchainAdapterPlugin.actions,
        ...chatPlugin.actions,
        ...contentValidatorPlugin.actions,
        ...documentPlugin.actions,
        ...documentTransformerPlugin.actions,
        ...evaluationChainPlugin.actions,
        ...evaluationPlugin.actions,
        ...feedbackPlugin.actions,
        ...memoryPlugin.actions,
        ...modelPlugin.actions,
        ...multiModalPlugin.actions,
        ...promptTemplateRegistryPlugin.actions,
        ...ragPlugin.actions,
        ...retrieverPlugin.actions,
        ...agentPlugin.actions,
        ...promptPlugin.actions,
        ...outputParserPlugin.actions,
        ...langGraphPlugin.actions,
        ...textSplitterPlugin.actions,
        ...embeddingPlugin.actions,
        ...streamingPlugin.actions
    ]
};

export default langchainPlugin;
