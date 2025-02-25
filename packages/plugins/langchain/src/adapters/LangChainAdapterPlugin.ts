// plugins/LangChainAdapterPlugin.ts

import {
    AIPluginConfig,
    TextGenInput,
    EmbeddingInput,
    TextGenerationResponse
} from '../interface/index.js';
import { BaseProvider } from '../providers/BaseProvider.js';
import { OpenAIProvider } from '../providers/OpenAIProvider.js';
// import { AnthropicProvider } from '../providers/AnthropicProvider.js';
// import { GoogleProvider } from '../providers/GoogleProvider.js';
// import { OllamaProvider } from '../providers/OllamaProvider.js';
import { ProviderServiceError } from '../errors/index.js';

// LangChain imports
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { BaseLanguageModel } from '@langchain/core/language_models/base';
import { CallbackManagerForLLMRun } from '@langchain/core/callbacks/manager';
import { HumanMessage, AIMessage, SystemMessage, BaseMessage } from '@langchain/core/messages';

/**
 * LangChain adapter that wraps our AI plugin infrastructure
 * to make it compatible with LangChain interfaces
 */
export class LangChainAdapterModel extends BaseChatModel {
    private config: AIPluginConfig;
    private provider?: string;
    private model: string;
    private systemPrompt?: string;
    private temperature: number;
    private maxTokens?: number;
    private topP?: number;

    constructor(options: {
        config: AIPluginConfig;
        provider?: string;
        model: string;
        systemPrompt?: string;
        temperature?: number;
        maxTokens?: number;
        topP?: number;
    }) {
        super({});
        this.config = options.config;
        this.provider = options.provider || options.config.defaultProvider;
        this.model = options.model;
        this.systemPrompt = options.systemPrompt;
        this.temperature = options.temperature || 0.7;
        this.maxTokens = options.maxTokens;
        this.topP = options.topP;
    }

    _llmType(): string {
        return `langchain-adapter-${this.provider}`;
    }

    /**
     * Creates the appropriate provider based on configuration
     */
    private createProvider(): BaseProvider {
        const providerType = this.provider || this.config.defaultProvider;

        switch (providerType) {
            case 'openai':
                if (!this.config.providers?.openai) {
                    throw new Error('OpenAI configuration missing');
                }
                return new OpenAIProvider(this.config.providers.openai);

            // case 'anthropic':
            //     if (!this.config.providers?.anthropic) {
            //         throw new Error('Anthropic configuration missing');
            //     }
            //     return new AnthropicProvider(this.config.providers.anthropic);

            // case 'google':
            //     if (!this.config.providers?.google) {
            //         throw new Error('Google configuration missing');
            //     }
            //     return new GoogleProvider(this.config.providers.google);

            // case 'ollama':
            //     if (!this.config.providers?.ollama) {
            //         throw new Error('Ollama configuration missing');
            //     }
            //     return new OllamaProvider(this.config.providers.ollama);

            default:
                throw new Error(`Unknown provider type: ${providerType}`);
        }
    }

    /**
     * Main method to generate chat completions
     */
    async _generate(
        messages: BaseMessage[],
        options: this["ParsedCallOptions"],
        runManager?: CallbackManagerForLLMRun
    ): Promise<{
        generations: { text: string; message: AIMessage }[];
        llmOutput?: Record<string, any>;
    }> {
        try {
            // Extract the combined message from the LangChain messages
            const { prompt, systemPrompt } = this.formatMessages(messages);

            const provider = this.createProvider();
            const response = await provider.generateText({
                model: this.model,
                prompt,
                systemPrompt: systemPrompt || this.systemPrompt,
                temperature: this.temperature,
                maxTokens: this.maxTokens,
                topP: this.topP
            });

            const result = {
                generations: [
                    {
                        text: response.text,
                        message: new AIMessage(response.text)
                    }
                ],
                llmOutput: {
                    usage: response.usage
                }
            };

            return result;
        } catch (error) {
            console.error('Error in LangChain adapter:', error);
            if (error instanceof ProviderServiceError) {
                throw new Error(`LangChain adapter error: ${error.message}`);
            }
            throw error;
        }
    }

