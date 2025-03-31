import { sendMessage } from './actions/send-message.js';
import { listTopics } from './actions/list-topics.js';
import { createTopic } from './actions/create-topic.js';

const snsPlugin = {
    name: "Amazon SNS",
    icon: "📨",
    description: "Send messages to Amazon SNS topics and manage SNS resources",
    groups: ["integration"],
    tags: ["integration","connector","api","service","platform"],
    version: '1.0.0',
    id: "sns",
    runner: "node",
    inputSchema: {
        type: "object",
        properties: {
            action: {
                type: 'string',
                enum: ['send_message', 'list_topics', 'create_topic'],
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
        topicArn: 'arn:aws:sns:us-east-1:123456789012:MyTopic',
        message: 'Hello from MintFlow!',
    },
    exampleOutput: {
        messageId: '00000000-0000-0000-0000-000000000000',
    },
    documentation: "https://mintflow.com/docs/plugins/sns",
    method: "exec",
    actions: [
        sendMessage,
        listTopics,
        createTopic
    ]
};

export default snsPlugin;
