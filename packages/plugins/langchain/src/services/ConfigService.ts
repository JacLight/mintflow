// Configuration service for the LangChain plugin

import { logger } from '@mintflow/common';

/**
 * AI configuration interface
 */
export interface AIConfig {
    provider: string;
    model: string;
    apiKey?: string;
    apiUrl?: string;
    organization?: string;
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
    stop?: string[];
}

/**
 * Plugin configuration interface
 */
export interface PluginConfig {
    ai: AIConfig;
    redis?: {
        host: string;
        port: number;
        password?: string;
        db?: number;
    };
    storage?: {
        type: 'local' | 's3';
        path?: string;
        bucket?: string;
        region?: string;
    };
}

/**
 * Configuration service for the LangChain plugin
 */
export class ConfigService {
    private static instance: ConfigService;
    private config: PluginConfig;

    private constructor() {
        // Default configuration
        this.config = {
            ai: {
                provider: process.env.AI_PROVIDER || 'openai',
                model: process.env.AI_MODEL || 'gpt-3.5-turbo',
                apiKey: process.env.OPENAI_API_KEY || process.env.AI_API_KEY,
                apiUrl: process.env.AI_API_URL,
                organization: process.env.OPENAI_ORGANIZATION,
                temperature: process.env.AI_TEMPERATURE ? parseFloat(process.env.AI_TEMPERATURE) : 0.7,
                maxTokens: process.env.AI_MAX_TOKENS ? parseInt(process.env.AI_MAX_TOKENS) : undefined
            }
        };

        // Log configuration (without sensitive data)
        logger.info('LangChain plugin configuration loaded', {
            provider: this.config.ai.provider,
            model: this.config.ai.model,
            hasApiKey: !!this.config.ai.apiKey
        });
    }

    /**
     * Get singleton instance
     */
    static getInstance(): ConfigService {
        if (!ConfigService.instance) {
            ConfigService.instance = new ConfigService();
        }
        return ConfigService.instance;
    }

    /**
     * Get the full configuration
     */
    getConfig(): PluginConfig {
        return this.config;
    }

    /**
     * Get the AI configuration
     */
    getAIConfig(): AIConfig {
        return this.config.ai;
    }

    /**
     * Update the configuration
     */
    updateConfig(newConfig: Partial<PluginConfig>): void {
        this.config = {
            ...this.config,
            ...newConfig,
            ai: {
                ...this.config.ai,
                ...(newConfig.ai || {})
            }
        };

        logger.info('LangChain plugin configuration updated', {
            provider: this.config.ai.provider,
            model: this.config.ai.model,
            hasApiKey: !!this.config.ai.apiKey
        });
    }

    /**
     * Update the AI configuration
     */
    updateAIConfig(newConfig: Partial<AIConfig>): void {
        this.config.ai = {
            ...this.config.ai,
            ...newConfig
        };

        logger.info('LangChain plugin AI configuration updated', {
            provider: this.config.ai.provider,
            model: this.config.ai.model,
            hasApiKey: !!this.config.ai.apiKey
        });
    }
}
