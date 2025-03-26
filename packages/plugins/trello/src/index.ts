import { TrelloClient } from './client.js';
import {
    TrelloAuth,
    TrelloBoard,
    TrelloCard,
    TrelloList,
    TrelloLabel,
    TrelloWebhook,
    TrelloCardMoved,
    TrelloNewCard,
    TrelloWebhookPayload
} from './models.js';

// Create a default client instance with empty auth
const defaultClient = new TrelloClient({
    apiKey: '',
    token: ''
});

const trelloPlugin = {
    name: "Trello",
    icon: "",
    description: "Project management tool for teams",
    groups: ["productivity"],
    tags: ["productivity","collaboration","organization","workflow","task"],
    version: '1.0.0',
    id: "trello",
    runner: "node",
    inputSchema: {
        type: "object",
        properties: {
            action: {
                type: 'string',
                enum: [
                    // Board actions
                    'get_boards',
                    'get_board',

                    // List actions
                    'get_board_lists',
                    'create_list',
                    'update_list',

                    // Card actions
                    'get_card',
                    'create_card',
                    'update_card',
                    'delete_card',
                    'add_comment_to_card',
                    'get_board_cards',
                    'get_list_cards',

                    // Label actions
                    'get_board_labels',
                    'add_label_to_card',
                    'remove_label_from_card',

                    // Webhook actions
                    'create_webhook',
                    'delete_webhook',
                    'list_webhooks',
                    'process_webhook'
                ],
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Action to perform on Trello',
            },
            apiKey: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Your Trello API Key',
            },
            token: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Your Trello Token',
            },

            // Board parameters
            boardId: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Board ID',
                rules: [
                    { operation: 'notEqual', valueA: 'get_board', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'get_board_lists', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'get_board_cards', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'get_board_labels', valueB: '{{action}}', action: 'hide' },
                ],
            },

            // List parameters
            listId: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'List ID',
                rules: [
                    { operation: 'notEqual', valueA: 'update_list', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'get_list_cards', valueB: '{{action}}', action: 'hide' },
                ],
            },
            listName: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'List Name',
                rules: [
                    { operation: 'notEqual', valueA: 'create_list', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'update_list', valueB: '{{action}}', action: 'hide' },
                ],
            },
            listPosition: {
                type: 'string',
                enum: ['top', 'bottom'],
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'List Position',
                rules: [
                    { operation: 'notEqual', valueA: 'create_list', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'update_list', valueB: '{{action}}', action: 'hide' },
                ],
            },
            listClosed: {
                type: 'boolean',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Archive List',
                rules: [
                    { operation: 'notEqual', valueA: 'update_list', valueB: '{{action}}', action: 'hide' },
                ],
            },

            // Card parameters
            cardId: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Card ID',
                rules: [
                    { operation: 'notEqual', valueA: 'get_card', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'update_card', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'delete_card', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'add_comment_to_card', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'add_label_to_card', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'remove_label_from_card', valueB: '{{action}}', action: 'hide' },
                ],
            },
            cardName: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Card Name',
                rules: [
                    { operation: 'notEqual', valueA: 'create_card', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'update_card', valueB: '{{action}}', action: 'hide' },
                ],
            },
            cardDescription: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Card Description',
                rules: [
                    { operation: 'notEqual', valueA: 'create_card', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'update_card', valueB: '{{action}}', action: 'hide' },
                ],
            },
            cardPosition: {
                type: 'string',
                enum: ['top', 'bottom'],
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Card Position',
                rules: [
                    { operation: 'notEqual', valueA: 'create_card', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'update_card', valueB: '{{action}}', action: 'hide' },
                ],
            },
            cardDue: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Card Due Date (ISO 8601 format)',
                rules: [
                    { operation: 'notEqual', valueA: 'create_card', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'update_card', valueB: '{{action}}', action: 'hide' },
                ],
            },
            cardDueComplete: {
                type: 'boolean',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Card Due Date Complete',
                rules: [
                    { operation: 'notEqual', valueA: 'update_card', valueB: '{{action}}', action: 'hide' },
                ],
            },
            cardClosed: {
                type: 'boolean',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Archive Card',
                rules: [
                    { operation: 'notEqual', valueA: 'update_card', valueB: '{{action}}', action: 'hide' },
                ],
            },
            cardComment: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Card Comment',
                rules: [
                    { operation: 'notEqual', valueA: 'add_comment_to_card', valueB: '{{action}}', action: 'hide' },
                ],
            },

            // Label parameters
            labelId: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Label ID',
                rules: [
                    { operation: 'notEqual', valueA: 'add_label_to_card', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'remove_label_from_card', valueB: '{{action}}', action: 'hide' },
                ],
            },

            // Webhook parameters
            webhookId: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Webhook ID',
                rules: [
                    { operation: 'notEqual', valueA: 'delete_webhook', valueB: '{{action}}', action: 'hide' },
                ],
            },
            webhookModelId: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Webhook Model ID (board or list ID)',
                rules: [
                    { operation: 'notEqual', valueA: 'create_webhook', valueB: '{{action}}', action: 'hide' },
                ],
            },
            webhookCallbackUrl: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Webhook Callback URL',
                rules: [
                    { operation: 'notEqual', valueA: 'create_webhook', valueB: '{{action}}', action: 'hide' },
                ],
            },
            webhookDescription: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Webhook Description',
                rules: [
                    { operation: 'notEqual', valueA: 'create_webhook', valueB: '{{action}}', action: 'hide' },
                ],
            },
            webhookPayload: {
                type: 'object',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Webhook Payload',
                rules: [
                    { operation: 'notEqual', valueA: 'process_webhook', valueB: '{{action}}', action: 'hide' },
                ],
            },
        },
        required: ['action', 'apiKey', 'token'],
    },
    outputSchema: {
        type: "object",
    },
    exampleInput: {
        action: 'get_boards',
        apiKey: 'your-api-key',
        token: 'your-token'
    },
    exampleOutput: {
        "boards": [
            {
                "id": "5f7f3c5d7a4e5e3a2b1c9d8e",
                "name": "My Board",
                "desc": "Board description",
                "closed": false,
                "url": "https://trello.com/b/abc123/my-board",
                "shortUrl": "https://trello.com/b/abc123"
            }
        ]
    },
    documentation: "https://developer.atlassian.com/cloud/trello/rest/",
    method: "exec",
    actions: [
        {
            name: 'trello',
            execute: async (input: any, context?: any): Promise<any> => {
                const { action, apiKey, token } = input;

                if (!action || !apiKey || !token) {
                    throw new Error('Missing required parameters: action, apiKey, token');
                }

                // Create a client instance, using the context's axios instance if provided
                const auth: TrelloAuth = {
                    apiKey,
                    token
                };

                const client = context?.axiosInstance ?
                    new TrelloClient(auth, context.axiosInstance) :
                    new TrelloClient(auth);

                switch (action) {
                    // Board actions
                    case 'get_boards': {
                        return await client.getBoards();
                    }

                    case 'get_board': {
                        const { boardId } = input;
                        if (!boardId) {
                            throw new Error('Missing required parameter: boardId');
                        }
                        return await client.getBoard(boardId);
                    }

                    // List actions
                    case 'get_board_lists': {
                        const { boardId } = input;
                        if (!boardId) {
                            throw new Error('Missing required parameter: boardId');
                        }
                        return await client.getBoardLists(boardId);
                    }

                    case 'create_list': {
                        const { boardId, listName, listPosition } = input;
                        if (!boardId || !listName) {
                            throw new Error('Missing required parameters: boardId, listName');
                        }

                        const list: any = {
                            name: listName,
                            idBoard: boardId
                        };

                        if (listPosition) {
                            list.pos = listPosition;
                        }

                        return await client.createList(list);
                    }

                    case 'update_list': {
                        const { listId, listName, listPosition, listClosed } = input;
                        if (!listId) {
                            throw new Error('Missing required parameter: listId');
                        }

                        const list: any = {};

                        if (listName) list.name = listName;
                        if (listPosition) list.pos = listPosition;
                        if (listClosed !== undefined) list.closed = listClosed;

                        return await client.updateList(listId, list);
                    }

                    // Card actions
                    case 'get_card': {
                        const { cardId } = input;
                        if (!cardId) {
                            throw new Error('Missing required parameter: cardId');
                        }
                        return await client.getCard(cardId);
                    }

                    case 'create_card': {
                        const { listId, cardName, cardDescription, cardPosition, cardDue } = input;
                        if (!listId || !cardName) {
                            throw new Error('Missing required parameters: listId, cardName');
                        }

                        const card: any = {
                            name: cardName,
                            idList: listId
                        };

                        if (cardDescription) card.desc = cardDescription;
                        if (cardPosition) card.pos = cardPosition;
                        if (cardDue) card.due = cardDue;

                        return await client.createCard(card);
                    }

                    case 'update_card': {
                        const { cardId, cardName, cardDescription, cardPosition, cardDue, cardDueComplete, cardClosed, listId } = input;
                        if (!cardId) {
                            throw new Error('Missing required parameter: cardId');
                        }

                        const card: any = {};

                        if (cardName) card.name = cardName;
                        if (cardDescription) card.desc = cardDescription;
                        if (cardPosition) card.pos = cardPosition;
                        if (cardDue) card.due = cardDue;
                        if (cardDueComplete !== undefined) card.dueComplete = cardDueComplete;
                        if (cardClosed !== undefined) card.closed = cardClosed;
                        if (listId) card.idList = listId;

                        return await client.updateCard(cardId, card);
                    }

                    case 'delete_card': {
                        const { cardId } = input;
                        if (!cardId) {
                            throw new Error('Missing required parameter: cardId');
                        }
                        await client.deleteCard(cardId);
                        return { success: true, message: `Card ${cardId} deleted successfully` };
                    }

                    case 'add_comment_to_card': {
                        const { cardId, cardComment } = input;
                        if (!cardId || !cardComment) {
                            throw new Error('Missing required parameters: cardId, cardComment');
                        }
                        return await client.addCommentToCard(cardId, cardComment);
                    }

                    case 'get_board_cards': {
                        const { boardId } = input;
                        if (!boardId) {
                            throw new Error('Missing required parameter: boardId');
                        }
                        return await client.getBoardCards(boardId);
                    }

                    case 'get_list_cards': {
                        const { listId } = input;
                        if (!listId) {
                            throw new Error('Missing required parameter: listId');
                        }
                        return await client.getListCards(listId);
                    }

                    // Label actions
                    case 'get_board_labels': {
                        const { boardId } = input;
                        if (!boardId) {
                            throw new Error('Missing required parameter: boardId');
                        }
                        return await client.getBoardLabels(boardId);
                    }

                    case 'add_label_to_card': {
                        const { cardId, labelId } = input;
                        if (!cardId || !labelId) {
                            throw new Error('Missing required parameters: cardId, labelId');
                        }
                        return await client.addLabelToCard(cardId, labelId);
                    }

                    case 'remove_label_from_card': {
                        const { cardId, labelId } = input;
                        if (!cardId || !labelId) {
                            throw new Error('Missing required parameters: cardId, labelId');
                        }
                        return await client.removeLabelFromCard(cardId, labelId);
                    }

                    // Webhook actions
                    case 'create_webhook': {
                        const { webhookModelId, webhookCallbackUrl, webhookDescription } = input;
                        if (!webhookModelId || !webhookCallbackUrl) {
                            throw new Error('Missing required parameters: webhookModelId, webhookCallbackUrl');
                        }
                        return await client.createWebhook(webhookModelId, webhookCallbackUrl, webhookDescription);
                    }

                    case 'delete_webhook': {
                        const { webhookId } = input;
                        if (!webhookId) {
                            throw new Error('Missing required parameter: webhookId');
                        }
                        await client.deleteWebhook(webhookId);
                        return { success: true, message: `Webhook ${webhookId} deleted successfully` };
                    }

                    case 'list_webhooks': {
                        return await client.listWebhooks();
                    }

                    case 'process_webhook': {
                        const { webhookPayload } = input;
                        if (!webhookPayload) {
                            throw new Error('Missing required parameter: webhookPayload');
                        }

                        // Process the webhook payload based on its content
                        const payload = webhookPayload as TrelloWebhookPayload;

                        // Determine the type of webhook event
                        let eventType = 'unknown';
                        let cardId = '';

                        if (payload.action && payload.action.type) {
                            eventType = payload.action.type;

                            // Extract card ID if available
                            if (payload.action.data && payload.action.data.card && payload.action.data.card.id) {
                                cardId = payload.action.data.card.id;
                            }
                        }

                        return {
                            eventType,
                            cardId,
                            payload
                        };
                    }

                    default:
                        throw new Error(`Unsupported action: ${action}`);
                }
            }
        }
    ]
};

export { TrelloClient };
export default trelloPlugin;
