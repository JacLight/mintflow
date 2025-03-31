import { DataTypes } from 'sequelize';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const InvoiceItemSchema = {
    description: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    }
};

const InvoiceSchemaDefinition = {
    invoiceId: {
        type: String,
        default: () => `inv_${uuidv4()}`,
        unique: true,
        required: true
    },
    tenantId: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['paid', 'unpaid', 'pending', 'cancelled', 'credited'],
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    pdf: {
        type: String
    },
    items: {
        type: [InvoiceItemSchema],
        default: []
    },
    subtotal: {
        type: Number,
        required: true
    },
    tax: {
        type: Number,
        default: 0
    },
    total: {
        type: Number,
        required: true
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
};

export const getMongooseInvoiceSchema = () => new mongoose.Schema(InvoiceSchemaDefinition, { timestamps: true });

export const getSequelizeInvoiceSchema = () => ({
    invoiceId: { type: DataTypes.STRING, primaryKey: true, defaultValue: () => `inv_${uuidv4()}` },
    tenantId: { type: DataTypes.STRING, allowNull: false },
    amount: { type: DataTypes.FLOAT, allowNull: false },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { isIn: [['paid', 'unpaid', 'pending', 'cancelled', 'credited']] }
    },
    date: { type: DataTypes.DATE, allowNull: false },
    pdf: { type: DataTypes.STRING },
    items: { type: DataTypes.JSON, defaultValue: [] },
    subtotal: { type: DataTypes.FLOAT, allowNull: false },
    tax: { type: DataTypes.FLOAT, defaultValue: 0 },
    total: { type: DataTypes.FLOAT, allowNull: false }
});
