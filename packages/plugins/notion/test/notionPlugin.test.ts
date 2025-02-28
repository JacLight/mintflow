import { describe, it, expect, jest } from '@jest/globals';
import { Client } from '@notionhq/client';
import notionPlugin from '../src/index';

// Mock @notionhq/client
jest.mock('@notionhq/client', () => {
    return {
        Client: jest.fn().mockImplementation(() => ({
            databases: {
                retrieve: jest.fn().mockResolvedValue({
                    properties: {
                        Name: { type: 'title' },
                        Status: { type: 'select' },
                        Priority: { type: 'select' },
                        Description: { type: 'rich_text' },
                        DueDate: { type: 'date' },
                        Completed: { type: 'checkbox' },
                    }
                }),
                query: jest.fn().mockResolvedValue({
                    results: [
                        {
                            id: 'page123',
                            properties: {
                                Name: {
                                    title: [
                                        {
                                            text: {
                                                content: 'Test Item'
                                            }
                                        }
                                    ]
                                }
                            }
                        }
                    ]
                })
            },
            pages: {
                create: jest.fn().mockResolvedValue({
                    id: 'page123',
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
                }),
                update: jest.fn().mockResolvedValue({
                    id: 'page123',
                    properties: {
                        Status: {
                            select: {
                                name: 'Completed'
                            }
                        }
                    }
                })
            },
            blocks: {
                children: {
                    append: jest.fn().mockResolvedValue({
                        results: [
                            {
                                id: 'block123',
                                type: 'paragraph',
                                paragraph: {
                                    rich_text: [
                                        {
                                            type: 'text',
                                            text: {
                                                content: 'Test content'
                                            }
                                        }
                                    ]
                                }
                            }
                        ]
                    }),
                    list: jest.fn().mockResolvedValue({
                        results: [
                            {
                                id: 'block123',
                                type: 'paragraph',
                                paragraph: {
                                    rich_text: [
                                        {
                                            type: 'text',
                                            text: {
                                                content: 'Test content'
                                            }
                                        }
                                    ]
                                }
                            }
                        ]
                    })
                }
            },
            search: jest.fn().mockImplementation((params) => {
                if (params.filter && params.filter.property === 'object' && params.filter.value === 'database') {
                    return Promise.resolve({
                        results: [
                            {
                                id: 'database123',
                                title: [
                                    {
                                        plain_text: 'Test Database'
                                    }
                                ]
                            }
                        ]
                    });
                } else if (params.filter && params.filter.property === 'object' && params.filter.value === 'page') {
                    return Promise.resolve({
                        results: [
                            {
                                id: 'page123',
                                properties: {
                                    title: {
                                        title: [
                                            {
                                                plain_text: 'Test Page'
                                            }
                                        ]
                                    }
                                }
                            }
                        ]
                    });
                }
                return Promise.resolve({ results: [] });
            })
        }))
    };
});

