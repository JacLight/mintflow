import intercomPlugin, { IntercomClient } from '../src/index.js';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';

describe('intercomPlugin', () => {
    let mock: MockAdapter;
    let axiosInstance: any;
    let executeIntercom: any;

    beforeEach(() => {
        // Create a new axios instance for testing
        axiosInstance = axios.create();

        // Create a mock adapter for the axios instance
        mock = new MockAdapter(axiosInstance);

        // Get the execute function from the plugin
        executeIntercom = intercomPlugin.actions[0].execute;
    });

    afterEach(() => {
        // Reset and restore the mock
        mock.reset();
        mock.restore();
    });

    it('should list contacts successfully', async () => {
        // Mock the contacts endpoint
        mock.onGet('https://api.intercom.io/contacts').reply(200, {
            data: [
                {
                    id: 'contact1',
                    type: 'contact',
                    role: 'user',
                    name: 'John Doe',
                    email: 'john.doe@example.com'
                }
            ]
        });

        const input = {
            action: 'list_contacts',
            accessToken: 'test-token',
            region: 'intercom'
        };

        // Pass the axiosInstance in the context
        const result = await executeIntercom(input, { axiosInstance });

        expect(result).toEqual({
            data: [
                {
                    id: 'contact1',
                    type: 'contact',
                    role: 'user',
                    name: 'John Doe',
                    email: 'john.doe@example.com'
                }
            ]
        });
    });

    it('should find a contact successfully', async () => {
        // Mock the contact endpoint
        mock.onGet('https://api.intercom.io/contacts/contact1').reply(200, {
            id: 'contact1',
            type: 'contact',
            role: 'user',
            name: 'John Doe',
            email: 'john.doe@example.com'
        });

        const input = {
            action: 'find_contact',
            accessToken: 'test-token',
            region: 'intercom',
            contactId: 'contact1'
        };

        // Pass the axiosInstance in the context
        const result = await executeIntercom(input, { axiosInstance });

        expect(result).toEqual({
            id: 'contact1',
            type: 'contact',
            role: 'user',
            name: 'John Doe',
            email: 'john.doe@example.com'
        });
    });

    it('should create a user successfully', async () => {
        // Mock the create user endpoint
        mock.onPost('https://api.intercom.io/contacts').reply(200, {
            id: 'contact1',
            type: 'contact',
            role: 'user',
            name: 'John Doe',
            email: 'john.doe@example.com'
        });

        const input = {
            action: 'create_user',
            accessToken: 'test-token',
            region: 'intercom',
            contactData: {
                name: 'John Doe',
                email: 'john.doe@example.com'
            }
        };

        // Pass the axiosInstance in the context
        const result = await executeIntercom(input, { axiosInstance });

        expect(result).toEqual({
            id: 'contact1',
            type: 'contact',
            role: 'user',
            name: 'John Doe',
            email: 'john.doe@example.com'
        });
    });

    it('should add a note to a user successfully', async () => {
        // Mock the add note endpoint
        mock.onPost('https://api.intercom.io/contacts/contact1/notes').reply(200, {
            type: 'note',
            id: 'note1',
            body: 'This is a test note'
        });

        const input = {
            action: 'add_note_to_user',
            accessToken: 'test-token',
            region: 'intercom',
            contactId: 'contact1',
            noteBody: 'This is a test note'
        };

        // Pass the axiosInstance in the context
        const result = await executeIntercom(input, { axiosInstance });

        expect(result).toEqual({
            type: 'note',
            id: 'note1',
            body: 'This is a test note'
        });
    });

    it('should list companies successfully', async () => {
        // Mock the companies endpoint
        mock.onGet('https://api.intercom.io/companies').reply(200, {
            data: [
                {
                    id: 'company1',
                    type: 'company',
                    name: 'Acme Inc',
                    company_id: 'acme'
                }
            ]
        });

        const input = {
            action: 'list_companies',
            accessToken: 'test-token',
            region: 'intercom'
        };

        // Pass the axiosInstance in the context
        const result = await executeIntercom(input, { axiosInstance });

        expect(result).toEqual({
            data: [
                {
                    id: 'company1',
                    type: 'company',
                    name: 'Acme Inc',
                    company_id: 'acme'
                }
            ]
        });
    });

    it('should get a conversation successfully', async () => {
        // Mock the conversation endpoint
        mock.onGet('https://api.intercom.io/conversations/conv1').reply(200, {
            type: 'conversation',
            id: 'conv1',
            created_at: 1612345678,
            updated_at: 1612345679,
            source: {
                type: 'user',
                id: 'user1'
            },
            conversation_message: {
                type: 'conversation_message',
                id: 'msg1',
                body: 'Hello there'
            }
        });

        const input = {
            action: 'get_conversation',
            accessToken: 'test-token',
            region: 'intercom',
            conversationId: 'conv1'
        };

        // Pass the axiosInstance in the context
        const result = await executeIntercom(input, { axiosInstance });

        expect(result).toEqual({
            type: 'conversation',
            id: 'conv1',
            created_at: 1612345678,
            updated_at: 1612345679,
            source: {
                type: 'user',
                id: 'user1'
            },
            conversation_message: {
                type: 'conversation_message',
                id: 'msg1',
                body: 'Hello there'
            }
        });
    });

    it('should reply to a conversation successfully', async () => {
        // Mock the reply endpoint
        mock.onPost('https://api.intercom.io/conversations/conv1/reply').reply(200, {
            type: 'conversation',
            id: 'conv1',
            created_at: 1612345678,
            updated_at: 1612345680,
            source: {
                type: 'user',
                id: 'user1'
            },
            conversation_message: {
                type: 'conversation_message',
                id: 'msg1',
                body: 'Hello there'
            },
            conversation_parts: {
                type: 'conversation_part',
                id: 'part1',
                part_type: 'comment',
                body: 'This is a reply',
                created_at: 1612345680,
                updated_at: 1612345680
            }
        });

        const input = {
            action: 'reply_to_conversation',
            accessToken: 'test-token',
            region: 'intercom',
            conversationId: 'conv1',
            replyData: {
                type: 'admin',
                body: 'This is a reply'
            }
        };

        // Pass the axiosInstance in the context
        const result = await executeIntercom(input, { axiosInstance });

        expect(result).toEqual({
            type: 'conversation',
            id: 'conv1',
            created_at: 1612345678,
            updated_at: 1612345680,
            source: {
                type: 'user',
                id: 'user1'
            },
            conversation_message: {
                type: 'conversation_message',
                id: 'msg1',
                body: 'Hello there'
            },
            conversation_parts: {
                type: 'conversation_part',
                id: 'part1',
                part_type: 'comment',
                body: 'This is a reply',
                created_at: 1612345680,
                updated_at: 1612345680
            }
        });
    });

    it('should create a ticket successfully', async () => {
        // Mock the create ticket endpoint
        mock.onPost('https://api.intercom.io/tickets').reply(200, {
            id: 'ticket1',
            type: 'ticket',
            title: 'Test Ticket',
            contact_id: 'contact1',
            created_at: 1612345678,
            updated_at: 1612345678,
            state: 'in_progress',
            priority: 'normal'
        });

        const input = {
            action: 'create_ticket',
            accessToken: 'test-token',
            region: 'intercom',
            ticketData: {
                title: 'Test Ticket',
                contact_id: 'contact1'
            }
        };

        // Pass the axiosInstance in the context
        const result = await executeIntercom(input, { axiosInstance });

        expect(result).toEqual({
            id: 'ticket1',
            type: 'ticket',
            title: 'Test Ticket',
            contact_id: 'contact1',
            created_at: 1612345678,
            updated_at: 1612345678,
            state: 'in_progress',
            priority: 'normal'
        });
    });

    it('should list tags successfully', async () => {
        // Mock the tags endpoint
        mock.onGet('https://api.intercom.io/tags').reply(200, {
            data: [
                {
                    id: 'tag1',
                    type: 'tag',
                    name: 'VIP'
                },
                {
                    id: 'tag2',
                    type: 'tag',
                    name: 'Lead'
                }
            ]
        });

        const input = {
            action: 'list_tags',
            accessToken: 'test-token',
            region: 'intercom'
        };

        // Pass the axiosInstance in the context
        const result = await executeIntercom(input, { axiosInstance });

        expect(result).toEqual({
            data: [
                {
                    id: 'tag1',
                    type: 'tag',
                    name: 'VIP'
                },
                {
                    id: 'tag2',
                    type: 'tag',
                    name: 'Lead'
                }
            ]
        });
    });

    it('should process a webhook payload successfully', async () => {
        const webhookPayload = {
            body: {
                type: 'notification_event',
                app_id: 'app1',
                id: 'notif1',
                topic: 'user.created',
                data: {
                    type: 'notification_event_data',
                    item: {
                        type: 'user',
                        id: 'user1',
                        name: 'John Doe'
                    }
                }
            }
        };

        const input = {
            action: 'process_webhook',
            accessToken: 'test-token',
            region: 'intercom',
            webhookPayload
        };

        // Pass the axiosInstance in the context
        const result = await executeIntercom(input, { axiosInstance });

        expect(result).toEqual({
            event: 'user.created',
            data: {
                type: 'notification_event_data',
                item: {
                    type: 'user',
                    id: 'user1',
                    name: 'John Doe'
                }
            }
        });
    });

    it('should throw an error for invalid action', async () => {
        const input = {
            action: 'invalid_action',
            accessToken: 'test-token',
            region: 'intercom'
        };

        // Pass the axiosInstance in the context
        await expect(executeIntercom(input, { axiosInstance })).rejects.toThrow('Unsupported action: invalid_action');
    });

    it('should throw an error for missing required parameters', async () => {
        const input = {
            action: 'find_contact',
            accessToken: 'test-token',
            region: 'intercom'
            // Missing contactId
        };

        // Pass the axiosInstance in the context
        await expect(executeIntercom(input, { axiosInstance })).rejects.toThrow('Missing required parameter: contactId');
    });
});
