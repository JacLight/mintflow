import { MailchimpClient } from './client.js';
import {
    MailchimpAuth,
    MailchimpMemberStatus,
    MailchimpSubscribeWebhookData,
    MailchimpUnsubscribeWebhookData,
    MailchimpWebhookRequest
} from './models.js';

// Create a default client instance with empty auth
const defaultClient = new MailchimpClient({
    access_token: ''
});

const mailchimpPlugin = {
    name: "Mailchimp",
    icon: "",
    description: "Email marketing and automation platform",
    id: "mailchimp",
    runner: "node",
    inputSchema: {
        type: "object",
        properties: {
            action: {
                type: 'string',
                enum: [
                    'add_member_to_list',
                    'update_subscriber_status',
                    'add_note_to_subscriber',
                    'add_subscriber_to_tag',
                    'remove_subscriber_from_tag'
                ],
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Action to perform on Mailchimp',
            },
            access_token: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'OAuth access token for Mailchimp',
            },
            // Fields for add_member_to_list
            list_id: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Audience (list) ID',
                rules: [
                    { operation: 'notEqual', valueA: 'add_member_to_list', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'update_subscriber_status', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'add_note_to_subscriber', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'add_subscriber_to_tag', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'remove_subscriber_from_tag', valueB: '{{action}}', action: 'hide' },
                ],
            },
            email: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Email address of the subscriber',
                rules: [
                    { operation: 'notEqual', valueA: 'add_member_to_list', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'update_subscriber_status', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'add_note_to_subscriber', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'add_subscriber_to_tag', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'remove_subscriber_from_tag', valueB: '{{action}}', action: 'hide' },
                ],
            },
            first_name: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'First name of the subscriber',
                rules: [
                    { operation: 'notEqual', valueA: 'add_member_to_list', valueB: '{{action}}', action: 'hide' },
                ],
            },
            last_name: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Last name of the subscriber',
                rules: [
                    { operation: 'notEqual', valueA: 'add_member_to_list', valueB: '{{action}}', action: 'hide' },
                ],
            },
            status: {
                type: 'string',
                enum: [
                    'subscribed',
                    'unsubscribed',
                    'cleaned',
                    'pending',
                    'transactional'
                ],
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Subscription status',
                rules: [
                    { operation: 'notEqual', valueA: 'add_member_to_list', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'update_subscriber_status', valueB: '{{action}}', action: 'hide' },
                ],
            },
            // Fields for add_note_to_subscriber
            note: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Note to add to the subscriber',
                rules: [
                    { operation: 'notEqual', valueA: 'add_note_to_subscriber', valueB: '{{action}}', action: 'hide' },
                ],
            },
            // Fields for add_subscriber_to_tag and remove_subscriber_from_tag
            tag_name: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Tag name',
                rules: [
                    { operation: 'notEqual', valueA: 'add_subscriber_to_tag', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'remove_subscriber_from_tag', valueB: '{{action}}', action: 'hide' },
                ],
            },
            // Webhook configuration for triggers
            webhook_url: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Webhook URL for triggers',
                rules: [
                    { operation: 'notEqual', valueA: 'subscribe_trigger', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'unsubscribe_trigger', valueB: '{{action}}', action: 'hide' },
                ],
            },
        },
        required: ['action', 'access_token'],
    },
    outputSchema: {
        type: "object",
    },
    exampleInput: {
        action: 'add_member_to_list',
        access_token: 'your-oauth-access-token',
        list_id: '1a2b3c4d5e',
        email: 'subscriber@example.com',
        first_name: 'John',
        last_name: 'Doe',
        status: 'subscribed'
    },
    exampleOutput: {
        "id": "1a2b3c4d5e",
        "email_address": "subscriber@example.com",
        "unique_email_id": "abc123",
        "status": "subscribed",
        "merge_fields": {
            "FNAME": "John",
            "LNAME": "Doe"
        }
    },
    documentation: "https://mailchimp.com/developer/marketing/api/",
    method: "exec",
    actions: [
        {
            name: 'mailchimp',
            execute: async (input: any, context?: any): Promise<any> => {
                const { action, access_token } = input;

                if (!action || !access_token) {
                    throw new Error('Missing required parameters: action, access_token');
                }

                // Create a client instance, using the context's axios instance if provided
                const auth: MailchimpAuth = {
                    access_token
                };

                const client = context?.axiosInstance ?
                    new MailchimpClient(auth, context.axiosInstance) :
                    new MailchimpClient(auth);

                // Initialize the client
                await client.initialize();

                switch (action) {
                    case 'add_member_to_list': {
                        const { list_id, email, first_name, last_name, status } = input;

                        if (!list_id || !email || !status) {
                            throw new Error('Missing required parameters: list_id, email, status');
                        }

                        const memberData = {
                            email_address: email,
                            status,
                            merge_fields: {
                                FNAME: first_name || '',
                                LNAME: last_name || ''
                            }
                        };

                        return await client.addMemberToList(list_id, memberData);
                    }

                    case 'update_subscriber_status': {
                        const { list_id, email, status } = input;

                        if (!list_id || !email || !status) {
                            throw new Error('Missing required parameters: list_id, email, status');
                        }

                        const subscriberHash = client.getMD5Hash(email);

                        return await client.updateMember(list_id, subscriberHash, {
                            status
                        });
                    }

                    case 'add_note_to_subscriber': {
                        const { list_id, email, note } = input;

                        if (!list_id || !email || !note) {
                            throw new Error('Missing required parameters: list_id, email, note');
                        }

                        const subscriberHash = client.getMD5Hash(email);

                        return await client.addNoteToSubscriber(list_id, subscriberHash, note);
                    }

                    case 'add_subscriber_to_tag': {
                        const { list_id, email, tag_name } = input;

                        if (!list_id || !email || !tag_name) {
                            throw new Error('Missing required parameters: list_id, email, tag_name');
                        }

                        const subscriberHash = client.getMD5Hash(email);

                        await client.addTagToSubscriber(list_id, subscriberHash, tag_name);
                        return { success: true, message: `Tag "${tag_name}" added to subscriber ${email}` };
                    }

                    case 'remove_subscriber_from_tag': {
                        const { list_id, email, tag_name } = input;

                        if (!list_id || !email || !tag_name) {
                            throw new Error('Missing required parameters: list_id, email, tag_name');
                        }

                        const subscriberHash = client.getMD5Hash(email);

                        await client.removeTagFromSubscriber(list_id, subscriberHash, tag_name);
                        return { success: true, message: `Tag "${tag_name}" removed from subscriber ${email}` };
                    }

                    // Handle webhook payloads for triggers
                    case 'process_webhook': {
                        const { body } = input;

                        if (!body || !body.type) {
                            throw new Error('Invalid webhook payload');
                        }

                        const webhookRequest = body as MailchimpWebhookRequest<any>;

                        switch (webhookRequest.type) {
                            case 'subscribe':
                                return {
                                    event: 'subscribe',
                                    data: webhookRequest.data as MailchimpSubscribeWebhookData
                                };

                            case 'unsubscribe':
                                return {
                                    event: 'unsubscribe',
                                    data: webhookRequest.data as MailchimpUnsubscribeWebhookData
                                };

                            default:
                                return {
                                    event: webhookRequest.type,
                                    data: webhookRequest.data
                                };
                        }
                    }

                    default:
                        throw new Error(`Unsupported action: ${action}`);
                }
            }
        }
    ]
};

export { MailchimpClient };
export default mailchimpPlugin;
