import mongoose from 'mongoose';
import { getMongooseBillingSchema } from '../schemas/BillingSchema.js';

// Mongoose Model for Billing
const modelName = 'billing';
if (!mongoose.models[modelName]) {
    mongoose.model(modelName, getMongooseBillingSchema());
}
export const BillingModel = mongoose.models[modelName];
