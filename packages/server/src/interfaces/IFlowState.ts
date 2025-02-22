
export interface IFlowNodeState {
    nodeId: string;                   // e.g. "node1", "node2"
    status: 'pending' | 'running' | 'completed' | 'failed' | 'waiting';
    logs: string[];
    result?: any;                     // store partial results if needed
    startedAt?: Date;
    finishedAt?: Date;
}


export interface IFlow extends Document {
    tenantId: string;
    flowId: string;
    definition: any;     // e.g., { nodes: [...], edges: [...] }
    overallStatus: 'draft' | 'running' | 'paused' | 'completed' | 'failed';
    nodeStates: IFlowNodeState[];    // track each node’s status/logs
    createdAt: Date;
    updatedAt: Date;
    logs?: string[];                 // store general flow logs
    status: string;                  // e.g., "draft", "running", "completed"
}