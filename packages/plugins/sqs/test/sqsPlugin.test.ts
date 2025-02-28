import { describe, it, expect } from '@jest/globals';
import sqsPlugin from '../src/index';

describe('sqsPlugin', () => {
    it('should have the correct properties', () => {
        expect(sqsPlugin.name).toBe('Amazon SQS');
        expect(sqsPlugin.id).toBe('sqs');
        expect(sqsPlugin.actions).toHaveLength(3);
    });

    it('should have the correct actions', () => {
        const actionNames = sqsPlugin.actions.map(action => action.name);
        expect(actionNames).toContain('send_message');
        expect(actionNames).toContain('list_queues');
        expect(actionNames).toContain('create_queue');
    });

    it('should have the correct descriptions for actions', () => {
        const sendMessageAction = sqsPlugin.actions.find(action => action.name === 'send_message');
        const listQueuesAction = sqsPlugin.actions.find(action => action.name === 'list_queues');
        const createQueueAction = sqsPlugin.actions.find(action => action.name === 'create_queue');

        expect(sendMessageAction?.description).toContain('Sends a message');
        expect(listQueuesAction?.description).toContain('Lists Amazon SQS queues');
        expect(createQueueAction?.description).toContain('Creates a new Amazon SQS queue');
    });

    it('should have the correct input schemas for actions', () => {
        const sendMessageAction = sqsPlugin.actions.find(action => action.name === 'send_message');
        const listQueuesAction = sqsPlugin.actions.find(action => action.name === 'list_queues');
        const createQueueAction = sqsPlugin.actions.find(action => action.name === 'create_queue');

        expect(sendMessageAction?.inputSchema.required).toContain('accessKeyId');
        expect(sendMessageAction?.inputSchema.required).toContain('secretAccessKey');
        expect(sendMessageAction?.inputSchema.required).toContain('region');
        expect(sendMessageAction?.inputSchema.required).toContain('queueUrl');
        expect(sendMessageAction?.inputSchema.required).toContain('messageBody');

        expect(listQueuesAction?.inputSchema.required).toContain('accessKeyId');
        expect(listQueuesAction?.inputSchema.required).toContain('secretAccessKey');
        expect(listQueuesAction?.inputSchema.required).toContain('region');

        expect(createQueueAction?.inputSchema.required).toContain('accessKeyId');
        expect(createQueueAction?.inputSchema.required).toContain('secretAccessKey');
        expect(createQueueAction?.inputSchema.required).toContain('region');
        expect(createQueueAction?.inputSchema.required).toContain('queueName');
    });

    it('should have the correct output schemas for actions', () => {
        const sendMessageAction = sqsPlugin.actions.find(action => action.name === 'send_message');
        const listQueuesAction = sqsPlugin.actions.find(action => action.name === 'list_queues');
        const createQueueAction = sqsPlugin.actions.find(action => action.name === 'create_queue');

        expect(sendMessageAction?.outputSchema.properties).toHaveProperty('messageId');
        expect(sendMessageAction?.outputSchema.properties).toHaveProperty('sequenceNumber');
        expect(sendMessageAction?.outputSchema.properties).toHaveProperty('error');

        expect(listQueuesAction?.outputSchema.properties).toHaveProperty('queues');
        expect(listQueuesAction?.outputSchema.properties).toHaveProperty('error');

        expect(createQueueAction?.outputSchema.properties).toHaveProperty('queueUrl');
        expect(createQueueAction?.outputSchema.properties).toHaveProperty('error');
    });
});
