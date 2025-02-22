import mongoose from 'mongoose';
import { getMongooseFlowSchema } from '../schemas/FlowSchema.js';

// ✅ Mongoose Model for Flows
export const FlowModel = mongoose.model('Flow', getMongooseFlowSchema());
