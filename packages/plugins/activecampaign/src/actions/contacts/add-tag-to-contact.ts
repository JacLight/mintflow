import { makeClient, ActiveCampaignAuth } from '../../common/index.js';

export const addTagToContact = {
    name: "add_tag_to_contact",
    description: "Adds a tag to a contact in ActiveCampaign",
    inputSchema: {
        type: "object",
        properties: {
            contactId: {
                type: "string",
                description: "ID of the contact"
            },
            tagId: {
                type: "string",
                description: "ID of the tag to add"
            }
        },
        required: ["contactId", "tagId"]
    },
    outputSchema: {
        type: "object",
        properties: {
            contactTag: {
                type: "object",
                description: "The created contact-tag association"
            }
        }
    },
    exampleInput: {
        contactId: "123",
        tagId: "456"
    },
    exampleOutput: {
        contactTag: {
            id: "789",
            contact: "123",
            tag: "456"
        }
    },
    execute: async (input: any, auth: ActiveCampaignAuth) => {
        try {
            const { contactId, tagId } = input.data || {};

            if (!contactId) {
                return { error: "Contact ID is required" };
            }

            if (!tagId) {
                return { error: "Tag ID is required" };
            }

            const client = makeClient(auth);
            const result = await client.addTagToContact(contactId, tagId);
            return result;
        } catch (error: any) {
            return {
                error: `Error adding tag to contact: ${error.message || 'Unknown error'}`
            };
        }
    }
};
