import { customApiCall } from './custom-api-call.js';
import { getClient } from './get-client.js';
import { createInvoice } from './create-invoice.js';
import { getPayment } from './get-payment.js';

export const actions = [
  customApiCall,
  getClient,
  createInvoice,
  getPayment,
];
