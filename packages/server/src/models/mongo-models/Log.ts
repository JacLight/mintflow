import mongoose from 'mongoose';
import { getMongooseLogSchema } from '../schemas/LogSchema.js';

// ✅ Mongoose Model for Logs
const modelName = 'log';
if (!mongoose.models[modelName]) {
    mongoose.model(modelName, getMongooseLogSchema());
}
export const LogModel = mongoose.models[modelName];
