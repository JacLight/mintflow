import mongoose from 'mongoose';
import { getMongooseFlowRunSchema } from '../schemas/FlowRunSchema.js';

// ✅ Mongoose Model for Flow Runs
export const FlowRunModel = mongoose.model('FlowRun', getMongooseFlowRunSchema());
