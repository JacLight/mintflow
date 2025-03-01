import axios from 'axios';
import { generateRazorpayAuthHeader, RazorpayCredentials } from '../utils/index.js';

export const createPaymentLink = {
  name: 'create_payment_link',
  displayName: 'Create Payment Link',
  description: 'Create a payment link in Razorpay',
  inputSchema: {
    type: 'object',
    properties: {
      amount: {
        type: 'number',
        description: 'Amount in INR (e.g., 100.00 for ₹100)',
        required: true,
      },
      currency: {
        type: 'string',
        description: 'Currency code',
        default: 'INR',
        required: true,
      },
      reference_id: {
        type: 'string',
        description: 'Your reference ID for this payment',
        required: false,
      },
      description: {
        type: 'string',
        description: 'Description of the payment',
        required: false,
      },
      customer_name: {
        type: 'string',
        description: 'Name of the customer',
        required: false,
      },
      customer_contact: {
        type: 'string',
        description: 'Contact number of the customer (with country code)',
        default: '+91',
        required: true,
      },
      notify_sms: {
        type: 'boolean',
        description: 'Send notification via SMS',
        default: true,
        required: false,
      },
      customer_email: {
        type: 'string',
        description: 'Email of the customer',
        required: false,
      },
      notify_email: {
        type: 'boolean',
        description: 'Send notification via Email',
        default: true,
        required: false,
      },
      metafield_notes: {
        type: 'string',
        description: 'Additional notes for the payment',
        required: false,
      },
      callback_url: {
        type: 'string',
        description: 'URL to redirect after payment',
        required: false,
      },
      callback_method: {
        type: 'string',
        description: 'HTTP method for callback',
        required: false,
      },
    },
    required: ['amount', 'currency', 'customer_contact'],
  },
  outputSchema: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      entity: { type: 'string' },
      amount: { type: 'number' },
      currency: { type: 'string' },
      status: { type: 'string' },
      description: { type: 'string' },
      short_url: { type: 'string' },
      created_at: { type: 'number' },
      expire_by: { type: 'number' },
    },
  },
  exampleInput: {
    amount: 1000,
    currency: 'INR',
    reference_id: 'order_123',
    description: 'Payment for Order #123',
    customer_name: 'John Doe',
    customer_contact: '+919876543210',
    notify_sms: true,
    customer_email: 'john@example.com',
    notify_email: true,
    metafield_notes: 'Premium Plan',
    callback_url: 'https://example.com/callback',
    callback_method: 'GET',
  },
  exampleOutput: {
    id: 'plink_EXdKy9nT9ywKY4',
    entity: 'payment_link',
    amount: 100000,
    currency: 'INR',
    status: 'created',
    description: 'Payment for Order #123',
    short_url: 'https://rzp.io/i/nxrHnLJ',
    created_at: 1591097057,
    expire_by: 1591183457,
  },
  async execute(input: any, auth: RazorpayCredentials): Promise<any> {
    // Convert amount from rupee format to the format expected by Razorpay (paise)
    const amountWithoutDecimal = Math.round(input.amount * 100);

    const paymentLinkData = {
      amount: amountWithoutDecimal,
      currency: input.currency,
      reference_id: input.reference_id,
      description: input.description,
      customer: {
        name: input.customer_name,
        contact: input.customer_contact,
        email: input.customer_email,
      },
      notify: {
        sms: input.notify_sms,
        email: input.notify_email,
      },
      notes: {
        policy_name: input.metafield_notes,
      },
      callback_url: input.callback_url,
      callback_method: input.callback_method,
    };

    const authHeader = generateRazorpayAuthHeader(auth);

    try {
      const response = await axios.post(
        'https://api.razorpay.com/v1/payment_links',
        paymentLinkData,
        {
          headers: {
            ...authHeader,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(`Razorpay API error: ${error.response.status} - ${error.response.data.error?.description || error.response.statusText}`);
      }
      throw new Error(`Failed to create payment link: ${error.message}`);
    }
  },
};
