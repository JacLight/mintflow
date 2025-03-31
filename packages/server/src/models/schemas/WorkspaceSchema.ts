import { DataTypes } from 'sequelize';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const WorkspaceMemberSchema = {
    id: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true,
        enum: ['Admin', 'Editor', 'Viewer']
    }
};

const WorkspaceSchemaDefinition = {
    workspaceId: {
        type: String,
        default: () => `ws_${uuidv4()}`,
        unique: true,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    tenantId: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    members: {
        type: [WorkspaceMemberSchema],
        default: []
    },
    updatedAt: { type: Date, default: Date.now }
};

export const getMongooseWorkspaceSchema = () => new mongoose.Schema(WorkspaceSchemaDefinition, { timestamps: true });

export const getSequelizeWorkspaceSchema = () => ({
    workspaceId: { type: DataTypes.STRING, primaryKey: true, defaultValue: () => `ws_${uuidv4()}` },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.STRING },
    tenantId: { type: DataTypes.STRING, allowNull: false },
    members: { type: DataTypes.JSON, defaultValue: [] }
});
