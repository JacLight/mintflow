// server/src/models/FlowModel.ts
import mongoose, { Document, Model } from 'mongoose';

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

const FlowSchema = new mongoose.Schema<IFlow>({
    tenantId: { type: String, required: true },
    flowId: { type: String, required: true },
    definition: { type: Object, default: {} },
    overallStatus: { type: String, default: 'draft' },
    nodeStates: { type: [{ type: mongoose.Schema.Types.Mixed }], default: [] },
}, { timestamps: true });

FlowSchema.index({ tenantId: 1, flowId: 1 }, { unique: true });

export const FlowModel: Model<IFlow> = mongoose.model<IFlow>('Flow', FlowSchema);
