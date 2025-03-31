import {
    createDatabaseItem,
    updateDatabaseItem,
    findDatabaseItems,
    createPage,
    appendToPage,
    getChildren,
    getDatabases,
    getPages,
    notionFieldMapping
} from './utils';

const notionPlugin = {
    name: "Notion",
    icon: "",
    description: "The all-in-one workspace",
    groups: ["productivity"],
    tags: ["productivity","collaboration","organization","workflow","task"],
    version: '1.0.0',
    id: "notion",
    runner: "node",
    inputSchema: {
        type: "object",
        properties: {
            action: {
                type: 'string',
                enum: [
                    'create_database_item',
                    'update_database_item',
                    'find_database_items',
                    'create_page',
                    'append_to_page',
                    'get_children',
                    'get_databases',
                    'get_pages'
                ],
                description: 'Action to perform on Notion',
            },
            token: {
                type: 'string',
                description: 'Notion API Token',
            },
            // Fields for database operations
            databaseId: {
                type: 'string',
                description: 'Notion Database ID',
                rules: [
                    { operation: 'notEqual', valueA: 'create_database_item', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'update_database_item', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'find_database_items', valueB: '{{action}}', action: 'hide' },
                ],
            },
            properties: {
                type: 'object',
                description: 'Database item properties',
                rules: [
                    { operation: 'notEqual', valueA: 'create_database_item', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'update_database_item', valueB: '{{action}}', action: 'hide' },
                ],
            },
            content: {
                type: 'string',
                description: 'Content to add to the page',
                rules: [
                    { operation: 'notEqual', valueA: 'create_database_item', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'create_page', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'append_to_page', valueB: '{{action}}', action: 'hide' },
                ],
            },
            // Fields for page operations
            pageId: {
                type: 'string',
                description: 'Notion Page ID',
                rules: [
                    { operation: 'notEqual', valueA: 'update_database_item', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'append_to_page', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'get_children', valueB: '{{action}}', action: 'hide' },
                ],
            },
            parentId: {
                type: 'string',
                description: 'Parent ID (database or page)',
                rules: [
                    { operation: 'notEqual', valueA: 'create_page', valueB: '{{action}}', action: 'hide' },
                ],
            },
            parentType: {
                type: 'string',
                enum: ['database_id', 'page_id'],
                description: 'Parent type',
                rules: [
                    { operation: 'notEqual', valueA: 'create_page', valueB: '{{action}}', action: 'hide' },
                ],
            },
            title: {
                type: 'string',
                description: 'Page title',
                rules: [
                    { operation: 'notEqual', valueA: 'create_page', valueB: '{{action}}', action: 'hide' },
                ],
            },
            icon: {
                type: 'string',
                description: 'Page icon (emoji)',
                rules: [
                    { operation: 'notEqual', valueA: 'create_page', valueB: '{{action}}', action: 'hide' },
                ],
            },
            cover: {
                type: 'string',
                description: 'Page cover image URL',
                rules: [
                    { operation: 'notEqual', valueA: 'create_page', valueB: '{{action}}', action: 'hide' },
                ],
            },
            // Fields for find_database_items
            filter: {
                type: 'object',
                description: 'Filter for database query',
                rules: [
                    { operation: 'notEqual', valueA: 'find_database_items', valueB: '{{action}}', action: 'hide' },
                ],
            },
            sorts: {
                type: 'array',
                description: 'Sort options for database query',
                rules: [
                    { operation: 'notEqual', valueA: 'find_database_items', valueB: '{{action}}', action: 'hide' },
                ],
            },
            pageSize: {
                type: 'number',
                description: 'Number of results to return',
                rules: [
                    { operation: 'notEqual', valueA: 'find_database_items', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'get_children', valueB: '{{action}}', action: 'hide' },
                ],
            },
            // Fields for get_children
            blockId: {
                type: 'string',
                description: 'Block ID to get children for',
                rules: [
                    { operation: 'notEqual', valueA: 'get_children', valueB: '{{action}}', action: 'hide' },
                ],
            },
            startCursor: {
                type: 'string',
                description: 'Cursor for pagination',
                rules: [
                    { operation: 'notEqual', valueA: 'get_children', valueB: '{{action}}', action: 'hide' },
                ],
            },
            // Fields for get_pages
            editedAfter: {
                type: 'string',
                description: 'Get pages edited after this date (ISO format)',
                rules: [
                    { operation: 'notEqual', valueA: 'get_pages', valueB: '{{action}}', action: 'hide' },
                ],
            },
            createdAfter: {
                type: 'string',
                description: 'Get pages created after this date (ISO format)',
                rules: [
                    { operation: 'notEqual', valueA: 'get_pages', valueB: '{{action}}', action: 'hide' },
                ],
            },
            sortProperty: {
                type: 'string',
                description: 'Property to sort by',
                rules: [
                    { operation: 'notEqual', valueA: 'get_pages', valueB: '{{action}}', action: 'hide' },
                ],
            },
            sortDirection: {
                type: 'string',
                enum: ['ascending', 'descending'],
                description: 'Sort direction',
                rules: [
                    { operation: 'notEqual', valueA: 'get_pages', valueB: '{{action}}', action: 'hide' },
                ],
            },
        },
        required: ['action', 'token'],
    },
    outputSchema: {
        type: "object",
    },
    exampleInput: {
        action: 'create_database_item',
        token: 'your-notion-api-token',
        databaseId: '1234567890abcdef',
        properties: {
            Name: 'New Item',
            Status: 'In Progress',
            Priority: 'High'
        },
        content: 'This is a new database item created with MintFlow.'
    },
    exampleOutput: {
        id: '1234567890abcdef',
        created_time: '2023-01-01T00:00:00.000Z',
        last_edited_time: '2023-01-01T00:00:00.000Z',
        properties: {
            Name: {
                title: [
                    {
                        text: {
                            content: 'New Item'
                        }
                    }
                ]
            },
            Status: {
                select: {
                    name: 'In Progress'
                }
            },
            Priority: {
                select: {
                    name: 'High'
                }
            }
        }
    },
    documentation: "https://developers.notion.com/",
    method: "exec",
    actions: [
        {
            name: 'notion',
            execute: async (input: any): Promise<any> => {
                const { action, token } = input;

                if (!action || !token) {
                    throw new Error('Missing required parameters: action, token');
                }

                switch (action) {
                    case 'create_database_item': {
                        const { databaseId, properties, content } = input;

                        if (!databaseId || !properties) {
                            throw new Error('Missing required parameters: databaseId, properties');
                        }

                        return await createDatabaseItem({
                            token,
                            databaseId,
                            properties,
                            content
                        });
                    }

                    case 'update_database_item': {
                        const { databaseId, pageId, properties } = input;

                        if (!databaseId || !pageId || !properties) {
                            throw new Error('Missing required parameters: databaseId, pageId, properties');
                        }

                        return await updateDatabaseItem({
                            token,
                            databaseId,
                            pageId,
                            properties
                        });
                    }

                    case 'find_database_items': {
                        const { databaseId, filter, sorts, pageSize } = input;

                        if (!databaseId) {
                            throw new Error('Missing required parameter: databaseId');
                        }

                        return await findDatabaseItems({
                            token,
                            databaseId,
                            filter,
                            sorts,
                            pageSize
                        });
                    }

                    case 'create_page': {
                        const { parentId, parentType, title, content, icon, cover } = input;

                        if (!parentId || !parentType || !title) {
                            throw new Error('Missing required parameters: parentId, parentType, title');
                        }

                        return await createPage({
                            token,
                            parentId,
                            parentType,
                            title,
                            content,
                            icon,
                            cover
                        });
                    }

                    case 'append_to_page': {
                        const { pageId, content } = input;

                        if (!pageId || !content) {
                            throw new Error('Missing required parameters: pageId, content');
                        }

                        return await appendToPage({
                            token,
                            pageId,
                            content
                        });
                    }

                    case 'get_children': {
                        const { blockId, pageSize, startCursor } = input;

                        if (!blockId) {
                            throw new Error('Missing required parameter: blockId');
                        }

                        return await getChildren({
                            token,
                            blockId,
                            pageSize,
                            startCursor
                        });
                    }

                    case 'get_databases': {
                        return await getDatabases(token);
                    }

                    case 'get_pages': {
                        const { editedAfter, createdAfter, sortProperty, sortDirection } = input;

                        const search: any = {};
                        if (editedAfter) {
                            search.editedAfter = new Date(editedAfter);
                        }
                        if (createdAfter) {
                            search.createdAfter = new Date(createdAfter);
                        }

                        const sort: any = {};
                        if (sortProperty) {
                            sort.property = sortProperty;
                        }
                        if (sortDirection) {
                            sort.direction = sortDirection;
                        }

                        return await getPages(token, search, sort);
                    }

                    default:
                        throw new Error(`Unsupported action: ${action}`);
                }
            }
        }
    ]
};

export default notionPlugin;
