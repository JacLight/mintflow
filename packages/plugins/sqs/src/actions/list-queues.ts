/**
 * Lists Amazon SQS queues
 */
import { ListQueuesCommand } from '@aws-sdk/client-sqs';
import { createSQSClient } from '../sqsClient.js';

export const listQueues = {
    name: 'list_queues',
    displayName: 'List Queues',
    description: 'Lists Amazon SQS queues in your AWS account',
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
            queueNamePrefix: {
                type: 'string',
                title: 'Queue Name Prefix',
                description: 'Filter queues by name prefix (optional)',
            },
        },
    },
    outputSchema: {
        type: 'object',
        properties: {
            queues: {
                type: 'array',
                title: 'Queues',
                description: 'List of SQS queues',
                items: {
                    type: 'object',
                    properties: {
                        queueUrl: {
                            type: 'string',
                            title: 'Queue URL',
                            description: 'The URL of the SQS queue',
                        },
                        queueName: {
                            type: 'string',
                            title: 'Queue Name',
                            description: 'The name of the SQS queue',
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
        queueNamePrefix: 'MyQueue',
    },
    exampleOutput: {
        queues: [
            {
                queueUrl: 'https://sqs.us-east-1.amazonaws.com/123456789012/MyQueue1',
                queueName: 'MyQueue1',
            },
            {
                queueUrl: 'https://sqs.us-east-1.amazonaws.com/123456789012/MyQueue2',
                queueName: 'MyQueue2',
            },
        ],
    },
    execute: async (input: any, config: any, context: any): Promise<any> => {
        try {
            const { accessKeyId, secretAccessKey, region, endpoint, queueNamePrefix } = input.data;

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

            // Create the SQS client
            const sqs = createSQSClient({
                accessKeyId,
                secretAccessKey,
                region,
                endpoint,
            });

            // Create the list queues command parameters
            const listQueuesParams: any = {};

            // Add queue name prefix if provided
            if (queueNamePrefix) {
                listQueuesParams.QueueNamePrefix = queueNamePrefix;
            }

            // List the queues
            const response = await sqs.send(new ListQueuesCommand(listQueuesParams));

            // Format the response
            const queues = response.QueueUrls?.map((queueUrl) => {
                // Extract the queue name from the URL
                const queueName = queueUrl.split('/').pop() || '';
                
                return {
                    queueUrl,
                    queueName,
                };
            }) || [];

            return {
                queues,
            };
        } catch (error) {
            console.error('Error listing SQS queues:', error);
            return {
                error: `Failed to list queues: ${error instanceof Error ? error.message : String(error)}`,
            };
        }
    },
};
