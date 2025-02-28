import { DataTypes } from 'sequelize';
import mongoose from 'mongoose';
import Joi from 'joi';
import { v4 as uuidv4 } from 'uuid';
import { metrics } from 'weaviate-client';

const FlowRunSchemaDefinition = {
    flowRunId: {
        type: String,
        default: () => `flow_run_${uuidv4()}`,
        unique: true,
        required: true
    },
    flowId: { type: String, required: true }, // Foreign key to Flow
    tenantId: { type: String, required: true }, // Foreign key to Tenant
    status: {
        type: String,
        enum: ['pending', 'running', 'completed', 'failed', 'waiting', 'paused', 'stopped'],
        required: true
    },
    nodeStates: [{
        nodeId: String,
        status: String,
        logs: [String],
        result: Object,
        startedAt: Date,
        finishedAt: Date
    }],
    logs: { type: [String], default: [] }, // General logs for this run
    startedAt: { type: Date, default: null },
    finishedAt: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    workingData: { type: Object, default: {} }, // Working data for the flow run
    metrics: {
        completionTimes: { type: [Number], default: [] }, // Array of numbers
        averageCompletionTime: { type: Number, default: 0 },
        activeFlows: { type: Number, default: 0 },
    }, // Metrics for the flow run
};

export const getMongooseFlowRunSchema = () => new mongoose.Schema(FlowRunSchemaDefinition, { timestamps: true });

export const getSequelizeFlowRunSchema = () => ({
    flowRunId: { type: DataTypes.STRING, primaryKey: true, defaultValue: () => `flow_run_${uuidv4()}` },
    flowId: { type: DataTypes.STRING, allowNull: false },
    tenantId: { type: DataTypes.STRING, allowNull: false },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { isIn: [['pending', 'running', 'completed', 'failed', 'waiting']] }
    },
    logs: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
    nodeStates: { type: DataTypes.JSON, allowNull: true },
    startedAt: { type: DataTypes.DATE, allowNull: true },
    finishedAt: { type: DataTypes.DATE, allowNull: true },
});
