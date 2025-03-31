import mongoose from 'mongoose';
import { getMongooseFlowExecutionSchema } from '../schemas/FlowExecutionSchema.js';

// Mongoose Model for Flow Execution
const modelName = 'flow_execution';
if (!mongoose.models[modelName]) {
    mongoose.model(modelName, getMongooseFlowExecutionSchema());
}
export const FlowExecutionModel = mongoose.models[modelName];
