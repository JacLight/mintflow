import { createClient } from '../../common/index.js';

export const updateTaskAction = {
    name: 'update_task',
    description: 'Update an existing task in ClickUp',
    inputSchema: {
        type: 'object',
        properties: {
            apiKey: {
                type: 'string',
                description: 'ClickUp API Key',
            },
            taskId: {
                type: 'string',
                description: 'The ID of the task to update',
            },
            name: {
                type: 'string',
                description: 'The new name of the task',
            },
            description: {
                type: 'string',
                description: 'The new description of the task',
            },
            markdownDescription: {
                type: 'string',
                description: 'The new description of the task in markdown format',
            },
            assignees: {
                type: 'array',
                description: 'The IDs of the users to assign to the task',
                items: {
                    type: 'number',
                },
            },
            status: {
                type: 'string',
                description: 'The new status of the task',
            },
            priority: {
                type: 'number',
                description: 'The new priority of the task (1=Urgent, 2=High, 3=Normal, 4=Low)',
                enum: [1, 2, 3, 4],
            },
            dueDate: {
                type: 'number',
                description: 'The new due date of the task (Unix timestamp in milliseconds)',
            },
            dueDateTime: {
                type: 'boolean',
                description: 'Whether the due date includes a time',
            },
            timeEstimate: {
                type: 'number',
                description: 'The new time estimate of the task in milliseconds',
            },
            startDate: {
                type: 'number',
                description: 'The new start date of the task (Unix timestamp in milliseconds)',
            },
            startDateTime: {
                type: 'boolean',
                description: 'Whether the start date includes a time',
            },
            notifyAll: {
                type: 'boolean',
                description: 'Whether to notify all assignees',
            },
            parent: {
                type: 'string',
                description: 'The ID of the parent task',
            },
            linksTo: {
                type: 'string',
                description: 'The ID of the task to link to',
            },
            customFields: {
                type: 'array',
                description: 'The custom fields to update on the task',
                items: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            description: 'The ID of the custom field',
                        },
                        value: {
                            type: 'any',
                            description: 'The value of the custom field',
                        },
                    },
                    required: ['id', 'value'],
                },
            },
        },
        required: ['apiKey', 'taskId'],
    },
    outputSchema: {
        type: 'object',
        properties: {
            id: {
                type: 'string',
                description: 'The ID of the updated task',
            },
            name: {
                type: 'string',
                description: 'The name of the updated task',
            },
            url: {
                type: 'string',
                description: 'The URL of the updated task',
            },
            error: {
                type: 'string',
                description: 'Error message if the task update failed',
            },
        },
    },
    exampleInput: {
        apiKey: 'pk_12345678_ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        taskId: '123456789',
        name: 'Updated Task Name',
        status: 'complete',
        priority: 1,
    },
    exampleOutput: {
        id: '123456789',
        name: 'Updated Task Name',
        url: 'https://app.clickup.com/t/123456789',
    },
    execute: async (input: any) => {
        const {
            apiKey,
            taskId,
            name,
            description,
            markdownDescription,
            assignees,
            status,
            priority,
            dueDate,
            dueDateTime,
            timeEstimate,
            startDate,
            startDateTime,
            notifyAll,
            parent,
            linksTo,
            customFields,
        } = input;

        const client = createClient(apiKey);

        try {
            const response = await client.updateTask(taskId, {
                name,
                description,
                markdown_description: markdownDescription,
                assignees,
                status,
                priority,
                due_date: dueDate,
                due_date_time: dueDateTime,
                time_estimate: timeEstimate,
                start_date: startDate,
                start_date_time: startDateTime,
                notify_all: notifyAll,
                parent,
                links_to: linksTo,
                custom_fields: customFields,
            });

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
