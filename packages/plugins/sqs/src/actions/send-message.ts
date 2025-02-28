/**
 * Sends a message to an Amazon SQS queue
 */
import { SendMessageCommand } from '@aws-sdk/client-sqs';
import { createSQSClient } from '../sqsClient.js';

export const sendMessage = {
    name: 'send_message',
    displayName: 'Send Message',
    description: 'Sends a message to an Amazon SQS queue',
    icon: '',
    runner: 'node',
    inputSchema: {
        type: 'object',
        required: ['accessKeyId', 'secretAccessKey', 'region', 'queueUrl', 'messageBody'],
        properties: {
            accessKeyId: {
                type: 'string',
                title: 'Access Key ID',
                description: 'AWS Access Key ID',
            },
            secretAccessKey: {
                type: 'string',
                title: 'Secret Access Key',
                description: 'AWS Secret Access Key',
                format: 'password',
            },
            region: {
                type: 'string',
                title: 'Region',
                description: 'AWS Region',
                enum: [
                    'us-east-1',
                    'us-east-2',
                    'us-west-1',
                    'us-west-2',
                    'af-south-1',
                    'ap-east-1',
                    'ap-south-1',
                    'ap-northeast-3',
                    'ap-northeast-2',
                    'ap-southeast-1',
                    'ap-southeast-2',
                    'ap-northeast-1',
                    'ca-central-1',
                    'eu-central-1',
                    'eu-west-1',
                    'eu-west-2',
                    'eu-south-1',
                    'eu-west-3',
                    'eu-north-1',
                    'me-south-1',
                    'sa-east-1',
                    'eu-south-2',
                    'ap-south-2',
                    'ap-southeast-3',
                    'ap-southeast-4',
                    'cn-north-1',
                    'cn-northwest-1',
                    'eu-central-2',
                    'me-central-1',
                ],
                default: 'us-east-1',
            },
            endpoint: {
                type: 'string',
                title: 'Endpoint',
                description: 'Custom endpoint URL (optional)',
            },
            queueUrl: {
                type: 'string',
                title: 'Queue URL',
                description: 'The URL of the Amazon SQS queue to which a message is sent',
            },
            messageBody: {
                type: 'string',
                title: 'Message Body',
                description: 'The message to send to the SQS queue',
            },
            delaySeconds: {
                type: 'number',
                title: 'Delay Seconds',
                description: 'The length of time, in seconds, for which to delay a message (0-900)',
                minimum: 0,
                maximum: 900,
            },
            messageAttributes: {
                type: 'object',
                title: 'Message Attributes',
                description: 'Each message attribute consists of a Name, Type, and Value',
                additionalProperties: {
                    type: 'object',
                    properties: {
                        DataType: {
                            type: 'string',
                            enum: ['String', 'Number', 'Binary'],
                        },
                        StringValue: {
                            type: 'string',
                        },
                        BinaryValue: {
                            type: 'string',
                            format: 'binary',
                        },
                    },
                    required: ['DataType'],
                },
            },
            messageGroupId: {
                type: 'string',
                title: 'Message Group ID',
                description: 'Required for FIFO queues. Specifies that a message belongs to a specific message group',
            },
            messageDeduplicationId: {
                type: 'string',
                title: 'Message Deduplication ID',
                description: 'Required for FIFO queues. Specifies that a message is unique within a 5-minute deduplication interval',
            },
        },
    },
    outputSchema: {
        type: 'object',
        properties: {
            messageId: {
                type: 'string',
                title: 'Message ID',
                description: 'The ID of the message that was sent',
            },
            sequenceNumber: {
                type: 'string',
                title: 'Sequence Number',
                description: 'The sequence number for a message sent to a FIFO queue',
            },
            error: {
                type: 'string',
                title: 'Error',
                description: 'Error message if the message failed to send',
            },
        },
    },
    exampleInput: {
        accessKeyId: 'AKIAIOSFODNN7EXAMPLE',
        secretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
        region: 'us-east-1',
        queueUrl: 'https://sqs.us-east-1.amazonaws.com/123456789012/MyQueue',
        messageBody: 'Hello from MintFlow!',
        delaySeconds: 0,
    },
    exampleOutput: {
        messageId: '00000000-0000-0000-0000-000000000000',
    },
    execute: async (input: any, config: any, context: any): Promise<any> => {
        try {
            const { accessKeyId, secretAccessKey, region, endpoint, queueUrl, messageBody, delaySeconds, messageAttributes, messageGroupId, messageDeduplicationId } = input.data;

            if (!accessKeyId) {
                return {
                    error: 'Access Key ID is required',
                };
            }

            if (!secretAccessKey) {
                return {
                    error: 'Secret Access Key is required',
                };
            }

            if (!region) {
                return {
                    error: 'Region is required',
                };
            }

            if (!queueUrl) {
                return {
                    error: 'Queue URL is required',
                };
            }

            if (!messageBody) {
                return {
                    error: 'Message Body is required',
                };
            }

            // Create the SQS client
            const sqs = createSQSClient({
                accessKeyId,
                secretAccessKey,
                region,
                endpoint,
            });

            // Create the send message command parameters
            const sendMessageParams: any = {
                QueueUrl: queueUrl,
                MessageBody: messageBody,
            };

            // Add optional parameters if provided
            if (delaySeconds !== undefined) {
                sendMessageParams.DelaySeconds = delaySeconds;
            }

            if (messageAttributes) {
                sendMessageParams.MessageAttributes = messageAttributes;
            }

            if (messageGroupId) {
                sendMessageParams.MessageGroupId = messageGroupId;
            }

            if (messageDeduplicationId) {
                sendMessageParams.MessageDeduplicationId = messageDeduplicationId;
            }

            // Send the message
            const response = await sqs.send(new SendMessageCommand(sendMessageParams));

            return {
                messageId: response.MessageId,
                sequenceNumber: response.SequenceNumber,
            };
        } catch (error) {
            console.error('Error sending message to SQS:', error);
            return {
                error: `Failed to send message: ${error instanceof Error ? error.message : String(error)}`,
            };
        }
    },
};
