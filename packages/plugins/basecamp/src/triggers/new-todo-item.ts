import { createBasecampClient, BasecampConfig } from '../common/client';

export interface NewTodoItemTriggerProps {
  projectId: string;
  todoListId: string;
  webhookUrl: string;
}

export const newTodoItem = {
  name: 'new-todo-item',
  displayName: 'New To-do Item',
  description: 'Triggered when a new to-do item is created in a Basecamp to-do list',
  type: 'webhook',
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
      webhookUrl: {
        type: 'string',
        description: 'The URL to send webhook events to',
        required: true,
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
      creator: {
        type: 'object',
        properties: {
          id: { type: 'number' },
          name: { type: 'string' },
          email_address: { type: 'string' },
        },
      },
    },
  },
  async onEnable(input: NewTodoItemTriggerProps, config: { auth: BasecampConfig }) {
    try {
      const client = createBasecampClient(config.auth);
      
      // Create a webhook for the to-do list
      const webhook = await client.createWebhook({
        active: true,
        url: input.webhookUrl,
        types: ['Todo::Create'],
      });
      
      return {
        webhookId: webhook.id,
      };
    } catch (error) {
      console.error('Error creating Basecamp webhook for new to-do items:', error);
      throw error;
    }
  },
  async onDisable(context: { webhookId: string }, config: { auth: BasecampConfig }) {
    try {
      const client = createBasecampClient(config.auth);
      
      // Delete the webhook
      await client.deleteWebhook(context.webhookId);
      
      return {
        success: true,
      };
    } catch (error) {
      console.error('Error deleting Basecamp webhook for new to-do items:', error);
      throw error;
    }
  },
  async run(event: any) {
    // Basecamp webhook payload for new to-do items
    const todoItem = event.recording;
    const creator = event.creator;
    
    return {
      todoItem,
      creator,
    };
  },
};
