import mongoose from 'mongoose';
import { getMongoosePrivacySchema } from '../schemas/PrivacySchema.js';

// Mongoose Model for Privacy
const modelName = 'privacy';
if (!mongoose.models[modelName]) {
    mongoose.model(modelName, getMongoosePrivacySchema());
}
export const PrivacyModel = mongoose.models[modelName];
