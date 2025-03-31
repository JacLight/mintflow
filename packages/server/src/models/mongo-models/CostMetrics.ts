import mongoose from 'mongoose';
import { getMongooseCostMetricsSchema } from '../schemas/CostMetricsSchema.js';

// Mongoose Model for Cost Metrics
const modelName = 'cost_metrics';
if (!mongoose.models[modelName]) {
    mongoose.model(modelName, getMongooseCostMetricsSchema());
}
export const CostMetricsModel = mongoose.models[modelName];