describe('notionPlugin', () => {
    it('should have the correct name and description', () => {
        expect(notionPlugin.name).toBe('Notion');
        expect(notionPlugin.description).toBe('The all-in-one workspace');
        expect(notionPlugin.id).toBe('notion');
        expect(notionPlugin.runner).toBe('node');
    });

    it('should have the correct input schema', () => {
        expect(notionPlugin.inputSchema.type).toBe('object');
        expect(notionPlugin.inputSchema.properties.action.enum).toContain('create_database_item');
        expect(notionPlugin.inputSchema.properties.action.enum).toContain('update_database_item');
        expect(notionPlugin.inputSchema.properties.action.enum).toContain('find_database_items');
        expect(notionPlugin.inputSchema.properties.action.enum).toContain('create_page');
        expect(notionPlugin.inputSchema.properties.action.enum).toContain('append_to_page');
        expect(notionPlugin.inputSchema.properties.action.enum).toContain('get_children');
        expect(notionPlugin.inputSchema.properties.action.enum).toContain('get_databases');
        expect(notionPlugin.inputSchema.properties.action.enum).toContain('get_pages');
    });

    it('should have the correct example input and output', () => {
        expect(notionPlugin.exampleInput).toBeDefined();
        expect(notionPlugin.exampleOutput).toBeDefined();
    });

    it('should have the correct documentation URL', () => {
        expect(notionPlugin.documentation).toBe('https://developers.notion.com/');
    });

    it('should have the correct method', () => {
        expect(notionPlugin.method).toBe('exec');
    });

    it('should have the correct actions', () => {
        expect(notionPlugin.actions).toHaveLength(1);
        expect(notionPlugin.actions[0].name).toBe('notion');
        expect(typeof notionPlugin.actions[0].execute).toBe('function');
    });

    it('should throw an error for missing required parameters', async () => {
        const execute = notionPlugin.actions[0].execute;

        // Missing token
        await expect(execute({ action: 'create_database_item' })).rejects.toThrow('Missing required parameters');

        // Missing action
        await expect(execute({ token: 'token123' })).rejects.toThrow('Missing required parameters');
    });

    it('should throw an error for unsupported action', async () => {
        const execute = notionPlugin.actions[0].execute;

        await expect(execute({
            action: 'unsupported_action',
            token: 'token123'
        })).rejects.toThrow('Unsupported action');
    });

    it('should create a database item', async () => {
        const execute = notionPlugin.actions[0].execute;

        const result = await execute({
            action: 'create_database_item',
            token: 'token123',
            databaseId: 'database123',
            properties: {
                Name: 'New Item',
                Status: 'In Progress',
                Priority: 'High'
            },
            content: 'This is a new database item created with MintFlow.'
        });

        expect(result).toEqual({
            id: 'page123',
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
        });
    });

    it('should update a database item', async () => {
        const execute = notionPlugin.actions[0].execute;

        const result = await execute({
            action: 'update_database_item',
            token: 'token123',
            databaseId: 'database123',
            pageId: 'page123',
            properties: {
                Status: 'Completed'
            }
        });

        expect(result).toEqual({
            id: 'page123',
            properties: {
                Status: {
                    select: {
                        name: 'Completed'
                    }
                }
            }
        });
    });

    it('should find database items', async () => {
        const execute = notionPlugin.actions[0].execute;

        const result = await execute({
            action: 'find_database_items',
            token: 'token123',
            databaseId: 'database123',
            filter: {
                property: 'Status',
                select: {
                    equals: 'In Progress'
                }
            }
        });

        expect(result.results).toHaveLength(1);
        expect(result.results[0].id).toBe('page123');
    });

    it('should create a page', async () => {
        const execute = notionPlugin.actions[0].execute;

        const result = await execute({
            action: 'create_page',
            token: 'token123',
            parentId: 'page123',
            parentType: 'page_id',
            title: 'New Page',
            content: 'This is a new page created with MintFlow.'
        });

        expect(result.id).toBe('page123');
    });

    it('should append to a page', async () => {
        const execute = notionPlugin.actions[0].execute;

        const result = await execute({
            action: 'append_to_page',
            token: 'token123',
            pageId: 'page123',
            content: 'This is appended content.'
        });

        expect(result.results).toHaveLength(1);
        expect(result.results[0].id).toBe('block123');
    });

    it('should get children of a block', async () => {
        const execute = notionPlugin.actions[0].execute;

        const result = await execute({
            action: 'get_children',
            token: 'token123',
            blockId: 'block123'
        });

        expect(result.results).toHaveLength(1);
        expect(result.results[0].id).toBe('block123');
    });

    it('should get databases', async () => {
        const execute = notionPlugin.actions[0].execute;

        const result = await execute({
            action: 'get_databases',
            token: 'token123'
        });

        expect(result.results).toHaveLength(1);
        expect(result.results[0].id).toBe('database123');
    });

    it('should get pages', async () => {
        const execute = notionPlugin.actions[0].execute;

        const result = await execute({
            action: 'get_pages',
            token: 'token123',
            editedAfter: '2023-01-01T00:00:00.000Z',
            sortDirection: 'descending'
        });

        // The mock for search is already set up to return a page when filter.value === 'page'
        expect(result.results).toBeDefined();
    });
});
