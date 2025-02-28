import { createMondayClient } from './client.js';
import { MondayColumnType, MondayNotWritableColumnType } from './constants.js';
import { convertValueToMondayColumnValue, generateColumnIdTypeMap, isEmpty, parseMondayColumnValue } from './utils.js';

/**
 * Monday.com plugin for MintFlow
 * 
 * This plugin provides integration with Monday.com, allowing you to manage boards, items, columns, and more.
 */
export default {
    name: 'monday',
    version: '1.0.0',

    /**
     * Initialize the plugin with the provided configuration
     */
    init: async (config: { apiToken: string }) => {
        if (!config.apiToken) {
            throw new Error('API token is required for Monday.com plugin');
        }

        return {
            client: createMondayClient(config.apiToken),
        };
    },

    /**
     * List all workspaces
     */
    list_workspaces: async ({ client }) => {
        const response = await client.listWorkspaces();
        return response.data.workspaces;
    },

    /**
     * List all boards in a workspace
     */
    list_workspace_boards: async ({ client }, { workspaceId }) => {
        const response = await client.listWorkspaceBoards({ workspaceId });
        return response.data.boards;
    },

    /**
     * List all groups in a board
     */
    list_board_groups: async ({ client }, { boardId }) => {
        const response = await client.listBoardGroups({ boardId });
        return response.data.boards[0]?.groups || [];
    },

    /**
     * List all columns in a board
     */
    list_board_columns: async ({ client }, { boardId }) => {
        const response = await client.listBoardColumns({ boardId });
        return response.data.boards[0]?.columns || [];
    },

    /**
     * List all items in a board
     */
    list_board_items: async ({ client }, { boardId }) => {
        const response = await client.listBoardItems({ boardId });
        return response.data.boards[0]?.items_page.items || [];
    },

    /**
     * Create a new item in a board
     */
    create_item: async ({ client }, { boardId, itemName, groupId, columnValues, createLabelsIfMissing = false }) => {
        // Get column types to properly format values
        const columnsResponse = await client.listBoardColumns({ boardId });
        const columns = columnsResponse.data.boards[0]?.columns || [];
        const columnIdTypeMap = generateColumnIdTypeMap(columns);

        // Format column values
        const formattedColumnValues: Record<string, any> = {};
        if (columnValues) {
            Object.entries(columnValues).forEach(([key, value]) => {
                if (!isEmpty(value)) {
                    const columnType = columnIdTypeMap[key];
                    if (columnType && !MondayNotWritableColumnType.includes(columnType as MondayColumnType)) {
                        formattedColumnValues[key] = convertValueToMondayColumnValue(columnType, value);
                    }
                }
            });
        }

        const response = await client.createItem({
            itemName,
            boardId,
            groupId,
            columnValues: JSON.stringify(formattedColumnValues),
            createLabels: createLabelsIfMissing,
        });

        return response.data;
    },

    /**
     * Update an existing item in a board
     */
    update_item: async ({ client }, { boardId, itemId, columnValues }) => {
        // Get column types to properly format values
        const columnsResponse = await client.listBoardColumns({ boardId });
        const columns = columnsResponse.data.boards[0]?.columns || [];
        const columnIdTypeMap = generateColumnIdTypeMap(columns);

        // Format column values
        const formattedColumnValues: Record<string, any> = {};
        if (columnValues) {
            Object.entries(columnValues).forEach(([key, value]) => {
                if (!isEmpty(value)) {
                    const columnType = columnIdTypeMap[key];
                    if (columnType && !MondayNotWritableColumnType.includes(columnType as MondayColumnType)) {
                        formattedColumnValues[key] = convertValueToMondayColumnValue(columnType, value);
                    }
                }
            });
        }

        const response = await client.updateItem({
            itemId,
            boardId,
            columnValues: JSON.stringify(formattedColumnValues),
        });

        return response.data;
    },

    /**
     * Update an item's name
     */
    update_item_name: async ({ client }, { boardId, itemId, itemName }) => {
        const response = await client.updateItemName({
            itemId,
            boardId,
            itemName,
        });

        return response.data;
    },

    /**
     * Get column values for a specific item
     */
    get_item_column_values: async ({ client }, { boardId, itemId, columnIds }) => {
        const response = await client.getItemColumnValues({
            boardId,
            itemId,
            columnIds,
        });

        const items = response.data.boards[0]?.items_page.items || [];
        if (items.length === 0) {
            return null;
        }

        const item = items[0];
        const result = {
            id: item.id,
            name: item.name,
            columnValues: {},
        };

        // Parse column values
        item.column_values.forEach((columnValue) => {
            result.columnValues[columnValue.id] = parseMondayColumnValue(columnValue);
        });

        return result;
    },

    /**
     * Get all items with their column values in a board
     */
    get_board_item_values: async ({ client }, { boardId, columnIds }) => {
        const response = await client.getBoardItemValues({
            boardId,
            columnIds,
        });

        const items = response.data.boards[0]?.items_page.items || [];
        return items.map((item) => {
            const result = {
                id: item.id,
                name: item.name,
                columnValues: {},
            };

            // Parse column values
            item.column_values.forEach((columnValue) => {
                result.columnValues[columnValue.id] = parseMondayColumnValue(columnValue);
            });

            return result;
        });
    },

    /**
     * Create a new column in a board
     */
    create_column: async ({ client }, { boardId, columnTitle, columnType }) => {
        const response = await client.createColumn({
            boardId,
            columnTitle,
            columnType,
        });

        return response.data;
    },

    /**
     * Create a new group in a board
     */
    create_group: async ({ client }, { boardId, groupName }) => {
        const response = await client.createGroup({
            boardId,
            groupName,
        });

        return response.data;
    },

    /**
     * Create an update for an item
     */
    create_update: async ({ client }, { itemId, body }) => {
        const response = await client.createUpdate({
            itemId,
            body,
        });

        return response.data;
    },

    /**
     * List all users
     */
    list_users: async ({ client }) => {
        const response = await client.listUsers();
        return response.data.users;
    },

    /**
     * Create a webhook for a board
     */
    create_webhook: async ({ client }, { boardId, url, event, config }) => {
        const response = await client.createWebhook({
            boardId,
            url,
            event,
            config,
        });

        return response.data;
    },

    /**
     * Delete a webhook
     */
    delete_webhook: async ({ client }, { webhookId }) => {
        const response = await client.deleteWebhook({
            webhookId,
        });

        return response.data;
    },
};

// Export types
export * from './models.js';
export * from './constants.js';
