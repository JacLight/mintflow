import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { sendTemplateAction } from '../../src/actions/send-template.js';
import * as common from '../../src/common/index.js';

describe('sendTemplateAction', () => {
    let mockClient: any;
    let createClientSpy: any;

    beforeEach(() => {
        // Setup mock client
        mockClient = {
            sendTemplateMessage: jest.fn()
        };

        // Create spy on createClient
        createClientSpy = jest.spyOn(common, 'createClient').mockReturnValue(mockClient);
    });

    afterEach(() => {
        // Restore original function
        createClientSpy.mockRestore();
    });

    it('should send template message successfully', async () => {
        // Mock successful response
        mockClient.sendTemplateMessage.mockResolvedValue({
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
        const result = await sendTemplateAction.execute({
            accessToken: {
                accessToken: 'test-token',
                businessAccountId: 'test-business-id',
                phoneNumberId: 'test-phone-id'
            },
            to: '+1234567890',
            templateName: 'order_confirmation',
            templateLanguage: 'en_US',
            headerParameters: {
                header1: 'Order #12345'
            },
            bodyParameters: {
                body1: 'John Doe',
                body2: '$50.00'
            },
            buttonParameters: {
                button1: 'https://example.com/order/12345'
            }
        }, {});

        // Verify the client was created with the correct credentials
        expect(common.createClient).toHaveBeenCalledWith({
            accessToken: 'test-token',
            businessAccountId: 'test-business-id',
            phoneNumberId: 'test-phone-id'
        });

        // Verify sendTemplateMessage was called with the correct parameters
        expect(mockClient.sendTemplateMessage).toHaveBeenCalledWith(
            '+1234567890',
            'order_confirmation',
            'en_US',
            expect.arrayContaining([
                expect.objectContaining({
                    type: 'header',
                    parameters: [{ type: 'text', text: 'Order #12345' }]
                }),
                expect.objectContaining({
                    type: 'body',
                    parameters: expect.arrayContaining([
                        { type: 'text', text: 'John Doe' },
                        { type: 'text', text: '$50.00' }
                    ])
                }),
                expect.objectContaining({
                    type: 'button',
                    sub_type: 'url',
                    index: 0,
                    parameters: [{ type: 'text', text: 'https://example.com/order/12345' }]
                })
            ])
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

    it('should send template with only body parameters', async () => {
        // Mock successful response
        mockClient.sendTemplateMessage.mockResolvedValue({
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
        const result = await sendTemplateAction.execute({
            accessToken: {
                accessToken: 'test-token',
                businessAccountId: 'test-business-id',
                phoneNumberId: 'test-phone-id'
            },
            to: '+1234567890',
            templateName: 'simple_template',
            templateLanguage: 'en_US',
            bodyParameters: {
                body1: 'John Doe'
            }
        }, {});

        // Verify sendTemplateMessage was called with the correct parameters
        expect(mockClient.sendTemplateMessage).toHaveBeenCalledWith(
            '+1234567890',
            'simple_template',
            'en_US',
            [
                {
                    type: 'body',
                    parameters: [{ type: 'text', text: 'John Doe' }]
                }
            ]
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
        mockClient.sendTemplateMessage.mockRejectedValue(new Error('API error'));

        // Execute the action
        const result = await sendTemplateAction.execute({
            accessToken: {
                accessToken: 'test-token',
                businessAccountId: 'test-business-id',
                phoneNumberId: 'test-phone-id'
            },
            to: '+1234567890',
            templateName: 'order_confirmation',
            templateLanguage: 'en_US'
        }, {});

        // Verify the error is returned
        expect(result).toEqual({
            error: 'API error'
        });
    });
});
