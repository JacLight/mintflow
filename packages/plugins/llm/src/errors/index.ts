// errors/index.ts

export class AIPluginError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'AIPluginError';
    }
}

export class ProviderServiceError extends AIPluginError {
    constructor(
        public provider: string,
        message: string
    ) {
        super(`${provider} service error: ${message}`);
        this.name = 'ProviderServiceError';
    }
}

export class ModelNotFoundError extends AIPluginError {
    constructor(
        public provider: string,
        public modelId: string
    ) {
        super(`Model '${modelId}' not found for provider '${provider}'`);
        this.name = 'ModelNotFoundError';
    }
}

export class ProviderNotConfiguredError extends AIPluginError {
    constructor(
        public provider: string
    ) {
        super(`Provider '${provider}' is not configured`);
        this.name = 'ProviderNotConfiguredError';
    }
}

export class CapabilityNotSupportedError extends AIPluginError {
    constructor(
        public provider: string,
        public capability: string
    ) {
        super(`Capability '${capability}' is not supported by provider '${provider}'`);
        this.name = 'CapabilityNotSupportedError';
    }
}