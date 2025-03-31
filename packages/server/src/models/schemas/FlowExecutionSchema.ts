import { DataTypes } from 'sequelize';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const FlowExecutionStepSchema = {
    name: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'running', 'completed', 'error'],
        required: true
    },
    duration: {
        type: String
    }
};

const FlowExecutionSchemaDefinition = {
    executionId: {
        type: String,
        default: () => `exec_${uuidv4()}`,
        unique: true,
        required: true
    },
    tenantId: {
        type: String,
        required: true
    },
    flowId: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['running', 'paused', 'completed', 'error', 'waiting'],
        required: true
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date
    },
    duration: {
        type: String
    },
    progress: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    nextStep: {
        type: String
    },
    triggers: {
        type: Number,
        default: 0
    },
    errors: {
        type: Number,
        default: 0
    },
    type: {
        type: String,
        enum: ['scheduled', 'api', 'webhook', 'manual'],
        required: true
    },
    steps: {
        type: [FlowExecutionStepSchema],
        default: []
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
};

export const getMongooseFlowExecutionSchema = () => new mongoose.Schema(FlowExecutionSchemaDefinition, { timestamps: true });

export const getSequelizeFlowExecutionSchema = () => ({
    executionId: { type: DataTypes.STRING, primaryKey: true, defaultValue: () => `exec_${uuidv4()}` },
    tenantId: { type: DataTypes.STRING, allowNull: false },
    flowId: { type: DataTypes.STRING, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { isIn: [['running', 'paused', 'completed', 'error', 'waiting']] }
    },
    startTime: { type: DataTypes.DATE, allowNull: false },
    endTime: { type: DataTypes.DATE },
    duration: { type: DataTypes.STRING },
    progress: { type: DataTypes.INTEGER, defaultValue: 0 },
    nextStep: { type: DataTypes.STRING },
    triggers: { type: DataTypes.INTEGER, defaultValue: 0 },
    errors: { type: DataTypes.INTEGER, defaultValue: 0 },
    type: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { isIn: [['scheduled', 'api', 'webhook', 'manual']] }
    },
    steps: { type: DataTypes.JSON, defaultValue: [] }
});
