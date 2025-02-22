import { DataTypes } from 'sequelize';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const FlowSchemaDefinition = {
    flowId: {
        type: String,
        default: () => `flow_${uuidv4()}`,
        unique: true,
        required: true,
    },
    tenantId: { type: String, required: true },
    definition: { type: Object, required: true },
    overallStatus: {
        type: String,
        enum: ['draft', 'running', 'paused', 'completed', 'failed'],
        required: true,
    },
    nodeStates: [{
        nodeId: String,
        status: String,
        logs: [String],
        result: Object,
        startedAt: Date,
        finishedAt: Date
    }],
    logs: [String],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
};

export const getMongooseFlowSchema = () => new mongoose.Schema(FlowSchemaDefinition, { timestamps: true });

export const getSequelizeFlowSchema = () => ({
    flowId: { type: DataTypes.STRING, primaryKey: true, defaultValue: () => `flow_${uuidv4()}` },
    tenantId: { type: DataTypes.STRING, allowNull: false },
    definition: { type: DataTypes.JSON, allowNull: false },
    overallStatus: { type: DataTypes.STRING, allowNull: false },
});
