import { createClient } from '../../common/index.js';

export const deleteTaskAction = {
    name: 'delete_task',
    description: 'Delete a task from ClickUp',
    inputSchema: {
        type: 'object',
        properties: {
            apiKey: {
                type: 'string',
                description: 'ClickUp API Key',
            },
            taskId: {
                type: 'string',
                description: 'The ID of the task to delete',
            },
        },
        required: ['apiKey', 'taskId'],
    },
    outputSchema: {
        type: 'object',
        properties: {
            success: {
                type: 'boolean',
                description: 'Whether the task was deleted successfully',
            },
            error: {
                type: 'string',
                description: 'Error message if the task deletion failed',
            },
        },
    },
    exampleInput: {
        apiKey: 'pk_12345678_ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        taskId: '123456789',
    },
    exampleOutput: {
        success: true,
    },
    execute: async (input: any) => {
        const { apiKey, taskId } = input;
        const client = createClient(apiKey);

        try {
            const response = await client.deleteTask(taskId);

            if (response.error) {
                return { success: false, error: response.error };
            }

            if (!response.data) {
                return { success: false, error: 'No response data returned from API' };
            }

            return { success: response.data.success };
        } catch (error) {
            if (error instanceof Error) {
                return { success: false, error: error.message };
            }
            return { success: false, error: 'An unknown error occurred' };
        }
    },
};
