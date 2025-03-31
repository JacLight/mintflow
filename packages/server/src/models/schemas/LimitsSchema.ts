import { DataTypes } from 'sequelize';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const LimitsSchemaDefinition = {
    limitsId: {
        type: String,
        default: () => `limits_${uuidv4()}`,
        unique: true,
        required: true
    },
    tenantId: {
        type: String,
        required: true,
        unique: true
    },
    apiRateLimit: {
        type: Number,
        required: true,
        default: 100
    },
    maxWorkspaces: {
        type: Number,
        required: true,
        default: 5
    },
    maxMembers: {
        type: Number,
        required: true,
        default: 10
    },
    maxStorage: {
        type: Number,
        required: true,
        default: 10 * 1024 * 1024 * 1024 // 10 GB
    },
    currentUsage: {
        apiCalls: {
            type: Number,
            default: 0
        },
        workspaces: {
            type: Number,
            default: 0
        },
        members: {
            type: Number,
            default: 0
        },
        storage: {
            type: Number,
            default: 0
        }
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
};

export const getMongooseLimitsSchema = () => new mongoose.Schema(LimitsSchemaDefinition, { timestamps: true });

export const getSequelizeLimitsSchema = () => ({
    limitsId: { type: DataTypes.STRING, primaryKey: true, defaultValue: () => `limits_${uuidv4()}` },
    tenantId: { type: DataTypes.STRING, allowNull: false, unique: true },
    apiRateLimit: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 100 },
    maxWorkspaces: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 5 },
    maxMembers: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 10 },
    maxStorage: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 10 * 1024 * 1024 * 1024 }, // 10 GB
    currentUsage: { type: DataTypes.JSON, defaultValue: { apiCalls: 0, workspaces: 0, members: 0, storage: 0 } }
});
