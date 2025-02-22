import mongoose from 'mongoose';
import { getMongooseUserSchema } from '../schemas/UserSchema.js';

// ✅ Mongoose Model for Users
const modelName = 'user';
if (!mongoose.models[modelName]) {
    mongoose.model(modelName, getMongooseUserSchema());
}
export const UserModel = mongoose.models[modelName];
