import { makeClient, ActiveCampaignAuth, WEBHOOK_SOURCES } from '../common/index.js';

export const tagAddedOrRemovedFromContact = {
    name: "tag_added_or_removed_from_contact",
    description: "Triggers when a tag is added to or removed from a contact in ActiveCampaign",
    inputSchema: {
        type: "object",
        properties: {}
    },
    outputSchema: {
        type: "object",
        properties: {
            type: {
                type: "string",
                description: "The type of event (contact_tag_added or contact_tag_removed)"
            },
            date_time: {
                type: "string",
                description: "The date and time of the event"
            },
            contact: {
                type: "object",
                description: "The contact data"
            },
            tag: {
                type: "object",
                description: "The tag data"
            }
        }
    },
    exampleOutput: {
        type: "contact_tag_added",
        date_time: "2024-02-28T04:45:41-06:00",
        initiated_from: "admin",
        initiated_by: "admin",
        contact: {
            id: "3",
            email: "john.doe@example.com",
            first_name: "John",
            last_name: "Doe",
            phone: "123-456-7890",
            ip: "0.0.0.0",
            tags: "1233",
            customer_acct_name: "",
            orgname: "",
        },
        tag: {
            id: "5",
            tag: "Customer",
            tagType: "contact",
            description: "Active customer"
        }
    },
    async onEnable(webhookUrl: string, auth: ActiveCampaignAuth) {
        try {
            const client = makeClient(auth);
            const res = await client.subscribeWebhook({
                name: `MintFlow Tag Added/Removed Hook`,
                url: webhookUrl,
                events: ['contact_tag_added', 'contact_tag_removed'],
                sources: WEBHOOK_SOURCES,
            });
            return { webhookId: res.webhook.id };
        } catch (error: any) {
            throw new Error(`Failed to create webhook: ${error.message}`);
        }
    },
    async onDisable(hookData: { webhookId: string }, auth: ActiveCampaignAuth) {
        if (hookData?.webhookId) {
            try {
                const client = makeClient(auth);
                await client.unsubscribeWebhook(hookData.webhookId);
            } catch (error: any) {
                throw new Error(`Failed to delete webhook: ${error.message}`);
            }
        }
    },
    async run(payload: any) {
        return payload;
    }
};
