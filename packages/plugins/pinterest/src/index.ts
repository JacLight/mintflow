import {
    createPin,
    createBoard,
    getBoardPins,
    getUserBoards,
    getUserProfile,
    searchPins
} from './utils';

const pinterestPlugin = {
    name: "Pinterest",
    icon: "",
    description: "Visual discovery engine for finding ideas like recipes, home decor, style inspiration, and more",
    id: "pinterest",
    runner: "node",
    inputSchema: {
        type: "object",
        properties: {
            action: {
                type: 'string',
                enum: [
                    'create_pin',
                    'create_board',
                    'get_board_pins',
                    'get_user_boards',
                    'get_user_profile',
                    'search_pins'
                ],
                description: 'Action to perform on Pinterest',
            },
            token: {
                type: 'string',
                description: 'Pinterest API OAuth token',
            },
            // Fields for create_pin
            boardId: {
                type: 'string',
                description: 'Pinterest Board ID',
                rules: [
                    { operation: 'notEqual', valueA: 'create_pin', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'get_board_pins', valueB: '{{action}}', action: 'hide' },
                ],
            },
            title: {
                type: 'string',
                description: 'Title for the pin',
                rules: [
                    { operation: 'notEqual', valueA: 'create_pin', valueB: '{{action}}', action: 'hide' },
                ],
            },
            description: {
                type: 'string',
                description: 'Description for the pin or board',
                rules: [
                    { operation: 'notEqual', valueA: 'create_pin', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'create_board', valueB: '{{action}}', action: 'hide' },
                ],
            },
            imageUrl: {
                type: 'string',
                description: 'URL of the image to pin',
                rules: [
                    { operation: 'notEqual', valueA: 'create_pin', valueB: '{{action}}', action: 'hide' },
                ],
            },
            link: {
                type: 'string',
                description: 'Destination link for the pin',
                rules: [
                    { operation: 'notEqual', valueA: 'create_pin', valueB: '{{action}}', action: 'hide' },
                ],
            },
            altText: {
                type: 'string',
                description: 'Alternative text for the image',
                rules: [
                    { operation: 'notEqual', valueA: 'create_pin', valueB: '{{action}}', action: 'hide' },
                ],
            },
            // Fields for create_board
            name: {
                type: 'string',
                description: 'Name for the board',
                rules: [
                    { operation: 'notEqual', valueA: 'create_board', valueB: '{{action}}', action: 'hide' },
                ],
            },
            privacy: {
                type: 'string',
                enum: ['PUBLIC', 'PROTECTED', 'SECRET'],
                description: 'Privacy setting for the board',
                rules: [
                    { operation: 'notEqual', valueA: 'create_board', valueB: '{{action}}', action: 'hide' },
                ],
            },
            // Fields for search_pins
            query: {
                type: 'string',
                description: 'Search query',
                rules: [
                    { operation: 'notEqual', valueA: 'search_pins', valueB: '{{action}}', action: 'hide' },
                ],
            },
            // Common fields
            maxResults: {
                type: 'number',
                description: 'Maximum number of results to return (default: 25)',
                rules: [
                    { operation: 'notEqual', valueA: 'get_board_pins', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'get_user_boards', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'search_pins', valueB: '{{action}}', action: 'hide' },
                ],
            },
        },
        required: ['action', 'token'],
    },
    outputSchema: {
        type: "object",
    },
    exampleInput: {
        action: 'create_pin',
        token: 'your-pinterest-api-token',
        boardId: '12345678',
        title: 'My Pinterest Pin',
        description: 'This is a great pin!',
        imageUrl: 'https://example.com/image.jpg',
        link: 'https://example.com'
    },
    exampleOutput: {
        id: 'pin-id-12345',
        title: 'My Pinterest Pin',
        description: 'This is a great pin!',
        link: 'https://example.com',
        url: 'https://www.pinterest.com/pin/pin-id-12345/',
        media: {
            images: {
                original: {
                    url: 'https://i.pinimg.com/originals/12/34/56/image.jpg',
                    width: 1000,
                    height: 1500
                }
            }
        },
        created_at: '2023-01-01T00:00:00Z',
        board: {
            id: '12345678',
            name: 'My Board',
            url: 'https://www.pinterest.com/username/my-board/'
        }
    },
    documentation: "https://developers.pinterest.com/docs/",
    method: "exec",
    actions: [
        {
            name: 'pinterest',
            execute: async (input: any): Promise<any> => {
                const { action, token } = input;

                if (!action || !token) {
                    throw new Error('Missing required parameters: action, token');
                }

                switch (action) {
                    case 'create_pin': {
                        const { boardId, title, description, imageUrl, link, altText } = input;

                        if (!boardId || !title || !imageUrl) {
                            throw new Error('Missing required parameters: boardId, title, imageUrl');
                        }

                        return await createPin({
                            token,
                            boardId,
                            title,
                            description,
                            imageUrl,
                            link,
                            altText
                        });
                    }

                    case 'create_board': {
                        const { name, description, privacy } = input;

                        if (!name) {
                            throw new Error('Missing required parameter: name');
                        }

                        return await createBoard({
                            token,
                            name,
                            description,
                            privacy
                        });
                    }

                    case 'get_board_pins': {
                        const { boardId, maxResults } = input;

                        if (!boardId) {
                            throw new Error('Missing required parameter: boardId');
                        }

                        return await getBoardPins({
                            token,
                            boardId,
                            maxResults
                        });
                    }

                    case 'get_user_boards': {
                        const { maxResults } = input;

                        return await getUserBoards({
                            token,
                            maxResults
                        });
                    }

                    case 'get_user_profile': {
                        return await getUserProfile(token);
                    }

                    case 'search_pins': {
                        const { query, maxResults } = input;

                        if (!query) {
                            throw new Error('Missing required parameter: query');
                        }

                        return await searchPins({
                            token,
                            query,
                            maxResults
                        });
                    }

                    default:
                        throw new Error(`Unsupported action: ${action}`);
                }
            }
        }
    ]
};

export default pinterestPlugin;
