import mongoose from 'mongoose';
import { getMongooseInvoiceSchema } from '../schemas/InvoiceSchema.js';

// Mongoose Model for Invoice
const modelName = 'invoice';
if (!mongoose.models[modelName]) {
    mongoose.model(modelName, getMongooseInvoiceSchema());
}
export const InvoiceModel = mongoose.models[modelName];
