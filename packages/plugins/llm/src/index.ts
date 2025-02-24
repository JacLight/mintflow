import { ProviderServiceError } from "./errors/index.js";
import { AIPluginConfig, EmbeddingInput, EmbeddingResponse, ListModelsInput, Model, ProviderType, StreamCallback, TextGenerationResponse, TextGenInput } from "./interface/index.js";
import { AnthropicProvider } from "./providers/AnthropicProvider.js";
import { BaseProvider } from "./providers/BaseProvider.js";
import { GoogleProvider } from "./providers/GoogleProvider.js";
import { OllamaProvider } from "./providers/OllamaProvider.js";
import { OpenAIProvider } from "./providers/OpenAIProvider.js";

// AI Plugin implementation
const aiPlugin = {
    id: "ai",
    name: "AI Plugin",
    icon: "GiBrain",
    description: "A plugin to interact with various AI models through APIs and Ollama",
    documentation: "https://docs.example.com/aiPlugin",

    // Input schema definition
    inputSchema: {
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

    // Plugin configuration (set during initialization)
    config: null as AIPluginConfig | null,

    // Provider instances cache
    providerInstances: new Map<ProviderType, BaseProvider>(),

    // Initialize the plugin with configuration
    initialize: function (config: AIPluginConfig) {
        this.config = config;
        this.providerInstances.clear();
        return this;
    },

    // Get a provider instance (create if it doesn't exist)
    getProvider: function (providerType?: ProviderType): BaseProvider {
        // If no provider specified, use default
        const type = providerType || (this.config?.defaultProvider || 'openai');

        // Check if we already have this provider instance
        if (this.providerInstances.has(type)) {
            return this.providerInstances.get(type)!;
        }

        // Make sure we have config
        if (!this.config) {
            throw new Error('AI Plugin not initialized with configuration');
        }

        // Create the appropriate provider
        let provider: BaseProvider;

        switch (type) {
            case 'openai':
                if (!this.config.providers.openai) {
                    throw new Error('OpenAI configuration missing');
                }
                provider = new OpenAIProvider(this.config.providers.openai);
                break;

            case 'anthropic':
                if (!this.config.providers.anthropic) {
                    throw new Error('Anthropic configuration missing');
                }
                provider = new AnthropicProvider(this.config.providers.anthropic);
                break;

            case 'google':
                if (!this.config.providers.google) {
                    throw new Error('Google configuration missing');
                }
                provider = new GoogleProvider(this.config.providers.google);
                break;

            case 'ollama':
                if (!this.config.providers.ollama) {
                    throw new Error('Ollama configuration missing');
                }
                provider = new OllamaProvider(this.config.providers.ollama);
                break;

            default:
                throw new Error(`Unknown provider type: ${type}`);
        }

        // Cache the provider instance
        this.providerInstances.set(type, provider);
        return provider;
    },

    // Try with fallback if primary provider fails
    tryWithFallback: async function <T>(
        primaryProvider: ProviderType | undefined,
        action: (provider: BaseProvider) => Promise<T>
    ): Promise<T> {
        try {
            // Try with the primary provider
            const provider = this.getProvider(primaryProvider);
            return await action(provider);
        } catch (error) {
            // If fallback is configured and the error is from the provider, try the fallback
            if (this.config?.fallbackProvider &&
                primaryProvider !== this.config.fallbackProvider &&
                error instanceof ProviderServiceError) {

                console.log(`Falling back to ${this.config.fallbackProvider} provider`);
                const fallbackProvider = this.getProvider(this.config.fallbackProvider);
                return await action(fallbackProvider);
            }

            // Otherwise, rethrow the error
            throw error;
        }
    },

    // Plugin actions
    actions: [
        {
            name: 'generateText',
            execute: async function (input: TextGenInput): Promise<TextGenerationResponse> {
                return aiPlugin.tryWithFallback(input.provider, (provider) => {
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
                return aiPlugin.tryWithFallback(input.provider, (provider) => {
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
                return aiPlugin.tryWithFallback(input.provider, (provider) => {
                    return provider.generateEmbedding({
                        model: input.model,
                        input: input.input
                    });
                });
            }
        },
        {
            name: 'listModels',
            execute: async function (input?: ListModelsInput): Promise<Model[]> {
                if (input?.provider) {
                    // List models for a specific provider
                    const provider = aiPlugin.getProvider(input.provider);
                    const models = await provider.listModels();

                    // Filter by capability if specified
                    if (input.capability) {
                        return models.filter(model =>
                            model.capabilities.includes(input.capability!)
                        );
                    }

                    return models;
                } else {
                    // List models from all configured providers
                    const allModels: Model[] = [];

                    // Make sure we have config
                    if (!aiPlugin.config) {
                        throw new Error('AI Plugin not initialized with configuration');
                    }

                    // Get models from each configured provider
                    const providers = Object.keys(aiPlugin.config.providers) as ProviderType[];

                    for (const providerType of providers) {
                        try {
                            const provider = aiPlugin.getProvider(providerType);
                            const models = await provider.listModels();

                            // Filter by capability if specified
                            if (input?.capability) {
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
            execute: async function (input: { provider?: ProviderType, model: string }): Promise<boolean> {
                return aiPlugin.tryWithFallback(input.provider, (provider) => {
                    return provider.validateModel(input.model);
                });
            }
        },
        {
            name: 'clearModelCache',
            execute: async function (input?: { provider?: ProviderType }): Promise<void> {
                if (input?.provider) {
                    // Clear cache for a specific provider
                    const provider = aiPlugin.getProvider(input.provider);
                    if ('clearModelCache' in provider) {
                        (provider as any).clearModelCache();
                    }
                } else {
                    // Clear cache for all providers
                    for (const [, provider] of aiPlugin.providerInstances) {
                        if ('clearModelCache' in provider) {
                            (provider as any).clearModelCache();
                        }
                    }
                }
            }
        }
    ]
};

export default aiPlugin;