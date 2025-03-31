/**
 * Creates a new Amazon SNS topic
 */
import { CreateTopicCommand } from '@aws-sdk/client-sns';
import { createSNSClient } from '../snsClient.js';

export const createTopic = {
    name: 'create_topic',
    displayName: 'Create Topic',
    description: 'Creates a new Amazon SNS topic',
    icon: '',
    runner: 'node',
    inputSchema: {
        type: 'object',
        required: ['accessKeyId', 'secretAccessKey', 'region', 'topicName'],
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
            topicName: {
                type: 'string',
                title: 'Topic Name',
                description: 'The name of the SNS topic to create',
            },
            displayName: {
                type: 'string',
                title: 'Display Name',
                description: 'The display name to use for SMS messages (optional)',
            },
            tags: {
                type: 'array',
                title: 'Tags',
                description: 'Tags to attach to the topic (optional)',
                items: {
                    type: 'object',
                    properties: {
                        key: {
                            type: 'string',
                            title: 'Key',
                            description: 'The tag key',
                        },
                        value: {
                            type: 'string',
                            title: 'Value',
                            description: 'The tag value',
                        },
                    },
                },
            },
        },
    },
    outputSchema: {
        type: 'object',
        properties: {
            topicArn: {
                type: 'string',
                title: 'Topic ARN',
                description: 'The ARN of the created SNS topic',
            },
            error: {
                type: 'string',
                title: 'Error',
                description: 'Error message if the operation failed',
            },
        },
    },
    exampleInput: {
        accessKeyId: 'AKIAIOSFODNN7EXAMPLE',
        secretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
        region: 'us-east-1',
        topicName: 'MyTopic',
        displayName: 'My Topic',
        tags: [
            {
                key: 'Environment',
                value: 'Production',
            },
        ],
    },
    exampleOutput: {
        topicArn: 'arn:aws:sns:us-east-1:123456789012:MyTopic',
    },
    execute: async (input: any, config: any, context: any): Promise<any> => {
        try {
            const { accessKeyId, secretAccessKey, region, endpoint, topicName, displayName, tags } = input.data;

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

            if (!topicName) {
                return {
                    error: 'Topic Name is required',
                };
            }

            // Create the SNS client
            const sns = createSNSClient({
                accessKeyId,
                secretAccessKey,
                region,
                endpoint,
            });

            // Create the topic command parameters
            const createTopicParams: any = {
                Name: topicName,
            };

            // Add display name if provided
            if (displayName) {
                createTopicParams.Attributes = {
                    DisplayName: displayName,
                };
            }

            // Add tags if provided
            if (tags && tags.length > 0) {
                createTopicParams.Tags = tags.map((tag: any) => ({
                    Key: tag.key,
                    Value: tag.value,
                }));
            }

            // Create the topic
            const response = await sns.send(new CreateTopicCommand(createTopicParams));

            return {
                topicArn: response.TopicArn,
            };
        } catch (error) {
            console.error('Error creating SNS topic:', error);
            return {
                error: `Failed to create topic: ${error instanceof Error ? error.message : String(error)}`,
            };
        }
    },
};
