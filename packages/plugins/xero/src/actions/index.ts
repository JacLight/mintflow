import { customApiCall } from './custom-api-call.js';
import { getContact } from './get-contact.js';
import { createInvoice } from './create-invoice.js';
import { getProfitLossReport } from './get-profit-loss-report.js';

export const actions = [
  customApiCall,
  getContact,
  createInvoice,
  getProfitLossReport,
];
