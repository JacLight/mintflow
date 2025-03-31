import { DataTypes } from 'sequelize';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const UsageMetricsSchemaDefinition = {
    usageId: {
        type: String,
        default: () => `usage_${uuidv4()}`,
        unique: true,
        required: true
    },
    tenantId: {
        type: String,
        required: true
    },
    totalRequests: {
        type: Number,
        default: 0
    },
    totalTokens: {
        type: Number,
        default: 0
    },
    requestsByModel: {
        type: Map,
        of: Number,
        default: {}
    },
    tokensByModel: {
        type: Map,
        of: Number,
        default: {}
    },
    period: {
        type: String,
        enum: ['daily', 'weekly', 'monthly'],
        required: true
    },
    date: {
        type: Date,
        default: Date.now,
        required: true
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
};

export const getMongooseUsageMetricsSchema = () => new mongoose.Schema(UsageMetricsSchemaDefinition, { timestamps: true });

export const getSequelizeUsageMetricsSchema = () => ({
    usageId: { type: DataTypes.STRING, primaryKey: true, defaultValue: () => `usage_${uuidv4()}` },
    tenantId: { type: DataTypes.STRING, allowNull: false },
    totalRequests: { type: DataTypes.INTEGER, defaultValue: 0 },
    totalTokens: { type: DataTypes.INTEGER, defaultValue: 0 },
    requestsByModel: {
        type: DataTypes.JSON,
        defaultValue: {}
    },
    tokensByModel: {
        type: DataTypes.JSON,
        defaultValue: {}
    },
    period: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { isIn: [['daily', 'weekly', 'monthly']] }
    },
    date: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
});
