import { makeClient, ActiveCampaignAuth, CreateWebhookResponse, WEBHOOK_SOURCES } from '../common/index.js';

export const newDealAddedOrUpdated = {
    name: "new_deal_added_or_updated",
    description: "Triggers when a new deal is created or an existing deal is updated",
    inputSchema: {
        type: "object",
        properties: {}
    },
    outputSchema: {
        type: "object",
        properties: {
            type: {
                type: "string",
                description: "The type of event (deal_add or deal_update)"
            },
            date_time: {
                type: "string",
                description: "The date and time of the event"
            },
            deal: {
                type: "object",
                description: "The deal data"
            },
            contact: {
                type: "object",
                description: "The contact associated with the deal"
            }
        }
    },
    exampleOutput: {
        type: "deal_update",
        date_time: "2024-02-28T04:45:41-06:00",
        initiated_from: "admin",
        initiated_by: "admin",
        list: "0",
        contact: {
            id: "3",
            email: "john.doe@example.com",
            first_name: "John",
            last_name: "Doe",
            phone: "",
            ip: "0.0.0.0",
            tags: "1233",
            customer_acct_name: "",
            orgname: "",
        },
        customer_acct_name: "",
        customer_acct_id: "0",
        orgname: "",
        deal: {
            id: "1",
            title: "Test Deal",
            create_date: "2024-02-28 04:36:09",
            create_date_iso: "2024-02-28T04:36:09-06:00",
            orgid: "1",
            orgname: "Acme Corporation",
            stageid: "1",
            stage_title: "To Contact",
            pipelineid: "1",
            pipeline_title: "Test Pipeline",
            value: "1,044,055.00",
            value_raw: "1044055",
            currency: "usd",
            currency_symbol: "$",
            owner: "1",
            owner_firstname: "John",
            owner_lastname: "Doe",
            contactid: "3",
            contact_email: "john.doe@example.com",
            contact_firstname: "John",
            contact_lastname: "Doe",
            status: "0",
            fields: [{ id: "1", key: "Forecasted Close Date", value: "2024-02-08 00:00:00" }],
        },
        updated_fields: ["value"],
    },
    async onEnable(webhookUrl: string, auth: ActiveCampaignAuth) {
        try {
            const client = makeClient(auth);
            const res = await client.subscribeWebhook({
                name: `MintFlow New Deal Hook`,
                url: webhookUrl,
                events: ['deal_add', 'deal_update'],
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
