import mongoose from 'mongoose';
import { getMongooseProfileSchema } from '../schemas/ProfileSchema.js';

// Mongoose Model for Profile
const modelName = 'profile';
if (!mongoose.models[modelName]) {
    mongoose.model(modelName, getMongooseProfileSchema());
}
export const ProfileModel = mongoose.models[modelName];
