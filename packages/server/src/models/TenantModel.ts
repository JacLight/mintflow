// server/src/models/FlowModel.ts
import mongoose, { Document, Model } from 'mongoose';

export interface ITenant extends Document {
    id: string;
    name: string;
    email: string;
    password?: string;
    createdAt: Date;
    updatedAt: Date;
}

const TenantSchema = new mongoose.Schema<ITenant>({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true }
}, { timestamps: true });

TenantSchema.index({ name: 1 }, { unique: true });

export const TenantModel: Model<ITenant> = mongoose.model<ITenant>('Tenant', TenantSchema);
