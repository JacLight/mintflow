import mongoose from 'mongoose';
import { getMongooseTenantSchema } from '../schemas/TenantSchema.js';

// ✅ Mongoose Model for Tenants
export const TenantModel = mongoose.model('Tenant', getMongooseTenantSchema());
