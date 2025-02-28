// Import all plugins from adapters
import { default as agentPlugin, Tool, AgentState } from './adapters/AgentPlugin.js';
import { chatPlugin, ChatMessage, ChatMemoryOptions, ChatSessionContext } from './adapters/ChatPlugin.js';
import { default as langchainAdapterPlugin } from './adapters/LangChainAdapterPlugin.js';
import { default as langGraphPlugin, GraphState } from './adapters/LangGraphPlugin.js';
import { default as memoryPlugin, MemoryOptions, MemoryState, Message } from './adapters/MemoryPlugin.js';
import { default as outputParserPlugin, OutputFormat, ParseResult, ParserOptions } from './adapters/OutputParserPlugin.js';
import { default as promptPlugin, PromptTemplate, TemplateVersion } from './adapters/PromptPlugin.js';
import { default as ragPlugin } from './adapters/RAGPlugin.js';

// Export individual plugins
// export {
//     agentPlugin,
//     chatPlugin,
//     langchainAdapterPlugin,
//     langGraphPlugin,
//     memoryPlugin,
//     outputParserPlugin,
//     promptPlugin,
//     ragPlugin
// };

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
        ...memoryPlugin.actions,
        ...ragPlugin.actions,
        ...agentPlugin.actions,
        ...promptPlugin.actions,
        ...outputParserPlugin.actions,
        ...langGraphPlugin.actions
    ]
};

export default langchainPlugin;
