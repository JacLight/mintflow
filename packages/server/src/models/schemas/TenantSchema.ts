import { DataTypes } from 'sequelize';
import mongoose from 'mongoose';
import Joi from 'joi';
import { v4 as uuidv4 } from 'uuid';

const TenantSchemaDefinition = {
    tenantId: {
        type: String,
        default: () => `tenant_${uuidv4()}`,
        unique: true,
        required: true,
    },
    userId: {
        type: String,
        unique: true,
        required: true,
    },
    name: {
        type: String,
        unique: true,
        required: true,
        minlength: 3,
        maxlength: 50,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
};

export const getMongooseTenantSchema = () => new mongoose.Schema(TenantSchemaDefinition, { timestamps: true });

export const getSequelizeTenantSchema = () => ({
    tenantId: { type: DataTypes.STRING, primaryKey: true, defaultValue: () => `tenant_${uuidv4()}` },
    userId: { type: DataTypes.STRING, unique: true, allowNull: false },
    name: { type: DataTypes.STRING, unique: true, allowNull: false },
    email: { type: DataTypes.STRING, unique: true, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
});
