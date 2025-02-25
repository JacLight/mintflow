// Error classes for the langchain plugin

/**
 * Base error class for the langchain plugin
 */
export class LangChainPluginError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'LangChainPluginError';
    }
}

/**
 * Error thrown when a provider service fails
 */
export class ProviderServiceError extends LangChainPluginError {
    constructor(provider: string, message: string) {
        super(`${provider} provider error: ${message}`);
        this.name = 'ProviderServiceError';
    }
}

/**
 * Error thrown when a configuration is invalid
 */
export class ConfigurationError extends LangChainPluginError {
    constructor(message: string) {
        super(`Configuration error: ${message}`);
        this.name = 'ConfigurationError';
    }
}

/**
 * Error thrown when a model is not supported
 */
export class UnsupportedModelError extends LangChainPluginError {
    constructor(provider: string, model: string) {
        super(`Model ${model} is not supported by ${provider} provider`);
        this.name = 'UnsupportedModelError';
    }
}

/**
 * Error thrown when a provider is not supported
 */
export class UnsupportedProviderError extends LangChainPluginError {
    constructor(provider: string) {
        super(`Provider ${provider} is not supported`);
        this.name = 'UnsupportedProviderError';
    }
}

/**
 * Error thrown when a rate limit is exceeded
 */
export class RateLimitError extends LangChainPluginError {
    constructor(provider: string, message: string) {
        super(`${provider} rate limit exceeded: ${message}`);
        this.name = 'RateLimitError';
    }
}

/**
 * Error thrown when an authentication fails
 */
export class AuthenticationError extends LangChainPluginError {
    constructor(provider: string, message: string) {
        super(`${provider} authentication failed: ${message}`);
        this.name = 'AuthenticationError';
    }
}

/**
 * Error thrown when a request times out
 */
export class TimeoutError extends LangChainPluginError {
    constructor(provider: string, timeout: number) {
        super(`${provider} request timed out after ${timeout}ms`);
        this.name = 'TimeoutError';
    }
}
