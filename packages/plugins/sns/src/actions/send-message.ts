/**
 * Sends a message to an Amazon SNS topic
 */
import { ListTopicsCommand, PublishCommand } from '@aws-sdk/client-sns';
import { createSNSClient } from '../snsClient.js';

export const sendMessage = {
    name: 'send_message',
    displayName: 'Send Message',
    description: 'Sends a message to an Amazon SNS topic',
    icon: '',
    runner: 'node',
    inputSchema: {
        type: 'object',
        required: ['accessKeyId', 'secretAccessKey', 'region', 'topicArn', 'message'],
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
            topicArn: {
                type: 'string',
                title: 'Topic ARN',
                description: 'The ARN of the SNS topic to send the message to',
            },
            message: {
                type: 'string',
                title: 'Message',
                description: 'The message to send to the SNS topic',
            },
            subject: {
                type: 'string',
                title: 'Subject',
                description: 'The subject of the message (optional)',
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
        topicArn: 'arn:aws:sns:us-east-1:123456789012:MyTopic',
        message: 'Hello from MintFlow!',
        subject: 'Test Message',
    },
    exampleOutput: {
        messageId: '00000000-0000-0000-0000-000000000000',
    },
    execute: async (input: any, config: any, context: any): Promise<any> => {
        try {
            const { accessKeyId, secretAccessKey, region, endpoint, topicArn, message, subject } = input.data;

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

            if (!topicArn) {
                return {
                    error: 'Topic ARN is required',
                };
            }

            if (!message) {
                return {
                    error: 'Message is required',
                };
            }

            // Create the SNS client
            const sns = createSNSClient({
                accessKeyId,
                secretAccessKey,
                region,
                endpoint,
            });

            // Create the publish command
            const publishParams: any = {
                TopicArn: topicArn,
                Message: message,
            };

            // Add subject if provided
            if (subject) {
                publishParams.Subject = subject;
            }

            // Send the message
            const response = await sns.send(new PublishCommand(publishParams));

            return {
                messageId: response.MessageId,
            };
        } catch (error) {
            console.error('Error sending message to SNS:', error);
            return {
                error: `Failed to send message: ${error instanceof Error ? error.message : String(error)}`,
            };
        }
    },
};
