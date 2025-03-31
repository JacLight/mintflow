import { Client } from '@notionhq/client';
import {
    NotionCreateDatabaseItemParams,
    NotionUpdateDatabaseItemParams,
    NotionFindDatabaseItemParams,
    NotionCreatePageParams,
    NotionAppendToPageParams,
    NotionGetChildrenParams,
    NotionFieldMapping
} from './models';

/**
 * Field mappings for Notion database properties
 */
export const notionFieldMapping: NotionFieldMapping = {
    checkbox: {
        buildNotionType: (value: boolean) => ({
            checkbox: value,
        }),
    },
    date: {
        buildNotionType: (value: string) => ({
            date: {
                start: value,
            },
        }),
    },
    email: {
        buildNotionType: (value: string) => ({
            email: value,
        }),
    },
    select: {
        buildNotionType: (value: string) => ({
            select: {
                name: value,
            },
        }),
    },
    multi_select: {
        buildNotionType: (value: string[]) => ({
            multi_select: value.map((name) => ({ name })),
        }),
    },
    status: {
        buildNotionType: (value: string) => ({
            status: {
                name: value,
            },
        }),
    },
    number: {
        buildNotionType: (value: number) => ({
            number: Number(value),
        }),
    },
    phone_number: {
        buildNotionType: (value: string) => ({
            phone_number: value,
        }),
    },
    rich_text: {
        buildNotionType: (value: string) => ({
            rich_text: [
                {
                    type: 'text',
                    text: {
                        content: value,
                    },
                },
            ],
        }),
    },
    title: {
        buildNotionType: (value: string) => ({
            title: [
                {
                    type: 'text',
                    text: {
                        content: value,
                    },
                },
            ],
        }),
    },
    url: {
        buildNotionType: (value: string) => ({
            url: value,
        }),
    },
    people: {
        buildNotionType: (value: string[]) => ({
            people: value.map((id) => ({ id })),
        }),
    },
};

/**
 * Create a new item in a Notion database
 */
export const createDatabaseItem = async (params: NotionCreateDatabaseItemParams) => {
    const { token, databaseId, properties, content } = params;

    const notion = new Client({
        auth: token,
        notionVersion: '2022-06-28',
    });

    const { properties: dbProperties } = await notion.databases.retrieve({
        database_id: databaseId,
    });

    const notionFields: Record<string, any> = {};

    Object.keys(properties).forEach((key) => {
        if (properties[key] !== '') {
            const fieldType: string = dbProperties[key]?.type;
            if (fieldType && notionFieldMapping[fieldType]) {
                notionFields[key] = notionFieldMapping[fieldType].buildNotionType(properties[key]);
            }
        }
    });

    const children: any[] = [];

    // Add content to page
    if (content) {
        children.push({
            object: 'block',
            type: 'paragraph',
            paragraph: {
                rich_text: [
                    {
                        type: 'text',
                        text: {
                            content: content,
                        },
                    },
                ],
            },
        });
    }

    return await notion.pages.create({
        parent: {
            type: 'database_id',
            database_id: databaseId,
        },
        properties: notionFields,
        children: children,
    });
};

/**
 * Update an existing item in a Notion database
 */
export const updateDatabaseItem = async (params: NotionUpdateDatabaseItemParams) => {
    const { token, databaseId, pageId, properties } = params;

    const notion = new Client({
        auth: token,
        notionVersion: '2022-06-28',
    });

    const { properties: dbProperties } = await notion.databases.retrieve({
        database_id: databaseId,
    });

    const notionFields: Record<string, any> = {};

    Object.keys(properties).forEach((key) => {
        if (properties[key] !== '') {
            const fieldType: string = dbProperties[key]?.type;
            if (fieldType && notionFieldMapping[fieldType]) {
                notionFields[key] = notionFieldMapping[fieldType].buildNotionType(properties[key]);
            }
        }
    });

    return await notion.pages.update({
        page_id: pageId,
        properties: notionFields,
    });
};

/**
 * Find items in a Notion database
 */
