import { DataTypes } from 'sequelize';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const ApiKeySchemaDefinition = {
    apiKeyId: {
        type: String,
        default: () => `api_key_${uuidv4()}`,
        unique: true,
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    prefix: {
        type: String,
        required: true
    },
    fullKey: {
        type: String,
        required: true
    },
    created: {
        type: Date,
        default: Date.now
    },
    workspace: {
        type: String,
        required: true
    },
    environment: {
        type: String,
        enum: ['Production', 'Development'],
        required: true
    },
    lastUsed: {
        type: Date,
        default: null
    },
    tenantId: {
        type: String,
        required: true
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
};

export const getMongooseApiKeySchema = () => new mongoose.Schema(ApiKeySchemaDefinition, { timestamps: true });

export const getSequelizeApiKeySchema = () => ({
    apiKeyId: { type: DataTypes.STRING, primaryKey: true, defaultValue: () => `api_key_${uuidv4()}` },
    name: { type: DataTypes.STRING, allowNull: false },
    prefix: { type: DataTypes.STRING, allowNull: false },
    fullKey: { type: DataTypes.STRING, allowNull: false },
    created: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    workspace: { type: DataTypes.STRING, allowNull: false },
    environment: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { isIn: [['Production', 'Development']] }
    },
    lastUsed: { type: DataTypes.DATE, allowNull: true },
    tenantId: { type: DataTypes.STRING, allowNull: false }
});
