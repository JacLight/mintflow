import { commonSchema, googleApiUrls, googleWorkspaceUtils } from '../../common.js';
import axios from 'axios';

export const createTask = {
    name: 'create_task',
    displayName: 'Create Google Task',
    ...commonSchema,
    inputSchema: {
        type: "object",
        required: ["auth", "title"],
        properties: {
            auth: {
                type: "object",
                required: ["access_token"],
                properties: {
                    access_token: {
                        type: "string",
                        description: "OAuth2 access token with Google Tasks permissions"
                    }
                }
            },
            title: {
                type: "string",
                description: "Title of the task"
            },
            notes: {
                type: "string",
                description: "Notes or description for the task"
            },
            due: {
                type: "string",
                description: "Due date for the task (RFC 3339 timestamp, e.g., '2023-12-31T23:59:59Z')"
            },
            taskListId: {
                type: "string",
                description: "ID of the task list to create the task in (defaults to '@default')",
                default: "@default"
            },
            parent: {
                type: "string",
                description: "Parent task ID (for creating subtasks)"
            },
            previous: {
                type: "string",
                description: "Previous task ID (for ordering tasks)"
            },
            status: {
                type: "string",
                enum: ["needsAction", "completed"],
                description: "Status of the task",
                default: "needsAction"
            },
            completed: {
                type: "string",
                description: "Completion date of the task (RFC 3339 timestamp, only if status is 'completed')"
            }
        }
    },
    outputSchema: {
        type: "object",
        properties: {
            id: {
                type: "string",
                description: "ID of the created task"
            },
            title: {
                type: "string",
                description: "Title of the task"
            },
            status: {
                type: "string",
                description: "Status of the task"
            },
            due: {
                type: "string",
                description: "Due date of the task"
            },
            notes: {
                type: "string",
                description: "Notes for the task"
            },
            taskListId: {
                type: "string",
                description: "ID of the task list"
            },
            selfLink: {
                type: "string",
                description: "URL to access the task"
            }
        }
    },
    exampleInput: {
        auth: {
            access_token: 'ya29.a0AfB_byC...'
        },
        title: 'Complete project proposal',
        notes: 'Include budget estimates and timeline',
        due: '2023-12-31T23:59:59Z',
        taskListId: '@default'
    },
    exampleOutput: {
        id: 'MDEwOVRhc2s5MjQ5Njg4OTgzODU2OTgzNjgxOjA6MTQwNzM3',
        title: 'Complete project proposal',
        status: 'needsAction',
        due: '2023-12-31T23:59:59.000Z',
        notes: 'Include budget estimates and timeline',
        taskListId: 'MDEwOFRhc2tMaXN0OTI0OTY4ODk4Mzg1Njk4MzY4MTow',
        selfLink: 'https://www.googleapis.com/tasks/v1/lists/@default/tasks/MDEwOVRhc2s5MjQ5Njg4OTgzODU2OTgzNjgxOjA6MTQwNzM3'
    },
    execute: async (input: any, context: any) => {
        try {
            const {
                auth,
                title,
                notes,
                due,
                taskListId = '@default',
                parent,
                previous,
                status = 'needsAction',
                completed
            } = input;

            if (!googleWorkspaceUtils.validateToken(auth.access_token)) {
                throw new Error('Invalid or missing access token');
            }

            // Prepare task data
            const taskData: any = {
                title,
                status
            };

            if (notes) taskData.notes = notes;
            if (due) taskData.due = due;
            if (parent) taskData.parent = parent;
            if (previous) taskData.previous = previous;

            // Only include completed if status is 'completed'
            if (status === 'completed' && completed) {
                taskData.completed = completed;
            }

            // Create the task
            const response = await axios.post(
                `${googleApiUrls.tasks}/lists/${taskListId}/tasks`,
                taskData,
                {
                    headers: {
                        'Authorization': `Bearer ${auth.access_token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const task = response.data;

            return {
                id: task.id,
                title: task.title,
                status: task.status,
                due: task.due,
                notes: task.notes,
                taskListId: taskListId,
                selfLink: task.selfLink
            };
        } catch (error: any) {
            return googleWorkspaceUtils.handleApiError(error);
        }
    }
};
