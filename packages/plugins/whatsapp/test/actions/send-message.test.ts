import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { sendMessageAction } from '../../src/actions/send-message.js';
import * as common from '../../src/common/index.js';

describe('sendMessageAction', () => {
    let mockClient: any;
    let createClientSpy: any;

    beforeEach(() => {
        // Setup mock client
        mockClient = {
            sendMessage: jest.fn()
        };

        // Create spy on createClient
        createClientSpy = jest.spyOn(common, 'createClient').mockReturnValue(mockClient);
    });

    afterEach(() => {
        // Restore original function
        createClientSpy.mockRestore();
    });

    it('should send a message successfully', async () => {
        // Mock successful response
        mockClient.sendMessage.mockResolvedValue({
            messaging_product: 'whatsapp',
            contacts: [
                {
                    input: '+1234567890',
                    wa_id: '1234567890'
                }
            ],
            messages: [
                {
                    id: 'message_id_123'
                }
            ]
        });

        // Execute the action
        const result = await sendMessageAction.execute({
            accessToken: {
                accessToken: 'test-token',
                businessAccountId: 'test-business-id',
                phoneNumberId: 'test-phone-id'
            },
            to: '+1234567890',
            text: 'Hello from MintFlow!'
        }, {});

        // Verify the client was created with the correct credentials
        expect(common.createClient).toHaveBeenCalledWith({
            accessToken: 'test-token',
            businessAccountId: 'test-business-id',
            phoneNumberId: 'test-phone-id'
        });

        // Verify sendMessage was called with the correct parameters
        expect(mockClient.sendMessage).toHaveBeenCalledWith('+1234567890', 'Hello from MintFlow!');

        // Verify the result
        expect(result).toEqual({
            messaging_product: 'whatsapp',
            contacts: [
                {
                    input: '+1234567890',
                    wa_id: '1234567890'
                }
            ],
            messages: [
                {
                    id: 'message_id_123'
                }
            ]
        });
    });

    it('should handle errors', async () => {
        // Mock error
        mockClient.sendMessage.mockRejectedValue(new Error('API error'));

        // Execute the action
        const result = await sendMessageAction.execute({
            accessToken: {
                accessToken: 'test-token',
                businessAccountId: 'test-business-id',
                phoneNumberId: 'test-phone-id'
            },
            to: '+1234567890',
            text: 'Hello from MintFlow!'
        }, {});

        // Verify the error is returned
        expect(result).toEqual({
            error: 'API error'
        });
    });
});
