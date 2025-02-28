import { sendMessage } from './actions/send-message.js';
import { listQueues } from './actions/list-queues.js';
import { createQueue } from './actions/create-queue.js';

const sqsPlugin = {
    name: "Amazon SQS",
    icon: "📬",
    description: "Send messages to Amazon SQS queues and manage SQS resources",
    id: "sqs",
    runner: "node",
    inputSchema: {
        type: "object",
        properties: {
            action: {
                type: 'string',
                enum: ['send_message', 'list_queues', 'create_queue'],
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Action to perform',
            },
        },
    },
    outputSchema: {
        type: "object",
    },
    exampleInput: {
        action: 'send_message',
        accessKeyId: 'AKIAIOSFODNN7EXAMPLE',
        secretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
        region: 'us-east-1',
        queueUrl: 'https://sqs.us-east-1.amazonaws.com/123456789012/MyQueue',
        messageBody: 'Hello from MintFlow!',
    },
    exampleOutput: {
        messageId: '00000000-0000-0000-0000-000000000000',
    },
    documentation: "https://mintflow.com/docs/plugins/sqs",
    method: "exec",
    actions: [
        sendMessage,
        listQueues,
        createQueue
    ]
};

export default sqsPlugin;
