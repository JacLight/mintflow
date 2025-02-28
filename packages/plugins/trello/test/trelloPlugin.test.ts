import trelloPlugin, { TrelloClient } from '../src/index.js';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';

describe('trelloPlugin', () => {
    let mock: MockAdapter;
    let axiosInstance: any;
    let executeTrello: any;

    beforeEach(() => {
        // Create a new axios instance for testing
        axiosInstance = axios.create();

        // Create a mock adapter for the axios instance
        mock = new MockAdapter(axiosInstance);

        // Get the execute function from the plugin
        executeTrello = trelloPlugin.actions[0].execute;
    });

    afterEach(() => {
        // Reset and restore the mock
        mock.reset();
        mock.restore();
    });

    it('should get boards successfully', async () => {
        // Mock the boards endpoint
        mock.onGet('https://api.trello.com/1/members/me/boards?key=test-api-key&token=test-token').reply(200, [
            {
                id: 'board1',
                name: 'Test Board',
                desc: 'Test Board Description',
                closed: false,
                url: 'https://trello.com/b/abc123/test-board',
                shortUrl: 'https://trello.com/b/abc123'
            }
        ]);

        const input = {
            action: 'get_boards',
            apiKey: 'test-api-key',
            token: 'test-token'
        };

        // Pass the axiosInstance in the context
        const result = await executeTrello(input, { axiosInstance });

        expect(result).toEqual([
            {
                id: 'board1',
                name: 'Test Board',
                desc: 'Test Board Description',
                closed: false,
                url: 'https://trello.com/b/abc123/test-board',
                shortUrl: 'https://trello.com/b/abc123'
            }
        ]);
    });

    it('should get a specific board successfully', async () => {
        // Mock the board endpoint
        mock.onGet('https://api.trello.com/1/boards/board1?key=test-api-key&token=test-token').reply(200, {
            id: 'board1',
            name: 'Test Board',
            desc: 'Test Board Description',
            closed: false,
            url: 'https://trello.com/b/abc123/test-board',
            shortUrl: 'https://trello.com/b/abc123'
        });

        const input = {
            action: 'get_board',
            apiKey: 'test-api-key',
            token: 'test-token',
            boardId: 'board1'
        };

        // Pass the axiosInstance in the context
        const result = await executeTrello(input, { axiosInstance });

        expect(result).toEqual({
            id: 'board1',
            name: 'Test Board',
            desc: 'Test Board Description',
            closed: false,
            url: 'https://trello.com/b/abc123/test-board',
            shortUrl: 'https://trello.com/b/abc123'
        });
    });

    it('should get board lists successfully', async () => {
        // Mock the board lists endpoint
        mock.onGet('https://api.trello.com/1/boards/board1/lists?key=test-api-key&token=test-token').reply(200, [
            {
                id: 'list1',
                name: 'To Do',
                closed: false,
                idBoard: 'board1',
                pos: 1
            },
            {
                id: 'list2',
                name: 'Doing',
                closed: false,
                idBoard: 'board1',
                pos: 2
            }
        ]);

        const input = {
            action: 'get_board_lists',
            apiKey: 'test-api-key',
            token: 'test-token',
            boardId: 'board1'
        };

        // Pass the axiosInstance in the context
        const result = await executeTrello(input, { axiosInstance });

        expect(result).toEqual([
            {
                id: 'list1',
                name: 'To Do',
                closed: false,
                idBoard: 'board1',
                pos: 1
            },
            {
                id: 'list2',
                name: 'Doing',
                closed: false,
                idBoard: 'board1',
                pos: 2
            }
        ]);
    });

    it('should create a card successfully', async () => {
        // Mock the create card endpoint
        mock.onPost('https://api.trello.com/1/cards?key=test-api-key&token=test-token').reply(200, {
            id: 'card1',
            name: 'Test Card',
            desc: 'Test Card Description',
            idList: 'list1',
            pos: 'top',
            due: null
        });

        const input = {
            action: 'create_card',
            apiKey: 'test-api-key',
            token: 'test-token',
            listId: 'list1',
            cardName: 'Test Card',
            cardDescription: 'Test Card Description',
            cardPosition: 'top'
        };

        // Pass the axiosInstance in the context
        const result = await executeTrello(input, { axiosInstance });

        expect(result).toEqual({
            id: 'card1',
            name: 'Test Card',
            desc: 'Test Card Description',
            idList: 'list1',
            pos: 'top',
            due: null
        });
    });

    it('should update a card successfully', async () => {
        // Mock the update card endpoint
        mock.onPut('https://api.trello.com/1/cards/card1?key=test-api-key&token=test-token').reply(200, {
            id: 'card1',
            name: 'Updated Card',
            desc: 'Updated Card Description',
            idList: 'list2',
            pos: 'bottom',
            due: null
        });

        const input = {
            action: 'update_card',
            apiKey: 'test-api-key',
            token: 'test-token',
            cardId: 'card1',
            cardName: 'Updated Card',
            cardDescription: 'Updated Card Description',
            cardPosition: 'bottom',
            listId: 'list2'
        };

        // Pass the axiosInstance in the context
        const result = await executeTrello(input, { axiosInstance });

        expect(result).toEqual({
            id: 'card1',
            name: 'Updated Card',
            desc: 'Updated Card Description',
            idList: 'list2',
            pos: 'bottom',
            due: null
        });
    });

    it('should delete a card successfully', async () => {
        // Mock the delete card endpoint
        mock.onDelete('https://api.trello.com/1/cards/card1?key=test-api-key&token=test-token').reply(200, {});

        const input = {
            action: 'delete_card',
            apiKey: 'test-api-key',
            token: 'test-token',
            cardId: 'card1'
        };

        // Pass the axiosInstance in the context
        const result = await executeTrello(input, { axiosInstance });

        expect(result).toEqual({
            success: true,
            message: 'Card card1 deleted successfully'
        });
    });

    it('should add a comment to a card successfully', async () => {
        // Mock the add comment endpoint
        mock.onPost('https://api.trello.com/1/cards/card1/actions/comments?key=test-api-key&token=test-token').reply(200, {
            id: 'comment1',
            data: {
                text: 'Test Comment'
            }
        });

        const input = {
            action: 'add_comment_to_card',
            apiKey: 'test-api-key',
            token: 'test-token',
            cardId: 'card1',
            cardComment: 'Test Comment'
        };

        // Pass the axiosInstance in the context
        const result = await executeTrello(input, { axiosInstance });

        expect(result).toEqual({
            id: 'comment1',
            data: {
                text: 'Test Comment'
            }
        });
    });

    it('should process a webhook payload successfully', async () => {
        const webhookPayload = {
            action: {
                id: 'action1',
                idMemberCreator: 'user1',
                data: {
                    card: {
                        id: 'card1',
                        name: 'Test Card'
                    },
                    list: {
                        id: 'list1',
                        name: 'To Do'
                    }
                },
                type: 'createCard',
                date: '2023-01-01T00:00:00.000Z',
                display: {
                    translationKey: 'action_create_card',
                    entities: {
                        card: {
                            type: 'card',
                            id: 'card1',
                            text: 'Test Card'
                        }
                    }
                },
                memberCreator: {
                    id: 'user1',
                    fullName: 'Test User',
                    username: 'testuser'
                }
            },
            model: {
                id: 'board1',
                name: 'Test Board'
            }
        };

        const input = {
            action: 'process_webhook',
            apiKey: 'test-api-key',
            token: 'test-token',
            webhookPayload
        };

        // Pass the axiosInstance in the context
        const result = await executeTrello(input, { axiosInstance });

        expect(result).toEqual({
            eventType: 'createCard',
            cardId: 'card1',
            payload: webhookPayload
        });
    });

    it('should throw an error for invalid action', async () => {
        const input = {
            action: 'invalid_action',
            apiKey: 'test-api-key',
            token: 'test-token'
        };

        // Pass the axiosInstance in the context
        await expect(executeTrello(input, { axiosInstance })).rejects.toThrow('Unsupported action: invalid_action');
    });

    it('should throw an error for missing required parameters', async () => {
        const input = {
            action: 'get_board',
            apiKey: 'test-api-key',
            token: 'test-token'
            // Missing boardId
        };

        // Pass the axiosInstance in the context
        await expect(executeTrello(input, { axiosInstance })).rejects.toThrow('Missing required parameter: boardId');
    });
});
