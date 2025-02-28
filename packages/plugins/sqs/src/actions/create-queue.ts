/**
 * Creates a new Amazon SQS queue
 */
import { CreateQueueCommand } from '@aws-sdk/client-sqs';
import { createSQSClient } from '../sqsClient.js';

export const createQueue = {
    name: 'create_queue',
    displayName: 'Create Queue',
    description: 'Creates a new Amazon SQS queue',
    icon: '',
    runner: 'node',
    inputSchema: {
        type: 'object',
        required: ['accessKeyId', 'secretAccessKey', 'region', 'queueName'],
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
            queueName: {
                type: 'string',
                title: 'Queue Name',
                description: 'The name of the SQS queue to create',
            },
            isFifo: {
                type: 'boolean',
                title: 'Is FIFO Queue',
                description: 'Whether to create a FIFO (First-In-First-Out) queue',
                default: false,
            },
            delaySeconds: {
                type: 'number',
                title: 'Delay Seconds',
                description: 'The default delay for messages in seconds (0-900)',
                minimum: 0,
                maximum: 900,
            },
            messageRetentionPeriod: {
                type: 'number',
                title: 'Message Retention Period',
                description: 'The number of seconds to retain messages (60-1209600)',
                minimum: 60,
                maximum: 1209600,
            },
            visibilityTimeout: {
                type: 'number',
                title: 'Visibility Timeout',
                description: 'The visibility timeout for the queue in seconds (0-43200)',
                minimum: 0,
                maximum: 43200,
            },
            maxMessageSize: {
                type: 'number',
                title: 'Maximum Message Size',
                description: 'The maximum message size in bytes (1024-262144)',
                minimum: 1024,
                maximum: 262144,
            },
            contentBasedDeduplication: {
                type: 'boolean',
                title: 'Content-Based Deduplication',
                description: 'Enable content-based deduplication for FIFO queues',
                default: false,
            },
            tags: {
                type: 'object',
                title: 'Tags',
                description: 'Key-value pairs to tag the queue',
                additionalProperties: {
                    type: 'string',
                },
            },
        },
    },
    outputSchema: {
        type: 'object',
        properties: {
            queueUrl: {
                type: 'string',
                title: 'Queue URL',
                description: 'The URL of the created SQS queue',
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
        queueName: 'MyQueue',
        isFifo: false,
        delaySeconds: 0,
        messageRetentionPeriod: 345600,
        visibilityTimeout: 30,
        maxMessageSize: 262144,
        tags: {
            Environment: 'Production',
            Project: 'MintFlow',
        },
    },
    exampleOutput: {
        queueUrl: 'https://sqs.us-east-1.amazonaws.com/123456789012/MyQueue',
    },
    execute: async (input: any, config: any, context: any): Promise<any> => {
        try {
            const { 
                accessKeyId, 
                secretAccessKey, 
                region, 
                endpoint, 
                queueName, 
                isFifo, 
                delaySeconds, 
                messageRetentionPeriod, 
                visibilityTimeout, 
                maxMessageSize, 
                contentBasedDeduplication,
                tags 
            } = input.data;

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

            if (!queueName) {
                return {
                    error: 'Queue Name is required',
                };
            }

            // Create the SQS client
            const sqs = createSQSClient({
                accessKeyId,
                secretAccessKey,
                region,
                endpoint,
            });

            // Prepare the queue name
            let finalQueueName = queueName;
            if (isFifo && !queueName.endsWith('.fifo')) {
                finalQueueName = `${queueName}.fifo`;
            }

            // Create the queue attributes
            const attributes: Record<string, string> = {};

            if (delaySeconds !== undefined) {
                attributes['DelaySeconds'] = delaySeconds.toString();
            }

            if (messageRetentionPeriod !== undefined) {
                attributes['MessageRetentionPeriod'] = messageRetentionPeriod.toString();
            }

            if (visibilityTimeout !== undefined) {
                attributes['VisibilityTimeout'] = visibilityTimeout.toString();
            }

            if (maxMessageSize !== undefined) {
                attributes['MaximumMessageSize'] = maxMessageSize.toString();
            }

            if (isFifo) {
                attributes['FifoQueue'] = 'true';
                
                if (contentBasedDeduplication !== undefined) {
                    attributes['ContentBasedDeduplication'] = contentBasedDeduplication ? 'true' : 'false';
                }
            }

            // Create the queue command parameters
            const createQueueParams: any = {
                QueueName: finalQueueName,
                Attributes: attributes,
            };

            // Add tags if provided
            if (tags && Object.keys(tags).length > 0) {
                const tagList: Record<string, string> = {};
                
                for (const [key, value] of Object.entries(tags)) {
                    tagList[key] = String(value);
                }
                
                createQueueParams.tags = tagList;
            }

            // Create the queue
            const response = await sqs.send(new CreateQueueCommand(createQueueParams));

            return {
                queueUrl: response.QueueUrl,
            };
        } catch (error) {
            console.error('Error creating SQS queue:', error);
            return {
                error: `Failed to create queue: ${error instanceof Error ? error.message : String(error)}`,
            };
        }
    },
};
