import { createClient } from '../../common/index.js';

export const createTaskAction = {
    name: 'create_task',
    description: 'Create a new task in a ClickUp list',
    inputSchema: {
        type: 'object',
        properties: {
            apiKey: {
                type: 'string',
                description: 'ClickUp API Key',
            },
            listId: {
                type: 'string',
                description: 'The ID of the list to create the task in',
            },
            name: {
                type: 'string',
                description: 'The name of the task',
            },
            description: {
                type: 'string',
                description: 'The description of the task',
            },
            markdownDescription: {
                type: 'string',
                description: 'The description of the task in markdown format',
            },
            assignees: {
                type: 'array',
                description: 'The IDs of the users to assign to the task',
                items: {
                    type: 'number',
                },
            },
            tags: {
                type: 'array',
                description: 'The tags to add to the task',
                items: {
                    type: 'string',
                },
            },
            status: {
                type: 'string',
                description: 'The status of the task',
            },
            priority: {
                type: 'number',
                description: 'The priority of the task (1=Urgent, 2=High, 3=Normal, 4=Low)',
                enum: [1, 2, 3, 4],
            },
            dueDate: {
                type: 'number',
                description: 'The due date of the task (Unix timestamp in milliseconds)',
            },
            dueDateTime: {
                type: 'boolean',
                description: 'Whether the due date includes a time',
            },
            timeEstimate: {
                type: 'number',
                description: 'The time estimate of the task in milliseconds',
            },
            startDate: {
                type: 'number',
                description: 'The start date of the task (Unix timestamp in milliseconds)',
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
                description: 'The custom fields to set on the task',
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
        required: ['apiKey', 'listId', 'name'],
    },
    outputSchema: {
        type: 'object',
        properties: {
            id: {
                type: 'string',
                description: 'The ID of the created task',
            },
            name: {
                type: 'string',
                description: 'The name of the created task',
            },
            url: {
                type: 'string',
                description: 'The URL of the created task',
            },
            error: {
                type: 'string',
                description: 'Error message if the task creation failed',
            },
        },
    },
    exampleInput: {
        apiKey: 'pk_12345678_ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        listId: '123456789',
        name: 'New Task',
        description: 'This is a new task created via the API',
        assignees: [12345678],
        status: 'in progress',
        priority: 2,
    },
    exampleOutput: {
        id: '123456789',
        name: 'New Task',
        url: 'https://app.clickup.com/t/123456789',
    },
    execute: async (input: any) => {
        const {
            apiKey,
            listId,
            name,
            description,
            markdownDescription,
            assignees,
            tags,
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
            const response = await client.createTask(listId, {
                name,
                description,
                markdown_description: markdownDescription,
                assignees,
                tags,
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
