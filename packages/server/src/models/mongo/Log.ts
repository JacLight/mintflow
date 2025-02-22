import mongoose from 'mongoose';
import { getMongooseLogSchema } from '../schemas/LogSchema.js';

// ✅ Mongoose Model for Logs
export const LogModel = mongoose.model('Log', getMongooseLogSchema());
