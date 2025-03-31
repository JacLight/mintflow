import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { sendMedia } from '../src/actions/send-media.js';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('sendMedia action', () => {
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
    });

    it('should send a photo using media_url', async () => {
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
                    photo: [
                        {
                            file_id: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
                            file_unique_id: '123456789',
                            file_size: 1234,
                            width: 100,
                            height: 100,
                        },
                        {
                            file_id: 'ZYXWVUTSRQPONMLKJIHGFEDCBA',
                            file_unique_id: '987654321',
                            file_size: 5678,
                            width: 800,
                            height: 600,
                        },
                    ],
                    caption: 'Check out this image!',
                }
            }
        });

        // Execute the action
        const result = await sendMedia.execute({
            bot_token: '123456789:ABCdefGhIJKlmnOPQRstUVwxYZ',
            chat_id: '123456789',
            media_type: 'photo',
            media_url: 'https://example.com/image.jpg',
            caption: 'Check out this image!',
            format: 'MarkdownV2',
        }, {});

        // Verify axios.post was called with the correct parameters
        expect(mockedAxios.post).toHaveBeenCalledWith(
            'https://api.telegram.org/bot123456789:ABCdefGhIJKlmnOPQRstUVwxYZ/sendPhoto',
            {
                chat_id: '123456789',
                photo: 'https://example.com/image.jpg',
                caption: 'Check out this image!',
                message_thread_id: undefined,
                parse_mode: 'MarkdownV2',
                reply_markup: undefined,
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
                photo: [
                    {
                        file_id: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
                        file_unique_id: '123456789',
                        file_size: 1234,
                        width: 100,
                        height: 100,
                    },
                    {
                        file_id: 'ZYXWVUTSRQPONMLKJIHGFEDCBA',
                        file_unique_id: '987654321',
                        file_size: 5678,
                        width: 800,
                        height: 600,
                    },
                ],
                caption: 'Check out this image!',
            }
        });
    });

    it('should send a video using media_id', async () => {
        // Mock successful response
        mockedAxios.post.mockResolvedValue({
            data: {
                ok: true,
                result: {
                    message_id: 123,
                    video: {
                        file_id: 'VIDEO_FILE_ID',
                        file_unique_id: '123456789',
                        file_size: 12345,
                        width: 1280,
                        height: 720,
                        duration: 30,
                    },
                }
            }
        });

        // Execute the action
        const result = await sendMedia.execute({
            bot_token: '123456789:ABCdefGhIJKlmnOPQRstUVwxYZ',
            chat_id: '123456789',
            media_type: 'video',
            media_id: 'VIDEO_FILE_ID',
            caption: 'Check out this video!',
        }, {});

        // Verify axios.post was called with the correct parameters
        expect(mockedAxios.post).toHaveBeenCalledWith(
            'https://api.telegram.org/bot123456789:ABCdefGhIJKlmnOPQRstUVwxYZ/sendVideo',
            {
                chat_id: '123456789',
                video: 'VIDEO_FILE_ID',
                caption: 'Check out this video!',
                message_thread_id: undefined,
                parse_mode: 'MarkdownV2', // Default value
                reply_markup: undefined,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
    });

    it('should throw an error if neither media_url nor media_id is provided', async () => {
        // Execute the action and expect it to throw an error
        await expect(sendMedia.execute({
            bot_token: '123456789:ABCdefGhIJKlmnOPQRstUVwxYZ',
            chat_id: '123456789',
            media_type: 'photo',
        }, {})).rejects.toThrow('Either media_url or media_id must be provided');
    });

    it('should throw an error for unsupported media type', async () => {
        // Execute the action and expect it to throw an error
        await expect(sendMedia.execute({
            bot_token: '123456789:ABCdefGhIJKlmnOPQRstUVwxYZ',
            chat_id: '123456789',
            media_type: 'unsupported' as any,
            media_url: 'https://example.com/file.txt',
        }, {})).rejects.toThrow('Unsupported media type: unsupported');
    });

    it('should handle API errors', async () => {
        // Mock axios.isAxiosError function
        jest.spyOn(axios, 'isAxiosError').mockImplementation(() => true);

        // Mock error
        const error = new Error('API error');
        mockedAxios.post.mockRejectedValue(error);

        // Execute the action and expect it to throw an error
        await expect(sendMedia.execute({
            bot_token: '123456789:ABCdefGhIJKlmnOPQRstUVwxYZ',
            chat_id: '123456789',
            media_type: 'photo',
            media_url: 'https://example.com/image.jpg',
        }, {})).rejects.toThrow('Telegram API error: API error');
    });
});
