import { createBasecampClient, BasecampConfig } from '../common/client';

export interface CreateTodoItemProps {
  projectId: string;
  todoListId: string;
  content: string;
  description?: string;
  assigneeIds?: string[];
  dueOn?: string;
}

export const createTodoItem = {
  name: 'create-todo-item',
  displayName: 'Create To-do Item',
  description: 'Create a new to-do item in a Basecamp to-do list',
  inputSchema: {
    type: 'object',
    properties: {
      projectId: {
        type: 'string',
        description: 'The ID of the project',
        required: true,
      },
      todoListId: {
        type: 'string',
        description: 'The ID of the to-do list',
        required: true,
      },
      content: {
        type: 'string',
        description: 'The content of the to-do item',
        required: true,
      },
      description: {
        type: 'string',
        description: 'The description of the to-do item',
        required: false,
      },
      assigneeIds: {
        type: 'array',
        description: 'The IDs of the people to assign to the to-do item',
        items: {
          type: 'string',
        },
        required: false,
      },
      dueOn: {
        type: 'string',
        description: 'The due date of the to-do item (YYYY-MM-DD)',
        required: false,
      },
    },
  },
  outputSchema: {
    type: 'object',
    properties: {
      todoItem: {
        type: 'object',
        properties: {
          id: { type: 'number' },
          content: { type: 'string' },
          description: { type: 'string' },
          created_at: { type: 'string' },
          updated_at: { type: 'string' },
          due_on: { type: 'string' },
          url: { type: 'string' },
        },
      },
    },
  },
  async execute(input: CreateTodoItemProps, config: { auth: BasecampConfig }) {
    try {
      const client = createBasecampClient(config.auth);
      const todoItem = await client.createTodoItem(
        input.projectId,
        input.todoListId,
        input.content,
        input.description,
        input.assigneeIds,
        input.dueOn
      );
      
      return {
        todoItem,
      };
    } catch (error) {
      console.error('Error creating Basecamp to-do item:', error);
      throw error;
    }
  },
};
