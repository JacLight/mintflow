import mongoose from 'mongoose';
import { getMongooseLimitsSchema } from '../schemas/LimitsSchema.js';

// Mongoose Model for Limits
const modelName = 'limits';
if (!mongoose.models[modelName]) {
    mongoose.model(modelName, getMongooseLimitsSchema());
}
export const LimitsModel = mongoose.models[modelName];
