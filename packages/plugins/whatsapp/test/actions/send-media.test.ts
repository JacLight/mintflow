import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { sendMediaAction } from '../../src/actions/send-media.js';
import * as common from '../../src/common/index.js';

describe('sendMediaAction', () => {
    let mockClient: any;
    let createClientSpy: any;

    beforeEach(() => {
        // Setup mock client
        mockClient = {
            sendMedia: jest.fn()
        };

        // Create spy on createClient
        createClientSpy = jest.spyOn(common, 'createClient').mockReturnValue(mockClient);
    });

    afterEach(() => {
        // Restore original function
        createClientSpy.mockRestore();
    });

    it('should send media successfully', async () => {
        // Mock successful response
        mockClient.sendMedia.mockResolvedValue({
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
        const result = await sendMediaAction.execute({
            accessToken: {
                accessToken: 'test-token',
                businessAccountId: 'test-business-id',
                phoneNumberId: 'test-phone-id'
            },
            to: '+1234567890',
            mediaType: 'image',
            mediaUrl: 'https://example.com/image.jpg',
            caption: 'Check out this image!'
        }, {});

        // Verify the client was created with the correct credentials
        expect(common.createClient).toHaveBeenCalledWith({
            accessToken: 'test-token',
            businessAccountId: 'test-business-id',
            phoneNumberId: 'test-phone-id'
        });

        // Verify sendMedia was called with the correct parameters
        expect(mockClient.sendMedia).toHaveBeenCalledWith(
            '+1234567890',
            'image',
            'https://example.com/image.jpg',
            'Check out this image!',
            undefined
        );

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

    it('should send document with filename', async () => {
        // Mock successful response
        mockClient.sendMedia.mockResolvedValue({
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
        const result = await sendMediaAction.execute({
            accessToken: {
                accessToken: 'test-token',
                businessAccountId: 'test-business-id',
                phoneNumberId: 'test-phone-id'
            },
            to: '+1234567890',
            mediaType: 'document',
            mediaUrl: 'https://example.com/document.pdf',
            caption: 'Important document',
            filename: 'report.pdf'
        }, {});

        // Verify sendMedia was called with the correct parameters
        expect(mockClient.sendMedia).toHaveBeenCalledWith(
            '+1234567890',
            'document',
            'https://example.com/document.pdf',
            'Important document',
            'report.pdf'
        );

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
        mockClient.sendMedia.mockRejectedValue(new Error('API error'));

        // Execute the action
        const result = await sendMediaAction.execute({
            accessToken: {
                accessToken: 'test-token',
                businessAccountId: 'test-business-id',
                phoneNumberId: 'test-phone-id'
            },
            to: '+1234567890',
            mediaType: 'image',
            mediaUrl: 'https://example.com/image.jpg'
        }, {});

        // Verify the error is returned
        expect(result).toEqual({
            error: 'API error'
        });
    });
});
