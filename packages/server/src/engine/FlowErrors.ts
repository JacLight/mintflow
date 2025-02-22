// src/errors/FlowErrors.ts

export class FlowError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'FlowError';
    }
}

export class FlowExecutionError extends FlowError {
    constructor(
        public nodeId: string,
        public flowId: string,
        message: string
    ) {
        super(`Flow execution error in node ${nodeId} (flow: ${flowId}): ${message}`);
        this.name = 'FlowExecutionError';
    }
}

export class NodeNotFoundError extends FlowError {
    constructor(nodeId: string) {
        super(`Node not found: ${nodeId}`);
        this.name = 'NodeNotFoundError';
    }
}

export class FlowNotFoundError extends FlowError {
    constructor(flowId: string) {
        super(`Flow not found: ${flowId}`);
        this.name = 'FlowNotFoundError';
    }
}

export class InvalidNodeConfigurationError extends FlowError {
    constructor(nodeId: string, reason: string) {
        super(`Invalid node configuration for ${nodeId}: ${reason}`);
        this.name = 'InvalidNodeConfigurationError';
    }
}

export class NodeExecutionTimeoutError extends FlowError {
    constructor(nodeId: string, timeout: number) {
        super(`Node execution timed out after ${timeout}ms: ${nodeId}`);
        this.name = 'NodeExecutionTimeoutError';
    }
}

export class ExternalServiceError extends FlowError {
    constructor(service: string, message: string) {
        super(`External service (${service}) error: ${message}`);
        this.name = 'ExternalServiceError';
    }
}