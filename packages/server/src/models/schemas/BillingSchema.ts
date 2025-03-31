import { DataTypes } from 'sequelize';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const BillingSchemaDefinition = {
    billingId: {
        type: String,
        default: () => `billing_${uuidv4()}`,
        unique: true,
        required: true
    },
    tenantId: {
        type: String,
        required: true
    },
    plan: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'pending', 'cancelled'],
        required: true
    },
    nextBillingDate: {
        type: Date,
        required: true
    },
    paymentMethod: {
        type: {
            type: String,
            required: true
        },
        last4: {
            type: String,
            required: true
        },
        expiryMonth: {
            type: Number,
            required: true
        },
        expiryYear: {
            type: Number,
            required: true
        },
        brand: {
            type: String,
            required: true
        }
    },
    billingAddress: {
        name: {
            type: String,
            required: true
        },
        line1: {
            type: String,
            required: true
        },
        line2: {
            type: String
        },
        city: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        postalCode: {
            type: String,
            required: true
        },
        country: {
            type: String,
            required: true
        }
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
};

export const getMongooseBillingSchema = () => new mongoose.Schema(BillingSchemaDefinition, { timestamps: true });

export const getSequelizeBillingSchema = () => ({
    billingId: { type: DataTypes.STRING, primaryKey: true, defaultValue: () => `billing_${uuidv4()}` },
    tenantId: { type: DataTypes.STRING, allowNull: false },
    plan: { type: DataTypes.STRING, allowNull: false },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { isIn: [['active', 'inactive', 'pending', 'cancelled']] }
    },
    nextBillingDate: { type: DataTypes.DATE, allowNull: false },
    paymentMethod: { type: DataTypes.JSON, allowNull: false },
    billingAddress: { type: DataTypes.JSON, allowNull: false }
});
