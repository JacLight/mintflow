import mongoose from 'mongoose';
import { getMongooseFlowSchema } from '../schemas/FlowSchema.js';

// ✅ Mongoose Model for Flows
const modelName = 'flow';
if (!mongoose.models[modelName]) {
    mongoose.model(modelName, getMongooseFlowSchema());
}
export const FlowModel = mongoose.models[modelName];
