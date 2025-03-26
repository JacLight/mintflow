import { addContact } from './actions/add-contact.js';
import { deleteContacts } from './actions/delete-contacts.js';
import { sendSms } from './actions/send-sms.js';
import { sendMms } from './actions/send-mms.js';
import { triggers } from './triggers.js';

const krispCallPlugin = {
  name: "krisp-call",
  icon: "",
  description: "KrispCall is a cloud telephony system for modern businesses, offering advanced features for high-growth startups and modern enterprises.",
    groups: ["communication"],
    tags: ["communication","messaging","chat","notification","alert"],
    version: '1.0.0',
  id: "krisp-call",
  runner: "node",
  auth: {
    required: true,
    schema: {
      type: "object",
      properties: {
        api_key: {
          type: "string",
          description: "API Key for KrispCall",
          required: true,
        },
      },
    },
  },
  inputSchema: {
    type: "object",
    properties: {},
  },
  outputSchema: {
    type: "object",
    properties: {},
  },
  exampleInput: {},
  exampleOutput: {},
  documentation: "https://krispcall.com/",
  method: "exec",
  actions: [
    addContact,
    deleteContacts,
    sendSms,
    sendMms,
  ],
  triggers: triggers,
};

export default krispCallPlugin;
