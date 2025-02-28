import { describe, it, expect, jest } from '@jest/globals';
import { Client, REST } from 'discord.js';

// Import the plugin
const discordPlugin = require('../src/index').default;

// Mock discord.js
jest.mock('discord.js', () => {
    return {
        Client: jest.fn().mockImplementation(() => ({
            login: jest.fn().mockResolvedValue(true),
            guilds: {
                fetch: jest.fn().mockResolvedValue({
                    members: {
                        fetch: jest.fn().mockResolvedValue({
                            find: jest.fn().mockReturnValue({
                                toJSON: jest.fn().mockReturnValue({
                                    user: { id: 'user123', username: 'testuser' }
                                })
                            })
                        })
                    }
                })
            },
            destroy: jest.fn().mockResolvedValue(true)
        })),
        GatewayIntentBits: {
            Guilds: 1,
            GuildMembers: 2
        },
        REST: jest.fn().mockImplementation(() => ({
            setToken: jest.fn().mockReturnThis(),
            get: jest.fn().mockResolvedValue([
                { id: 'guild123', name: 'Test Guild' }
            ]),
            post: jest.fn().mockResolvedValue({
                id: 'message123',
                content: 'Hello from MintFlow!'
            }),
            put: jest.fn().mockResolvedValue({ success: true }),
            delete: jest.fn().mockResolvedValue({ success: true })
        })),
        Routes: {
            userGuilds: jest.fn().mockReturnValue('/users/@me/guilds'),
            guildChannels: jest.fn().mockReturnValue('/guilds/guild123/channels'),
            guildRoles: jest.fn().mockReturnValue('/guilds/guild123/roles'),
            channelMessages: jest.fn().mockReturnValue('/channels/channel123/messages'),
            channel: jest.fn().mockReturnValue('/channels/channel123'),
            guildMemberRole: jest.fn().mockReturnValue('/guilds/guild123/members/user123/roles/role123'),
            guildBan: jest.fn().mockReturnValue('/guilds/guild123/bans/user123'),
            guildRole: jest.fn().mockReturnValue('/guilds/guild123/roles/role123')
        }
    };
});

