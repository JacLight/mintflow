import { DataTypes } from 'sequelize';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const ProfileSchemaDefinition = {
    profileId: {
        type: String,
        default: () => `profile_${uuidv4()}`,
        unique: true,
        required: true
    },
    userId: {
        type: String,
        required: true,
        unique: true
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
    avatar: {
        type: String
    },
    role: {
        type: String,
        required: true,
        enum: ['Admin', 'Editor', 'Viewer']
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    preferences: {
        theme: {
            type: String,
            default: 'light'
        },
        notifications: {
            type: Boolean,
            default: true
        }
    }
};

export const getMongooseProfileSchema = () => new mongoose.Schema(ProfileSchemaDefinition, { timestamps: true });

export const getSequelizeProfileSchema = () => ({
    profileId: { type: DataTypes.STRING, primaryKey: true, defaultValue: () => `profile_${uuidv4()}` },
    userId: { type: DataTypes.STRING, allowNull: false, unique: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    avatar: { type: DataTypes.STRING },
    role: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { isIn: [['Admin', 'Editor', 'Viewer']] }
    },
    preferences: { type: DataTypes.JSON, defaultValue: { theme: 'light', notifications: true } }
});