export const findDatabaseItems = async (params: NotionFindDatabaseItemParams) => {
    const { token, databaseId, filter, sorts, pageSize } = params;

    const notion = new Client({
        auth: token,
        notionVersion: '2022-06-28',
    });

    const queryParams: any = {
        database_id: databaseId,
    };

    if (filter) {
        queryParams.filter = filter;
    }

    if (sorts) {
        queryParams.sorts = sorts;
    }

    if (pageSize) {
        queryParams.page_size = pageSize;
    }

    return await notion.databases.query(queryParams);
};

/**
 * Create a new page in Notion
 */
export const createPage = async (params: NotionCreatePageParams) => {
    const { token, parentId, parentType, title, content, icon, cover } = params;

    const notion = new Client({
        auth: token,
        notionVersion: '2022-06-28',
    });

    const children: any[] = [];

    // Add content to page
    if (content) {
        children.push({
            object: 'block',
            type: 'paragraph',
            paragraph: {
                rich_text: [
                    {
                        type: 'text',
                        text: {
                            content: content,
                        },
                    },
                ],
            },
        });
    }

    const createParams: any = {
        parent: {
            type: parentType,
            [parentType]: parentId,
        },
        properties: {
            title: {
                title: [
                    {
                        text: {
                            content: title,
                        },
                    },
                ],
            },
        },
        children: children,
    };

    // Add icon if provided
    if (icon) {
        createParams.icon = {
            type: 'emoji',
            emoji: icon,
        };
    }

    // Add cover if provided
    if (cover) {
        createParams.cover = {
            type: 'external',
            external: {
                url: cover,
            },
        };
    }

    return await notion.pages.create(createParams);
};

/**
 * Append content to an existing page
 */
export const appendToPage = async (params: NotionAppendToPageParams) => {
    const { token, pageId, content } = params;

    const notion = new Client({
        auth: token,
        notionVersion: '2022-06-28',
    });

    return await notion.blocks.children.append({
        block_id: pageId,
        children: [
            {
                object: 'block',
                type: 'paragraph',
                paragraph: {
                    rich_text: [
                        {
                            type: 'text',
                            text: {
                                content: content,
                            },
                        },
                    ],
                },
            },
        ],
    });
};

/**
 * Get children of a page or block
 */
export const getChildren = async (params: NotionGetChildrenParams) => {
    const { token, blockId, pageSize, startCursor } = params;

    const notion = new Client({
        auth: token,
        notionVersion: '2022-06-28',
    });

    const queryParams: any = {
        block_id: blockId,
    };

    if (pageSize) {
        queryParams.page_size = pageSize;
    }

    if (startCursor) {
        queryParams.start_cursor = startCursor;
    }

    return await notion.blocks.children.list(queryParams);
};

/**
 * Get a list of databases
 */
export const getDatabases = async (token: string) => {
    const notion = new Client({
        auth: token,
        notionVersion: '2022-06-28',
    });

    return await notion.search({
        filter: {
            property: 'object',
            value: 'database',
        },
    });
};

/**
 * Get a list of pages
 */
export const getPages = async (token: string, search?: {
    editedAfter?: Date;
    createdAfter?: Date;
}, sort?: {
    property: string;
    direction: 'ascending' | 'descending';
}) => {
    const notion = new Client({
        auth: token,
        notionVersion: '2022-06-28',
    });

    let filter: any = {
        property: 'object',
        value: 'page',
    };

    if (search?.editedAfter) {
        filter = {
            and: [
                {
                    property: 'object',
                    value: 'page',
                },
                {
                    timestamp: 'last_edited_time',
                    last_edited_time: {
                        after: search.editedAfter,
                    },
                },
            ],
        };
    }

    if (search?.createdAfter) {
        filter = {
            and: [
                {
                    property: 'object',
                    value: 'page',
                },
                {
                    timestamp: 'created_time',
                    created_time: {
                        after: search.createdAfter,
                    },
                },
            ],
        };
    }

    const sortObj: any = {
        direction: sort?.direction ?? 'descending',
        timestamp: sort?.property ?? 'last_edited_time',
    };

    return await notion.search({
        filter: filter,
        sort: sortObj,
    });
};