describe('discordPlugin', () => {
    it('should have the correct name and description', () => {
        expect(discordPlugin.name).toBe('Discord');
        expect(discordPlugin.description).toBe('Instant messaging and VoIP social platform');
        expect(discordPlugin.id).toBe('discord');
        expect(discordPlugin.runner).toBe('node');
    });

    it('should have the correct input schema', () => {
        expect(discordPlugin.inputSchema.type).toBe('object');
        expect(discordPlugin.inputSchema.properties.action.enum).toContain('send_message');
        expect(discordPlugin.inputSchema.properties.action.enum).toContain('get_guilds');
        expect(discordPlugin.inputSchema.properties.action.enum).toContain('get_channels');
        expect(discordPlugin.inputSchema.properties.action.enum).toContain('get_roles');
        expect(discordPlugin.inputSchema.properties.action.enum).toContain('create_channel');
        expect(discordPlugin.inputSchema.properties.action.enum).toContain('delete_channel');
        expect(discordPlugin.inputSchema.properties.action.enum).toContain('add_role_to_member');
        expect(discordPlugin.inputSchema.properties.action.enum).toContain('remove_role_from_member');
        expect(discordPlugin.inputSchema.properties.action.enum).toContain('ban_member');
        expect(discordPlugin.inputSchema.properties.action.enum).toContain('remove_ban');
        expect(discordPlugin.inputSchema.properties.action.enum).toContain('find_member_by_username');
        expect(discordPlugin.inputSchema.properties.action.enum).toContain('create_role');
        expect(discordPlugin.inputSchema.properties.action.enum).toContain('delete_role');
    });

    it('should have the correct example input and output', () => {
        expect(discordPlugin.exampleInput).toBeDefined();
        expect(discordPlugin.exampleOutput).toBeDefined();
    });

    it('should have the correct documentation URL', () => {
        expect(discordPlugin.documentation).toBe('https://discord.com/developers/docs/');
    });

    it('should have the correct method', () => {
        expect(discordPlugin.method).toBe('exec');
    });

    it('should have the correct actions', () => {
        expect(discordPlugin.actions).toHaveLength(1);
        expect(discordPlugin.actions[0].name).toBe('discord');
        expect(typeof discordPlugin.actions[0].execute).toBe('function');
    });

    it('should throw an error for missing required parameters', async () => {
        const execute = discordPlugin.actions[0].execute;

        // Missing token
        await expect(execute({ action: 'send_message' })).rejects.toThrow('Missing required parameters');

        // Missing action
        await expect(execute({ token: 'token123' })).rejects.toThrow('Missing required parameters');
    });

    it('should throw an error for unsupported action', async () => {
        const execute = discordPlugin.actions[0].execute;

        await expect(execute({
            action: 'unsupported_action',
            token: 'token123'
        })).rejects.toThrow('Unsupported action');
    });

    it('should send a message', async () => {
        const execute = discordPlugin.actions[0].execute;

        const result = await execute({
            action: 'send_message',
            token: 'token123',
            channelId: 'channel123',
            content: 'Hello from MintFlow!'
        });

        expect(result).toEqual({
            id: 'message123',
            content: 'Hello from MintFlow!'
        });
    });

    it('should get guilds', async () => {
        const execute = discordPlugin.actions[0].execute;

        const result = await execute({
            action: 'get_guilds',
            token: 'token123'
        });

        expect(result).toEqual([
            { id: 'guild123', name: 'Test Guild' }
        ]);
    });

    it('should get channels', async () => {
        const execute = discordPlugin.actions[0].execute;

        const result = await execute({
            action: 'get_channels',
            token: 'token123',
            guildId: 'guild123'
        });

        expect(result).toEqual([
            { id: 'guild123', name: 'Test Guild' }
        ]);
    });

    it('should get roles', async () => {
        const execute = discordPlugin.actions[0].execute;

        const result = await execute({
            action: 'get_roles',
            token: 'token123',
            guildId: 'guild123'
        });

        expect(result).toEqual([
            { id: 'guild123', name: 'Test Guild' }
        ]);
    });

    it('should create a channel', async () => {
        const execute = discordPlugin.actions[0].execute;

        const result = await execute({
            action: 'create_channel',
            token: 'token123',
            guildId: 'guild123',
            name: 'test-channel',
            type: 0,
            topic: 'Test channel'
        });

        expect(result).toEqual({
            id: 'message123',
            content: 'Hello from MintFlow!'
        });
    });

    it('should delete a channel', async () => {
        const execute = discordPlugin.actions[0].execute;

        const result = await execute({
            action: 'delete_channel',
            token: 'token123',
            channelId: 'channel123'
        });

        expect(result).toEqual({ success: true });
    });

    it('should add a role to a member', async () => {
        const execute = discordPlugin.actions[0].execute;

        const result = await execute({
            action: 'add_role_to_member',
            token: 'token123',
            guildId: 'guild123',
            userId: 'user123',
            roleId: 'role123'
        });

        expect(result).toEqual({ success: true });
    });

    it('should remove a role from a member', async () => {
        const execute = discordPlugin.actions[0].execute;

        const result = await execute({
            action: 'remove_role_from_member',
            token: 'token123',
            guildId: 'guild123',
            userId: 'user123',
            roleId: 'role123'
        });

        expect(result).toEqual({ success: true });
    });

    it('should ban a member', async () => {
        const execute = discordPlugin.actions[0].execute;

        const result = await execute({
            action: 'ban_member',
            token: 'token123',
            guildId: 'guild123',
            userId: 'user123',
            reason: 'Test ban',
            deleteMessageDays: 7
        });

        expect(result).toEqual({ success: true });
    });

    it('should remove a ban', async () => {
        const execute = discordPlugin.actions[0].execute;

        const result = await execute({
            action: 'remove_ban',
            token: 'token123',
            guildId: 'guild123',
            userId: 'user123'
        });

        expect(result).toEqual({ success: true });
    });

    it('should find a member by username', async () => {
        const execute = discordPlugin.actions[0].execute;

        const result = await execute({
            action: 'find_member_by_username',
            token: 'token123',
            guildId: 'guild123',
            username: 'testuser'
        });

        expect(result).toEqual({
            user: { id: 'user123', username: 'testuser' }
        });
    });

    it('should create a role', async () => {
        const execute = discordPlugin.actions[0].execute;

        const result = await execute({
            action: 'create_role',
            token: 'token123',
            guildId: 'guild123',
            name: 'test-role',
            color: 0xFF0000,
            hoist: true,
            mentionable: true
        });

        expect(result).toEqual({
            id: 'message123',
            content: 'Hello from MintFlow!'
        });
    });

    it('should delete a role', async () => {
        const execute = discordPlugin.actions[0].execute;

        const result = await execute({
            action: 'delete_role',
            token: 'token123',
            guildId: 'guild123',
            roleId: 'role123'
        });

        expect(result).toEqual({ success: true });
    });
});
