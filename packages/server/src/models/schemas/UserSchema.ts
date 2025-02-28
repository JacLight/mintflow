import { DataTypes } from 'sequelize';
import mongoose from 'mongoose';
import Joi from 'joi';
import { v4 as uuidv4 } from 'uuid';

const UserSchemaDefinition = {
    userId: { type: String, default: () => `user_${uuidv4()}`, unique: true, required: true },
    name: { type: String, required: true, minlength: 3, maxlength: 50 },
    email: { type: String, unique: true, required: true, lowercase: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
};

// Mongoose Schema
export const getMongooseUserSchema = () => new mongoose.Schema(UserSchemaDefinition, { timestamps: true });

// Sequelize Schema
export const getSequelizeUserSchema = () => ({
    userId: { type: DataTypes.STRING, primaryKey: true, defaultValue: () => `user_${uuidv4()}` },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, unique: true, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
});