    /**
     * Format LangChain messages into our API format
     */
    private formatMessages(messages: BaseMessage[]): { prompt: string; systemPrompt?: string } {
        let systemPrompt: string | undefined;
        const humanMessages: string[] = [];
        const aiMessages: string[] = [];

        for (const message of messages) {
            if (message._getType() === 'system') {
                systemPrompt = message.content as string;
            } else if (message._getType() === 'human') {
                humanMessages.push(message.content as string);
            } else if (message._getType() === 'ai') {
                aiMessages.push(message.content as string);
            }
        }

        // For the simplest case, just use the last human message as the prompt
        let prompt = humanMessages[humanMessages.length - 1] || '';

        // If we have a conversation history, format it appropriately
        if (humanMessages.length > 1 || aiMessages.length > 0) {
            // Create a formatted conversation history
            const history: string[] = [];
            for (let i = 0; i < Math.max(humanMessages.length - 1, aiMessages.length); i++) {
                if (i < humanMessages.length - 1) {
                    history.push(`Human: ${humanMessages[i]}`);
                }
                if (i < aiMessages.length) {
                    history.push(`AI: ${aiMessages[i]}`);
                }
            }

            // Add conversation history to the prompt
            if (history.length > 0) {
                prompt = `Conversation history:\n${history.join('\n')}\n\nHuman: ${prompt}`;
            }
        }

        return { prompt, systemPrompt };
    }
}

/**
 * Factory function to create a LangChain model from our AI plugin config
 */
export function createLangChainModel(options: {
    config: AIPluginConfig;
    provider?: string;
    model: string;
    systemPrompt?: string;
    temperature?: number;
    maxTokens?: number;
    topP?: number;
}): BaseLanguageModel {
    return new LangChainAdapterModel(options);
}

// Plugin definition for integration with your workflow engine
const langchainAdapterPlugin = {
    id: "langchain-adapter",
    name: "LangChain Adapter Plugin",
    icon: "GiArtificialIntelligence",
    description: "Adapts AI providers to LangChain compatible interfaces",
    documentation: "https://docs.example.com/langchainAdapter",

    inputSchema: {
        config: { type: 'object' },
        provider: {
            type: 'string',
            enum: ['openai', 'anthropic', 'google', 'ollama']
        },
        model: { type: 'string' },
        systemPrompt: { type: 'string' },
        temperature: { type: 'number' },
        maxTokens: { type: 'number' },
        topP: { type: 'number' },
        messages: { type: 'array' }
    },

    actions: [
        {
            name: 'createLangChainModel',
            execute: async function (input: {
                config: AIPluginConfig;
                provider?: string;
                model: string;
                systemPrompt?: string;
                temperature?: number;
                maxTokens?: number;
                topP?: number;
            }): Promise<BaseLanguageModel> {
                return createLangChainModel(input);
            }
        },
        {
            name: 'generateFromMessages',
            execute: async function (input: {
                config: AIPluginConfig;
                provider?: string;
                model: string;
                systemPrompt?: string;
                temperature?: number;
                maxTokens?: number;
                topP?: number;
                messages: { role: string; content: string }[];
            }): Promise<TextGenerationResponse> {
                const model = new LangChainAdapterModel({
                    config: input.config,
                    provider: input.provider,
                    model: input.model,
                    systemPrompt: input.systemPrompt,
                    temperature: input.temperature,
                    maxTokens: input.maxTokens,
                    topP: input.topP
                });

                // Convert API-style messages to LangChain format
                const langchainMessages = input.messages.map(msg => {
                    if (msg.role === 'system') {
                        return new SystemMessage(msg.content);
                    } else if (msg.role === 'user' || msg.role === 'human') {
                        return new HumanMessage(msg.content);
                    } else if (msg.role === 'assistant' || msg.role === 'ai') {
                        return new AIMessage(msg.content);
                    } else {
                        throw new Error(`Unknown message role: ${msg.role}`);
                    }
                });

                const result = await model.generate([langchainMessages]);
                const firstGeneration = result.generations[0][0];

                return {
                    text: firstGeneration.text,
                    usage: result.llmOutput?.usage || {
                        promptTokens: 0,
                        completionTokens: 0,
                        totalTokens: 0
                    }
                };
            }
        }
    ]
};

export default langchainAdapterPlugin;
