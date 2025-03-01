import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { createInviteLink } from '../src/actions/create-invite-link.js';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('createInviteLink action', () => {
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
    });

    it('should create an invite link successfully', async () => {
        // Spy on the Date constructor to return a fixed date
        jest.spyOn(global.Date, 'now').mockImplementation(() => new Date('2023-01-01T00:00:00Z').getTime());

        // Mock successful response
        mockedAxios.post.mockResolvedValue({
            data: {
                ok: true,
                result: {
                    invite_link: 'https://t.me/joinchat/AAAAAAAAAAAAAAAAAAAA',
                    creator: {
                        id: 123456789,
                        is_bot: true,
                        first_name: 'MintFlow Bot',
                        username: 'mintflow_bot',
                    },
                    creates_join_request: false,
                    is_primary: false,
                    is_revoked: false,
                    name: 'MintFlow Invite',
                    expire_date: 1704067199,
                    member_limit: 10,
                }
            }
        });

        // Execute the action
        const result = await createInviteLink.execute({
            bot_token: '123456789:ABCdefGhIJKlmnOPQRstUVwxYZ',
            chat_id: '-100123456789',
            name: 'MintFlow Invite',
            expire_date: '2023-12-31T23:59:59Z',
            member_limit: 10,
        }, {});

        // Verify axios.post was called with the correct parameters
        expect(mockedAxios.post).toHaveBeenCalledWith(
            'https://api.telegram.org/bot123456789:ABCdefGhIJKlmnOPQRstUVwxYZ/createChatInviteLink',
            {
                chat_id: '-100123456789',
                name: 'MintFlow Invite',
                expire_date: 1704067199, // Unix timestamp for 2023-12-31T23:59:59Z
                member_limit: 10,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        // Restore Date.now
        jest.restoreAllMocks();

        // Verify the result
        expect(result).toEqual({
            ok: true,
            result: {
                invite_link: 'https://t.me/joinchat/AAAAAAAAAAAAAAAAAAAA',
                creator: {
                    id: 123456789,
                    is_bot: true,
                    first_name: 'MintFlow Bot',
                    username: 'mintflow_bot',
                },
                creates_join_request: false,
                is_primary: false,
                is_revoked: false,
                name: 'MintFlow Invite',
                expire_date: 1704067199,
                member_limit: 10,
            }
        });
    });

    it('should create an invite link with minimal parameters', async () => {
        // Mock successful response
        mockedAxios.post.mockResolvedValue({
            data: {
                ok: true,
                result: {
                    invite_link: 'https://t.me/joinchat/AAAAAAAAAAAAAAAAAAAA',
                    creator: {
                        id: 123456789,
                        is_bot: true,
                        first_name: 'MintFlow Bot',
                        username: 'mintflow_bot',
                    },
                    creates_join_request: false,
                    is_primary: false,
                    is_revoked: false,
                }
            }
        });

        // Execute the action with minimal parameters
        const result = await createInviteLink.execute({
            bot_token: '123456789:ABCdefGhIJKlmnOPQRstUVwxYZ',
            chat_id: '-100123456789',
        }, {});

        // Verify axios.post was called with the correct parameters
        expect(mockedAxios.post).toHaveBeenCalledWith(
            'https://api.telegram.org/bot123456789:ABCdefGhIJKlmnOPQRstUVwxYZ/createChatInviteLink',
            {
                chat_id: '-100123456789',
                name: undefined,
                expire_date: undefined,
                member_limit: undefined,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
    });

    it('should handle API errors', async () => {
        // Mock axios.isAxiosError function
        jest.spyOn(axios, 'isAxiosError').mockImplementation(() => true);

        // Mock error
        const error = new Error('API error');
        mockedAxios.post.mockRejectedValue(error);

        // Execute the action and expect it to throw an error
        await expect(createInviteLink.execute({
            bot_token: '123456789:ABCdefGhIJKlmnOPQRstUVwxYZ',
            chat_id: '-100123456789',
        }, {})).rejects.toThrow('Telegram API error: API error');
    });
});
