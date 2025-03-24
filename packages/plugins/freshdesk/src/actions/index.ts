import { customApiCall } from './custom-api-call.js';
import { getTicket } from './get-ticket.js';
import { createTicket } from './create-ticket.js';
import { getContact } from './get-contact.js';

export const actions = [
  customApiCall,
  getTicket,
  createTicket,
  getContact,
];
