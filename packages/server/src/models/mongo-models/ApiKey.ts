import mongoose from 'mongoose';
import { getMongooseApiKeySchema } from '../schemas/ApiKeySchema.js';

// Mongoose Model for API Keys
const modelName = 'api_key';
if (!mongoose.models[modelName]) {
    mongoose.model(modelName, getMongooseApiKeySchema());
}
export const ApiKeyModel = mongoose.models[modelName];
