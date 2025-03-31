import { DataTypes } from 'sequelize';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const CostMetricsSchemaDefinition = {
    costId: {
        type: String,
        default: () => `cost_${uuidv4()}`,
        unique: true,
        required: true
    },
    tenantId: {
        type: String,
        required: true
    },
    totalCost: {
        type: Number,
        default: 0
    },
    costByModel: {
        type: Map,
        of: Number,
        default: {}
    },
    costByWorkspace: {
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

export const getMongooseCostMetricsSchema = () => new mongoose.Schema(CostMetricsSchemaDefinition, { timestamps: true });

export const getSequelizeCostMetricsSchema = () => ({
    costId: { type: DataTypes.STRING, primaryKey: true, defaultValue: () => `cost_${uuidv4()}` },
    tenantId: { type: DataTypes.STRING, allowNull: false },
    totalCost: { type: DataTypes.FLOAT, defaultValue: 0 },
    costByModel: {
        type: DataTypes.JSON,
        defaultValue: {}
    },
    costByWorkspace: {
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
