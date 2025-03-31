import { DataTypes } from 'sequelize';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const PrivacySchemaDefinition = {
    privacyId: {
        type: String,
        default: () => `privacy_${uuidv4()}`,
        unique: true,
        required: true
    },
    tenantId: {
        type: String,
        required: true,
        unique: true
    },
    dataRetention: {
        logs: {
            type: Number,
            required: true,
            default: 30 // days
        },
        analytics: {
            type: Number,
            required: true,
            default: 90 // days
        }
    },
    dataSharingConsent: {
        type: Boolean,
        required: true,
        default: true
    },
    marketingEmails: {
        type: Boolean,
        required: true,
        default: false
    },
    twoFactorAuth: {
        type: Boolean,
        required: true,
        default: false
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
};

export const getMongoosePrivacySchema = () => new mongoose.Schema(PrivacySchemaDefinition, { timestamps: true });

export const getSequelizePrivacySchema = () => ({
    privacyId: { type: DataTypes.STRING, primaryKey: true, defaultValue: () => `privacy_${uuidv4()}` },
    tenantId: { type: DataTypes.STRING, allowNull: false, unique: true },
    dataRetention: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: { logs: 30, analytics: 90 }
    },
    dataSharingConsent: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    marketingEmails: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    twoFactorAuth: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
});
