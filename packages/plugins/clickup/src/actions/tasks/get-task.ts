import { createClient } from '../../common/index.js';

export const getTaskAction = {
    name: 'get_task',
    description: 'Get a task from ClickUp by ID',
    inputSchema: {
        type: 'object',
        properties: {
            apiKey: {
                type: 'string',
                description: 'ClickUp API Key',
            },
            taskId: {
                type: 'string',
                description: 'The ID of the task to retrieve',
            },
        },
        required: ['apiKey', 'taskId'],
    },
    outputSchema: {
        type: 'object',
        properties: {
            id: {
                type: 'string',
                description: 'The ID of the task',
            },
            name: {
                type: 'string',
                description: 'The name of the task',
            },
            description: {
                type: 'string',
                description: 'The description of the task',
            },
            status: {
                type: 'object',
                description: 'The status of the task',
                properties: {
                    status: {
                        type: 'string',
                        description: 'The status name',
                    },
                    color: {
                        type: 'string',
                        description: 'The status color',
                    },
                },
            },
            assignees: {
                type: 'array',
                description: 'The users assigned to the task',
                items: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'number',
                            description: 'The ID of the user',
                        },
                        username: {
                            type: 'string',
                            description: 'The username of the user',
                        },
                    },
                },
            },
            tags: {
                type: 'array',
                description: 'The tags on the task',
                items: {
                    type: 'object',
                    properties: {
                        name: {
                            type: 'string',
                            description: 'The name of the tag',
                        },
                    },
                },
            },
            dueDate: {
                type: 'string',
                description: 'The due date of the task',
            },
            url: {
                type: 'string',
                description: 'The URL of the task',
            },
            error: {
                type: 'string',
                description: 'Error message if the task retrieval failed',
            },
        },
    },
    exampleInput: {
        apiKey: 'pk_12345678_ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        taskId: '123456789',
    },
    exampleOutput: {
        id: '123456789',
        name: 'Task Name',
        description: 'Task Description',
        status: {
            status: 'in progress',
            color: '#4194f6',
        },
        assignees: [
            {
                id: 12345678,
                username: 'John Doe',
            },
        ],
        tags: [
            {
                name: 'bug',
            },
        ],
        dueDate: '2023-12-31',
        url: 'https://app.clickup.com/t/123456789',
    },
    execute: async (input: any) => {
        const { apiKey, taskId } = input;
        const client = createClient(apiKey);

        try {
            const response = await client.getTask(taskId);

            if (response.error) {
                return { error: response.error };
            }

            if (!response.data) {
                return { error: 'No task data returned from API' };
            }

            const task = response.data;
            return {
                id: task.id,
                name: task.name,
                description: task.description || '',
                status: {
                    status: task.status.status,
                    color: task.status.color,
                },
                assignees: task.assignees.map((assignee) => ({
                    id: assignee.id,
                    username: assignee.username,
                })),
                tags: task.tags.map((tag) => ({
                    name: tag.name,
                })),
                dueDate: task.due_date || '',
                url: task.url,
            };
        } catch (error) {
            if (error instanceof Error) {
                return { error: error.message };
            }
            return { error: 'An unknown error occurred' };
        }
    },
};
