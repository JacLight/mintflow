import mongoose from 'mongoose';
import { getMongooseFlowRunSchema } from '../schemas/FlowRunSchema.js';

// ✅ Mongoose Model for Flow Runs
const modelName = 'flow_run';
if (!mongoose.models[modelName]) {
    mongoose.model(modelName, getMongooseFlowRunSchema());
}
export const FlowRunModel = mongoose.models[modelName];
