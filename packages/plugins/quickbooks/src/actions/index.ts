import { customApiCall } from './custom-api-call.js';
import { getCustomer } from './get-customer.js';
import { createInvoice } from './create-invoice.js';
import { getProfitLossReport } from './get-profit-loss-report.js';

export const actions = [
  customApiCall,
  getCustomer,
  createInvoice,
  getProfitLossReport,
];
