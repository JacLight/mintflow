import { createAccount } from './actions/accounts/create-account.js';
import { updateAccount } from './actions/accounts/update-account.js';
import { createContact } from './actions/contacts/create-contact.js';
import { updateContact } from './actions/contacts/update-contact.js';
import { addTagToContact } from './actions/contacts/add-tag-to-contact.js';
import { addContactToAccount } from './actions/contacts/add-contact-to-account.js';
import { subscribeOrUnsubscribeContactFromList } from './actions/contacts/subscribe-or-unsubscribe-contact-from-list.js';
import { newDealAddedOrUpdated } from './triggers/new-deal-added-or-updated.js';
import { updatedContact } from './triggers/updated-contact.js';
import { tagAddedOrRemovedFromContact } from './triggers/tag-added-or-removed-from-contact.js';

const activecampaignPlugin = {
    name: "ActiveCampaign",
    icon: "🚀",
    description: "Marketing automation, email marketing, and CRM tools for creating incredible customer experiences",
    id: "activecampaign",
    runner: "node",
    documentation: "https://mintflow.com/docs/plugins/activecampaign",
    auth: {
        type: "object",
        properties: {
            apiUrl: {
                type: "string",
                description: "ActiveCampaign API URL (e.g., https://your-account.api-us1.com)"
            },
            apiKey: {
                type: "string",
                description: "ActiveCampaign API Key",
                secret: true
            }
        },
        required: ["apiUrl", "apiKey"]
    },
    actions: [
        createAccount,
        updateAccount,
        createContact,
        updateContact,
        addTagToContact,
        addContactToAccount,
        subscribeOrUnsubscribeContactFromList
    ],
    triggers: [
        newDealAddedOrUpdated,
        updatedContact,
        tagAddedOrRemovedFromContact
    ]
};

export default activecampaignPlugin;
