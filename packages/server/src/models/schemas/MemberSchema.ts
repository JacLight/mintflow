import { DataTypes } from 'sequelize';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const MemberSchemaDefinition = {
    memberId: {
        type: String,
        default: () => `member_${uuidv4()}`,
        unique: true,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    role: {
        type: String,
        required: true,
        enum: ['Admin', 'Editor', 'Viewer']
    },
    status: {
        type: String,
        required: true,
        enum: ['Active', 'Pending', 'Inactive']
    },
    joinedAt: {
        type: Date,
        default: Date.now
    },
    tenantId: {
        type: String,
        required: true
    },
    workspaces: {
        type: [String],
        default: []
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
};

export const getMongooseMemberSchema = () => new mongoose.Schema(MemberSchemaDefinition, { timestamps: true });

export const getSequelizeMemberSchema = () => ({
    memberId: { type: DataTypes.STRING, primaryKey: true, defaultValue: () => `member_${uuidv4()}` },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    role: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { isIn: [['Admin', 'Editor', 'Viewer']] }
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { isIn: [['Active', 'Pending', 'Inactive']] }
    },
    joinedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    tenantId: { type: DataTypes.STRING, allowNull: false },
    workspaces: { type: DataTypes.JSON, defaultValue: [] }
});
