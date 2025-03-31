import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { sendMessage } from '../src/actions/send-message.js';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('sendMessage action', () => {
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
    });

    it('should send a message successfully', async () => {
        // Mock successful response
        mockedAxios.post.mockResolvedValue({
            data: {
                ok: true,
                result: {
                    message_id: 123,
                    from: {
                        id: 123456789,
                        is_bot: true,
                        first_name: 'MintFlow Bot',
                        username: 'mintflow_bot',
                    },
                    chat: {
                        id: 123456789,
                        first_name: 'John',
                        last_name: 'Doe',
                        username: 'johndoe',
                        type: 'private',
                    },
                    date: 1613826000,
                    text: 'Hello from MintFlow!',
                }
            }
        });

        // Execute the action
        const result = await sendMessage.execute({
            bot_token: '123456789:ABCdefGhIJKlmnOPQRstUVwxYZ',
            chat_id: '123456789',
            message: 'Hello from MintFlow!',
            format: 'MarkdownV2',
        }, {});

        // Verify axios.post was called with the correct parameters
        expect(mockedAxios.post).toHaveBeenCalledWith(
            'https://api.telegram.org/bot123456789:ABCdefGhIJKlmnOPQRstUVwxYZ/sendMessage',
            {
                chat_id: '123456789',
                text: 'Hello from MintFlow!',
                message_thread_id: undefined,
                parse_mode: 'MarkdownV2',
                reply_markup: undefined,
                disable_web_page_preview: false,
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
                message_id: 123,
                from: {
                    id: 123456789,
                    is_bot: true,
                    first_name: 'MintFlow Bot',
                    username: 'mintflow_bot',
                },
                chat: {
                    id: 123456789,
                    first_name: 'John',
                    last_name: 'Doe',
                    username: 'johndoe',
                    type: 'private',
                },
                date: 1613826000,
                text: 'Hello from MintFlow!',
            }
        });
    });

    it('should handle errors', async () => {
        // Mock axios.isAxiosError function
        jest.spyOn(axios, 'isAxiosError').mockImplementation(() => true);

        // Mock error
        const error = new Error('API error');
        mockedAxios.post.mockRejectedValue(error);

        // Execute the action and expect it to throw an error
        await expect(sendMessage.execute({
            bot_token: '123456789:ABCdefGhIJKlmnOPQRstUVwxYZ',
            chat_id: '123456789',
            message: 'Hello from MintFlow!',
        }, {})).rejects.toThrow('Telegram API error: API error');
    });

    it('should use default values when optional parameters are not provided', async () => {
        // Mock successful response
        mockedAxios.post.mockResolvedValue({
            data: {
                ok: true,
                result: {
                    message_id: 123,
                }
            }
        });

        // Execute the action with minimal parameters
        await sendMessage.execute({
            bot_token: '123456789:ABCdefGhIJKlmnOPQRstUVwxYZ',
            chat_id: '123456789',
            message: 'Hello from MintFlow!',
        }, {});

        // Verify axios.post was called with the correct parameters and default values
        expect(mockedAxios.post).toHaveBeenCalledWith(
            'https://api.telegram.org/bot123456789:ABCdefGhIJKlmnOPQRstUVwxYZ/sendMessage',
            {
                chat_id: '123456789',
                text: 'Hello from MintFlow!',
                message_thread_id: undefined,
                parse_mode: 'MarkdownV2', // Default value
                reply_markup: undefined,
                disable_web_page_preview: false, // Default value
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
    });
});
