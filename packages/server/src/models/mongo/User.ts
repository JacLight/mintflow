import mongoose from 'mongoose';
import { getMongooseUserSchema } from '../schemas/UserSchema.js';

// ✅ Mongoose Model for Users
export const UserModel = mongoose.model('User', getMongooseUserSchema());
