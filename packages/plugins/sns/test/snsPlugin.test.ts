import { describe, it, expect } from '@jest/globals';
import snsPlugin from '../src/index';

describe('snsPlugin', () => {
    it('should have the correct properties', () => {
        expect(snsPlugin.name).toBe('Amazon SNS');
        expect(snsPlugin.id).toBe('sns');
        expect(snsPlugin.actions).toHaveLength(3);
    });

    it('should have the correct actions', () => {
        const actionNames = snsPlugin.actions.map(action => action.name);
        expect(actionNames).toContain('send_message');
        expect(actionNames).toContain('list_topics');
        expect(actionNames).toContain('create_topic');
    });

    it('should have the correct descriptions for actions', () => {
        const sendMessageAction = snsPlugin.actions.find(action => action.name === 'send_message');
        const listTopicsAction = snsPlugin.actions.find(action => action.name === 'list_topics');
        const createTopicAction = snsPlugin.actions.find(action => action.name === 'create_topic');

        expect(sendMessageAction?.description).toContain('Sends a message');
        expect(listTopicsAction?.description).toContain('Lists Amazon SNS topics');
        expect(createTopicAction?.description).toContain('Creates a new Amazon SNS topic');
    });

    it('should have the correct input schemas for actions', () => {
        const sendMessageAction = snsPlugin.actions.find(action => action.name === 'send_message');
        const listTopicsAction = snsPlugin.actions.find(action => action.name === 'list_topics');
        const createTopicAction = snsPlugin.actions.find(action => action.name === 'create_topic');

        expect(sendMessageAction?.inputSchema.required).toContain('accessKeyId');
        expect(sendMessageAction?.inputSchema.required).toContain('secretAccessKey');
        expect(sendMessageAction?.inputSchema.required).toContain('region');
        expect(sendMessageAction?.inputSchema.required).toContain('topicArn');
        expect(sendMessageAction?.inputSchema.required).toContain('message');

        expect(listTopicsAction?.inputSchema.required).toContain('accessKeyId');
        expect(listTopicsAction?.inputSchema.required).toContain('secretAccessKey');
        expect(listTopicsAction?.inputSchema.required).toContain('region');

        expect(createTopicAction?.inputSchema.required).toContain('accessKeyId');
        expect(createTopicAction?.inputSchema.required).toContain('secretAccessKey');
        expect(createTopicAction?.inputSchema.required).toContain('region');
        expect(createTopicAction?.inputSchema.required).toContain('topicName');
    });

    it('should have the correct output schemas for actions', () => {
        const sendMessageAction = snsPlugin.actions.find(action => action.name === 'send_message');
        const listTopicsAction = snsPlugin.actions.find(action => action.name === 'list_topics');
        const createTopicAction = snsPlugin.actions.find(action => action.name === 'create_topic');

        expect(sendMessageAction?.outputSchema.properties).toHaveProperty('messageId');
        expect(sendMessageAction?.outputSchema.properties).toHaveProperty('error');

        expect(listTopicsAction?.outputSchema.properties).toHaveProperty('topics');
        expect(listTopicsAction?.outputSchema.properties).toHaveProperty('error');

        expect(createTopicAction?.outputSchema.properties).toHaveProperty('topicArn');
        expect(createTopicAction?.outputSchema.properties).toHaveProperty('error');
    });
});
