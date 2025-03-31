import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { getChatMember } from '../src/actions/get-chat-member.js';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('getChatMember action', () => {
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
    });

    it('should get chat member information successfully', async () => {
        // Mock successful response
        mockedAxios.post.mockResolvedValue({
            data: {
                ok: true,
                result: {
                    status: 'administrator',
                    user: {
                        id: 987654321,
                        is_bot: false,
                        first_name: 'John',
                        last_name: 'Doe',
                        username: 'johndoe',
                        language_code: 'en',
                    },
                    is_anonymous: false,
                    can_be_edited: false,
                    can_manage_chat: true,
                    can_change_info: true,
                    can_delete_messages: true,
                    can_invite_users: true,
                    can_restrict_members: true,
                    can_pin_messages: true,
                    can_promote_members: false,
                    can_manage_voice_chats: true,
                }
            }
        });

        // Execute the action
        const result = await getChatMember.execute({
            bot_token: '123456789:ABCdefGhIJKlmnOPQRstUVwxYZ',
            chat_id: '-100123456789',
            user_id: '987654321',
        }, {});

        // Verify axios.post was called with the correct parameters
        expect(mockedAxios.post).toHaveBeenCalledWith(
            'https://api.telegram.org/bot123456789:ABCdefGhIJKlmnOPQRstUVwxYZ/getChatMember',
            {
                chat_id: '-100123456789',
                user_id: '987654321',
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        // Verify the result
        expect(result).toEqual({
            ok: true,
            result: {
                status: 'administrator',
                user: {
                    id: 987654321,
                    is_bot: false,
                    first_name: 'John',
                    last_name: 'Doe',
                    username: 'johndoe',
                    language_code: 'en',
                },
                is_anonymous: false,
                can_be_edited: false,
                can_manage_chat: true,
                can_change_info: true,
                can_delete_messages: true,
                can_invite_users: true,
                can_restrict_members: true,
                can_pin_messages: true,
                can_promote_members: false,
                can_manage_voice_chats: true,
            }
        });
    });

    it('should handle user not found in chat', async () => {
        // Mock error response for user not found
        const error = new Error('Bad Request: user not found');
        (error as any).response = {
            status: 400,
            data: {
                ok: false,
                error_code: 400,
                description: 'Bad Request: user not found',
            },
        };

        // Mock axios.isAxiosError function
        jest.spyOn(axios, 'isAxiosError').mockImplementation(() => true);

        // Add properties to make it look like an Axios error
        (error as any).isAxiosError = true;
        mockedAxios.post.mockRejectedValue(error);

        // Execute the action
        const result = await getChatMember.execute({
            bot_token: '123456789:ABCdefGhIJKlmnOPQRstUVwxYZ',
            chat_id: '-100123456789',
            user_id: '987654321',
        }, {});

        // Verify the result is a structured error response
        expect(result).toEqual({
            ok: false,
            error_code: 400,
            description: 'User not found in chat',
        });
    });

    it('should handle API errors', async () => {
        // Mock axios.isAxiosError function
        jest.spyOn(axios, 'isAxiosError').mockImplementation(() => true);

        // Mock error
        const error = new Error('API error');
        mockedAxios.post.mockRejectedValue(error);

        // Execute the action and expect it to throw an error
        await expect(getChatMember.execute({
            bot_token: '123456789:ABCdefGhIJKlmnOPQRstUVwxYZ',
            chat_id: '-100123456789',
            user_id: '987654321',
        }, {})).rejects.toThrow('Telegram API error: API error');
    });
});
