import { DataTypes } from 'sequelize';
import mongoose from 'mongoose';
import Joi from 'joi';
import { v4 as uuidv4 } from 'uuid';

const LogSchemaDefinition = {
    logId: {
        type: String,
        default: () => `log_${uuidv4()}`,
        unique: true,
        required: true
    },
    flowId: { type: String, required: true }, // Foreign key to Flow
    runId: { type: String, required: true },  // Foreign key to FlowRun
    nodeId: { type: String, required: true }, // ID of the node in the workflow
    logLevel: {
        type: String,
        enum: ['debug', 'info', 'warn', 'error'],
        required: true
    },
    message: { type: String, required: true },
    metadata: { type: Object, default: {} }, // Optional metadata for structured logs
    createdAt: { type: Date, default: Date.now },
};

// ✅ **Mongoose Schema (MongoDB)**
export const getMongooseLogSchema = () => new mongoose.Schema(LogSchemaDefinition, { timestamps: true });

// ✅ **Sequelize Schema (PostgreSQL)**
export const getSequelizeLogSchema = () => ({
    logId: { type: DataTypes.STRING, primaryKey: true, defaultValue: () => `log_${uuidv4()}` },
    flowId: { type: DataTypes.STRING, allowNull: false },
    runId: { type: DataTypes.STRING, allowNull: false },
    nodeId: { type: DataTypes.STRING, allowNull: false },
    logLevel: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { isIn: [['debug', 'info', 'warn', 'error']] }
    },
    message: { type: DataTypes.STRING, allowNull: false },
    metadata: { type: DataTypes.JSON, allowNull: true },
});
