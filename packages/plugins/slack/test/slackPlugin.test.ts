import slackPlugin from '../src/index.js';
import { describe, it, expect, jest } from '@jest/globals';

// Mock the WebClient class
jest.mock('@slack/web-api', () => {
    return {
        WebClient: jest.fn().mockImplementation(() => {
            return {
                auth: {
                    test: jest.fn().mockImplementation(() => Promise.resolve({ ok: true }))
                },
                chat: {
                    postMessage: jest.fn().mockImplementation(() => Promise.resolve({ ok: true })),
                    update: jest.fn().mockImplementation(() => Promise.resolve({ ok: true }))
                },
                files: {
                    uploadV2: jest.fn().mockImplementation(() => Promise.resolve({ ok: true }))
                },
                search: {
                    messages: jest.fn().mockImplementation(() => Promise.resolve({ ok: true }))
                },
                conversations: {
                    history: jest.fn().mockImplementation(() => Promise.resolve({ ok: true })),
                    create: jest.fn().mockImplementation(() => Promise.resolve({ ok: true }))
                },
                users: {
                    lookupByEmail: jest.fn().mockImplementation(() => Promise.resolve({ ok: true })),
                    list: jest.fn().mockImplementation(() => Promise.resolve({
                        ok: true,
                        members: [{ name: 'user', profile: { display_name: 'user' } }]
                    })),
                    profile: {
                        set: jest.fn().mockImplementation(() => Promise.resolve({ ok: true }))
                    }
                },
                reactions: {
                    add: jest.fn().mockImplementation(() => Promise.resolve({ ok: true }))
                }
            };
        })
    };
});

describe('slackPlugin', () => {
    it('should have the correct name and description', () => {
        expect(slackPlugin.name).toBe('Slack');
        expect(slackPlugin.description).toBe('Channel-based messaging platform');
        expect(slackPlugin.id).toBe('slack');
        expect(slackPlugin.runner).toBe('node');
    });

    it('should have the correct input schema', () => {
        expect(slackPlugin.inputSchema.type).toBe('object');
        expect(slackPlugin.inputSchema.properties.action.enum).toContain('send_message');
        expect(slackPlugin.inputSchema.properties.action.enum).toContain('send_direct_message');
        expect(slackPlugin.inputSchema.properties.action.enum).toContain('search_messages');
        expect(slackPlugin.inputSchema.properties.action.enum).toContain('update_message');
        expect(slackPlugin.inputSchema.properties.action.enum).toContain('get_channel_history');
        expect(slackPlugin.inputSchema.properties.action.enum).toContain('find_user_by_email');
        expect(slackPlugin.inputSchema.properties.action.enum).toContain('find_user_by_handle');
        expect(slackPlugin.inputSchema.properties.action.enum).toContain('create_channel');
        expect(slackPlugin.inputSchema.properties.action.enum).toContain('update_profile');
        expect(slackPlugin.inputSchema.properties.action.enum).toContain('set_status');
        expect(slackPlugin.inputSchema.properties.action.enum).toContain('add_reaction');
        expect(slackPlugin.inputSchema.properties.action.enum).toContain('markdown_to_slack');
    });

    it('should have the correct example input and output', () => {
        expect(slackPlugin.exampleInput).toBeDefined();
        expect(slackPlugin.exampleOutput).toBeDefined();
    });

    it('should have the correct documentation URL', () => {
        expect(slackPlugin.documentation).toBe('https://api.slack.com/');
    });

    it('should have the correct method', () => {
        expect(slackPlugin.method).toBe('exec');
    });

    it('should have the correct actions', () => {
        expect(slackPlugin.actions).toHaveLength(1);
        expect(slackPlugin.actions[0].name).toBe('slack');
        expect(typeof slackPlugin.actions[0].execute).toBe('function');
    });

    it('should throw an error for missing required parameters', async () => {
        const execute = slackPlugin.actions[0].execute;

        // Missing token
        await expect(execute({ action: 'send_message' })).rejects.toThrow('Missing required parameters');

        // Missing action
        await expect(execute({ token: 'xoxb-token' })).rejects.toThrow('Missing required parameters');
    });

    it('should throw an error for unsupported action', async () => {
        const execute = slackPlugin.actions[0].execute;

        await expect(execute({
            action: 'unsupported_action',
            token: 'xoxb-token'
        })).rejects.toThrow('Unsupported action');
    });

    it('should convert markdown to Slack format', async () => {
        const execute = slackPlugin.actions[0].execute;

        const result = await execute({
            action: 'markdown_to_slack',
            token: 'xoxb-token',
            text: '**Bold** _Italic_ ~~Strikethrough~~ `Code` ```Block``` [Link](https://example.com)'
        });

        expect(result).toHaveProperty('original');
        expect(result).toHaveProperty('converted');
        expect(result.converted).toContain('*Bold*');
        expect(result.converted).toContain('_Italic_');
        expect(result.converted).toContain('~Strikethrough~');
        expect(result.converted).toContain('`Code`');
        expect(result.converted).toContain('```Block```');
        expect(result.converted).toContain('<https://example.com|Link>');
    });
});
