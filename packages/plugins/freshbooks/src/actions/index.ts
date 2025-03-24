import { customApiCall } from './custom-api-call.js';
import { getClient } from './get-client.js';
import { createInvoice } from './create-invoice.js';
import { getExpense } from './get-expense.js';
import { getTimeEntry } from './get-time-entry.js';

export const actions = [
  customApiCall,
  getClient,
  createInvoice,
  getExpense,
  getTimeEntry,
];
