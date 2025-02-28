/**
 * Lists Amazon SNS topics
 */
import { ListTopicsCommand } from '@aws-sdk/client-sns';
import { createSNSClient } from '../snsClient.js';

export const listTopics = {
    name: 'list_topics',
    displayName: 'List Topics',
    description: 'Lists Amazon SNS topics in your AWS account',
    icon: '',
    runner: 'node',
    inputSchema: {
        type: 'object',
        required: ['accessKeyId', 'secretAccessKey', 'region'],
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
        },
    },
    outputSchema: {
        type: 'object',
        properties: {
            topics: {
                type: 'array',
                title: 'Topics',
                description: 'List of SNS topics',
                items: {
                    type: 'object',
                    properties: {
                        topicArn: {
                            type: 'string',
                            title: 'Topic ARN',
                            description: 'The ARN of the SNS topic',
                        },
                        topicName: {
                            type: 'string',
                            title: 'Topic Name',
                            description: 'The name of the SNS topic',
                        },
                    },
                },
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
    },
    exampleOutput: {
        topics: [
            {
                topicArn: 'arn:aws:sns:us-east-1:123456789012:MyTopic',
                topicName: 'MyTopic',
            },
        ],
    },
    execute: async (input: any, config: any, context: any): Promise<any> => {
        try {
            const { accessKeyId, secretAccessKey, region, endpoint } = input.data;

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

            // Create the SNS client
            const sns = createSNSClient({
                accessKeyId,
                secretAccessKey,
                region,
                endpoint,
            });

            // List the topics
            const response = await sns.send(new ListTopicsCommand({}));

            // Format the response
            const topics = response.Topics?.map((topic) => {
                const topicArn = topic.TopicArn || '';
                const topicName = topicArn.split(':').pop() || '';
                
                return {
                    topicArn,
                    topicName,
                };
            }) || [];

            return {
                topics,
            };
        } catch (error) {
            console.error('Error listing SNS topics:', error);
            return {
                error: `Failed to list topics: ${error instanceof Error ? error.message : String(error)}`,
            };
        }
    },
};
