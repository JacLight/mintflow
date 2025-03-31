import mailchimpPlugin, { MailchimpClient } from '../src/index.js';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';

describe('mailchimpPlugin', () => {
    let mock: MockAdapter;
    let axiosInstance: any;
    let executeMailchimp: any;

    beforeEach(() => {
        // Create a new axios instance for testing
        axiosInstance = axios.create();

        // Create a mock adapter for the axios instance
        mock = new MockAdapter(axiosInstance);

        // Get the execute function from the plugin
        executeMailchimp = mailchimpPlugin.actions[0].execute;
    });

    afterEach(() => {
        // Reset and restore the mock
        mock.reset();
        mock.restore();
    });

    it('should add a member to a list successfully', async () => {
        // Mock the metadata endpoint to get the server prefix
        mock.onGet('https://login.mailchimp.com/oauth2/metadata').reply(200, {
            dc: 'us1'
        });

        // Mock the add member endpoint
        mock.onPost('https://us1.api.mailchimp.com/3.0/lists/list123/members').reply(200, {
            id: 'member123',
            email_address: 'test@example.com',
            unique_email_id: 'unique123',
            status: 'subscribed',
            merge_fields: {
                FNAME: 'John',
                LNAME: 'Doe'
            }
        });

        const input = {
            action: 'add_member_to_list',
            access_token: 'test-token',
            list_id: 'list123',
            email: 'test@example.com',
            first_name: 'John',
            last_name: 'Doe',
            status: 'subscribed'
        };

        // Pass the axiosInstance in the context
        const result = await executeMailchimp(input, { axiosInstance });

        expect(result).toEqual({
            id: 'member123',
            email_address: 'test@example.com',
            unique_email_id: 'unique123',
            status: 'subscribed',
            merge_fields: {
                FNAME: 'John',
                LNAME: 'Doe'
            }
        });
    });

    it('should update a subscriber status successfully', async () => {
        // Mock the metadata endpoint to get the server prefix
        mock.onGet('https://login.mailchimp.com/oauth2/metadata').reply(200, {
            dc: 'us1'
        });

        // MD5 hash of test@example.com is 55502f40dc8b7c769880b10874abc9d0
        const emailHash = '55502f40dc8b7c769880b10874abc9d0';

        // Mock the update member endpoint
        mock.onPatch(`https://us1.api.mailchimp.com/3.0/lists/list123/members/${emailHash}`).reply(200, {
            id: 'member123',
            email_address: 'test@example.com',
            status: 'unsubscribed'
        });

        const input = {
            action: 'update_subscriber_status',
            access_token: 'test-token',
            list_id: 'list123',
            email: 'test@example.com',
            status: 'unsubscribed'
        };

        // Pass the axiosInstance in the context
        const result = await executeMailchimp(input, { axiosInstance });

        expect(result).toEqual({
            id: 'member123',
            email_address: 'test@example.com',
            status: 'unsubscribed'
        });
    });

    it('should add a note to a subscriber successfully', async () => {
        // Mock the metadata endpoint to get the server prefix
        mock.onGet('https://login.mailchimp.com/oauth2/metadata').reply(200, {
            dc: 'us1'
        });

        // MD5 hash of test@example.com is 55502f40dc8b7c769880b10874abc9d0
        const emailHash = '55502f40dc8b7c769880b10874abc9d0';

        // Mock the add note endpoint
        mock.onPost(`https://us1.api.mailchimp.com/3.0/lists/list123/members/${emailHash}/notes`).reply(200, {
            id: 'note123',
            created_at: '2023-01-01T00:00:00Z',
            note: 'This is a test note'
        });

        const input = {
            action: 'add_note_to_subscriber',
            access_token: 'test-token',
            list_id: 'list123',
            email: 'test@example.com',
            note: 'This is a test note'
        };

        // Pass the axiosInstance in the context
        const result = await executeMailchimp(input, { axiosInstance });

        expect(result).toEqual({
            id: 'note123',
            created_at: '2023-01-01T00:00:00Z',
            note: 'This is a test note'
        });
    });

    it('should add a tag to a subscriber successfully', async () => {
        // Mock the metadata endpoint to get the server prefix
        mock.onGet('https://login.mailchimp.com/oauth2/metadata').reply(200, {
            dc: 'us1'
        });

        // MD5 hash of test@example.com is 55502f40dc8b7c769880b10874abc9d0
        const emailHash = '55502f40dc8b7c769880b10874abc9d0';

        // Mock the add tag endpoint
        mock.onPost(`https://us1.api.mailchimp.com/3.0/lists/list123/members/${emailHash}/tags`).reply(200, {});

        const input = {
            action: 'add_subscriber_to_tag',
            access_token: 'test-token',
            list_id: 'list123',
            email: 'test@example.com',
            tag_name: 'Test Tag'
        };

        // Pass the axiosInstance in the context
        const result = await executeMailchimp(input, { axiosInstance });

        expect(result).toEqual({
            success: true,
            message: 'Tag "Test Tag" added to subscriber test@example.com'
        });
    });

    it('should remove a tag from a subscriber successfully', async () => {
        // Mock the metadata endpoint to get the server prefix
        mock.onGet('https://login.mailchimp.com/oauth2/metadata').reply(200, {
            dc: 'us1'
        });

        // MD5 hash of test@example.com is 55502f40dc8b7c769880b10874abc9d0
        const emailHash = '55502f40dc8b7c769880b10874abc9d0';

        // Mock the remove tag endpoint
        mock.onPost(`https://us1.api.mailchimp.com/3.0/lists/list123/members/${emailHash}/tags`).reply(200, {});

        const input = {
            action: 'remove_subscriber_from_tag',
            access_token: 'test-token',
            list_id: 'list123',
            email: 'test@example.com',
            tag_name: 'Test Tag'
        };

        // Pass the axiosInstance in the context
        const result = await executeMailchimp(input, { axiosInstance });

        expect(result).toEqual({
            success: true,
            message: 'Tag "Test Tag" removed from subscriber test@example.com'
        });
    });

    it('should process a webhook payload successfully', async () => {
        // Mock the metadata endpoint to get the server prefix
        mock.onGet('https://login.mailchimp.com/oauth2/metadata').reply(200, {
            dc: 'us1'
        });

        const input = {
            action: 'process_webhook',
            access_token: 'test-token',
            body: {
                type: 'subscribe',
                fired_at: '2023-01-01T00:00:00Z',
                data: {
                    id: 'member123',
                    list_id: 'list123',
                    email: 'test@example.com',
                    email_type: 'html',
                    ip_opt: '127.0.0.1',
                    ip_signup: '127.0.0.1',
                    merges: {
                        EMAIL: 'test@example.com',
                        FNAME: 'John',
                        LNAME: 'Doe'
                    }
                }
            }
        };

        // Pass the axiosInstance in the context
        const result = await executeMailchimp(input, { axiosInstance });

        expect(result).toEqual({
            event: 'subscribe',
            data: {
                id: 'member123',
                list_id: 'list123',
                email: 'test@example.com',
                email_type: 'html',
                ip_opt: '127.0.0.1',
                ip_signup: '127.0.0.1',
                merges: {
                    EMAIL: 'test@example.com',
                    FNAME: 'John',
                    LNAME: 'Doe'
                }
            }
        });
    });

    it('should throw an error for invalid action', async () => {
        // Mock the metadata endpoint to get the server prefix
        mock.onGet('https://login.mailchimp.com/oauth2/metadata').reply(200, {
            dc: 'us1'
        });

        const input = {
            action: 'invalid_action',
            access_token: 'test-token'
        };

        // Pass the axiosInstance in the context
        await expect(executeMailchimp(input, { axiosInstance })).rejects.toThrow('Unsupported action: invalid_action');
    });

    it('should throw an error for missing required parameters', async () => {
        // Mock the metadata endpoint to get the server prefix
        mock.onGet('https://login.mailchimp.com/oauth2/metadata').reply(200, {
            dc: 'us1'
        });

        const input = {
            action: 'add_member_to_list',
            access_token: 'test-token'
            // Missing list_id, email, status
        };

        // Pass the axiosInstance in the context
        await expect(executeMailchimp(input, { axiosInstance })).rejects.toThrow('Missing required parameters: list_id, email, status');
    });
});
