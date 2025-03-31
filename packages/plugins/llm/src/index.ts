// index.ts

import {
    AIPluginConfig,
    TextGenInput,
    EmbeddingInput,
    ListModelsInput,
    ValidateModelInput,
    TextGenerationResponse,
    EmbeddingResponse,
    StreamCallback,
    Model,
    ProviderType
} from './interface/index.js';
import { ProviderServiceError } from './errors/index.js';
import { BaseProvider } from './providers/BaseProvider.js';
import { OpenAIProvider } from './providers/OpenAIProvider.js';
import { AnthropicProvider } from './providers/AnthropicProvider.js';
import { GoogleProvider } from './providers/GoogleProvider.js';
import { OllamaProvider } from './providers/OllamaProvider.js';

// Create provider instance based on configuration
function createProvider(config: AIPluginConfig, providerType: ProviderType): BaseProvider {
    switch (providerType) {
        case 'openai':
            if (!config.providers.openai) {
                throw new Error('OpenAI configuration missing');
            }
            return new OpenAIProvider(config.providers.openai);

        case 'anthropic':
            if (!config.providers.anthropic) {
                throw new Error('Anthropic configuration missing');
            }
            return new AnthropicProvider(config.providers.anthropic);

        case 'google':
            if (!config.providers.google) {
                throw new Error('Google configuration missing');
            }
            return new GoogleProvider(config.providers.google);

        case 'ollama':
            if (!config.providers.ollama) {
                throw new Error('Ollama configuration missing');
            }
            return new OllamaProvider(config.providers.ollama);

        default:
            throw new Error(`Unknown provider type: ${providerType}`);
    }
}

// Try with fallback if primary provider fails
async function tryWithFallback<T>(
    config: AIPluginConfig,
    primaryProvider: ProviderType | undefined,
    action: (provider: BaseProvider) => Promise<T>
): Promise<T> {
    const providerType = primaryProvider || config.defaultProvider;

    try {
        // Try with the primary provider
        const provider = createProvider(config, providerType);
        return await action(provider);
    } catch (error) {
        // If fallback is configured and the error is from the provider, try the fallback
        if (config.fallbackProvider &&
            providerType !== config.fallbackProvider &&
            error instanceof ProviderServiceError) {

            console.log(`Falling back to ${config.fallbackProvider} provider`);
            const fallbackProvider = createProvider(config, config.fallbackProvider);
            return await action(fallbackProvider);
        }

        // Otherwise, rethrow the error
        throw error;
    }
}

// AI Plugin implementation with pure functions
const aiPlugin = {
    id: "ai",
    name: "AI Plugin",
    icon: "GiBrain",
    description: "A plugin to interact with various AI models through APIs and Ollama",
    groups: ["ai"],
    tags: ["ai","nlp","ml","gpt","chatbot","image","text","embedding"],
    version: '1.0.0',
    documentation: "https://docs.example.com/aiPlugin",

    // Input schema definition
    inputSchema: {
        config: { type: 'object' },
        provider: {
            type: 'string',
            enum: ['openai', 'anthropic', 'google', 'ollama']
        },
        model: { type: 'string' },
        prompt: { type: 'string' },
        systemPrompt: { type: 'string' },
        temperature: { type: 'number' },
        maxTokens: { type: 'number' },
        topP: { type: 'number' },
        stream: { type: 'boolean' },
        input: {
            oneOf: [
                { type: 'string' },
                { type: 'array', items: { type: 'string' } }
            ]
        },
        capability: { type: 'string' }
    },

    // Plugin actions
    actions: [
        {
            name: 'generateText',
            execute: async function (input: TextGenInput): Promise<TextGenerationResponse> {
                return tryWithFallback(input.config, input.provider, (provider) => {
                    return provider.generateText({
                        model: input.model,
                        prompt: input.prompt,
                        systemPrompt: input.systemPrompt,
                        temperature: input.temperature,
                        maxTokens: input.maxTokens,
                        topP: input.topP
                    });
                });
            }
        },
        {
            name: 'streamText',
            execute: async function (
                input: TextGenInput,
                callback: StreamCallback
            ): Promise<TextGenerationResponse> {
                return tryWithFallback(input.config, input.provider, (provider) => {
                    return provider.generateTextStream({
                        model: input.model,
                        prompt: input.prompt,
                        systemPrompt: input.systemPrompt,
                        temperature: input.temperature,
                        maxTokens: input.maxTokens,
                        topP: input.topP,
                        stream: true
                    }, callback);
                });
            }
        },
        {
            name: 'generateEmbedding',
            execute: async function (input: EmbeddingInput): Promise<EmbeddingResponse> {
                return tryWithFallback(input.config, input.provider, (provider) => {
                    return provider.generateEmbedding({
                        model: input.model,
                        input: input.input
                    });
                });
            }
        },
        {
            name: 'listModels',
            execute: async function (input: ListModelsInput): Promise<Model[]> {
                if (input.provider) {
                    // List models for a specific provider
                    return tryWithFallback(input.config, input.provider, async (provider) => {
                        const models = await provider.listModels();

                        // Filter by capability if specified
                        if (input.capability) {
                            return models.filter(model =>
                                model.capabilities.includes(input.capability!)
                            );
                        }

                        return models;
                    });
                } else {
                    // List models from all configured providers
                    const allModels: Model[] = [];

                    // Get models from each configured provider
                    const providers = Object.keys(input.config.providers) as ProviderType[];

                    for (const providerType of providers) {
                        try {
                            const provider = createProvider(input.config, providerType);
                            const models = await provider.listModels();

                            // Filter by capability if specified
                            if (input.capability) {
                                allModels.push(...models.filter(model =>
                                    model.capabilities.includes(input.capability!)
                                ));
                            } else {
                                allModels.push(...models);
                            }
                        } catch (error) {
                            console.error(`Error fetching models from ${providerType}:`, error);
                            // Continue with other providers even if one fails
                        }
                    }

                    return allModels;
                }
            }
        },
        {
            name: 'validateModel',
            execute: async function (input: ValidateModelInput): Promise<boolean> {
                return tryWithFallback(input.config, input.provider, (provider) => {
                    return provider.validateModel(input.model);
                });
            }
        }
    ]
};

export default aiPlugin;