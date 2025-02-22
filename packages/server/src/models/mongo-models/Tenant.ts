import mongoose from 'mongoose';
import { getMongooseTenantSchema } from '../schemas/TenantSchema.js';

// ✅ Mongoose Model for Tenants
const modelName = 'tenant';
if (!mongoose.models[modelName]) {
    mongoose.model(modelName, getMongooseTenantSchema());
}
export const TenantModel = mongoose.models[modelName];
