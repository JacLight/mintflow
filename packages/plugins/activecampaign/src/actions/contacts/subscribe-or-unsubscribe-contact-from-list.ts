import { makeClient, ActiveCampaignAuth } from '../../common/index.js';

export const subscribeOrUnsubscribeContactFromList = {
    name: "subscribe_or_unsubscribe_contact_from_list",
    description: "Subscribes or unsubscribes a contact from a list in ActiveCampaign",
    inputSchema: {
        type: "object",
        properties: {
            contactId: {
                type: "string",
                description: "ID of the contact"
            },
            listId: {
                type: "string",
                description: "ID of the list"
            },
            status: {
                type: "string",
                description: "Subscription status",
                enum: ["1", "2"],
                enumNames: ["Subscribed", "Unsubscribed"],
                default: "1"
            }
        },
        required: ["contactId", "listId", "status"]
    },
    outputSchema: {
        type: "object",
        properties: {
            contactList: {
                type: "object",
                description: "The created or updated contact-list association"
            }
        }
    },
    exampleInput: {
        contactId: "123",
        listId: "456",
        status: "1"
    },
    exampleOutput: {
        contactList: {
            id: "789",
            contact: "123",
            list: "456",
            status: "1"
        }
    },
    execute: async (input: any, auth: ActiveCampaignAuth) => {
        try {
            const { contactId, listId, status } = input.data || {};

            if (!contactId) {
                return { error: "Contact ID is required" };
            }

            if (!listId) {
                return { error: "List ID is required" };
            }

            if (!status) {
                return { error: "Status is required" };
            }

            if (status !== "1" && status !== "2") {
                return { error: "Status must be either '1' (Subscribed) or '2' (Unsubscribed)" };
            }

            const client = makeClient(auth);
            const result = await client.addContactToList(listId, contactId, status);
            return result;
        } catch (error: any) {
            return {
                error: `Error updating contact list subscription: ${error.message || 'Unknown error'}`
            };
        }
    }
};
