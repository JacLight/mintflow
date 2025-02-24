
export type NodeStatus =
    | 'pending'
    | 'running'
    | 'waiting'
    | 'completed'
    | 'failed'
    | 'manual_wait';

export type NodeExecutionMode =
    | 'sync'
    | 'auto'
    | 'manual'
    | 'wait_for_input'
    | 'mqtt'
    | 'http_callback'
    | 'event'
    | 'external';

export interface IBranchCondition {
    condition: string;
    targetNodeId: string;
    evaluator?: (context: any) => boolean;
}

export interface INodeDefinition {
    nodeId: string;
    type: string;
    plugin: string;
    runner: 'node' | 'python';
    config?: any;
    executionMode?: NodeExecutionMode;
    input?: any;
    nextNodes?: string[];
    action: string;
    conditions?: {
        condition: string;
        nextNodeId: string;
    }[];
    branches?: IBranchCondition[];
    manualNextNodes?: string[];
    waitForHttp?: boolean;
    entry?: {
        url: string;
        method?: string;
        headers?: Record<string, string>;
        timeout?: number;
    };
    mqtt?: {
        topic: string;
        timeout?: number;
    };
    http?: {
        callbackUrl: string;
        timeout?: number;
    };
    event?: {
        eventName: string;
        timeout?: number;
    };
}

export interface IFlowNodeState {
    nodeId: string;
    status: NodeStatus;
    plugin: string;
    result?: any;
    logs: string[];
    startedAt?: Date;
    finishedAt?: Date;
    error?: string;
    selectedBranch?: string;
    availableNextNodes?: string[];
    inputRequirements?: any;
    inputData?: any;
    selectedNext?: string;
}

export interface IFlow {
    tenantId: string;
    flowId: string;
    definition: any;
    overallStatus: 'draft' | 'running' | 'paused' | 'completed' | 'failed' | 'waiting' | 'stopped';
    createdAt: Date;
    updatedAt: Date;
    logs?: string[];
    workingState?: any;
    URL: string;
}

export interface IFlowRun {
    tenantId: string;
    flowId: string;
    flowRunId: string;
    status: 'pending' | 'running' | 'paused' | 'completed' | 'failed' | 'waiting' | 'stopped';
    nodeStates: IFlowNodeState[];
    createdAt: Date;
    finishedAt: Date;
    startedAt: Date;
    updatedAt: Date;
    logs?: string[];
    workingData?: any;
    metrics?: any;
}

export interface IFlowContext {
    flowId: string;
    tenantId: string;
    flowRunId: string;
    data: Record<string, any>;
    startedAt: Date;
    lastUpdatedAt: Date;
}
