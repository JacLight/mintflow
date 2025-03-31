import mongoose from 'mongoose';
import { getMongooseUsageMetricsSchema } from '../schemas/UsageMetricsSchema.js';

// Mongoose Model for Usage Metrics
const modelName = 'usage_metrics';
if (!mongoose.models[modelName]) {
    mongoose.model(modelName, getMongooseUsageMetricsSchema());
}
export const UsageMetricsModel = mongoose.models[modelName];
