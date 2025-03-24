import { createBasecampClient, BasecampConfig } from '../common/client';

export const listProjects = {
  name: 'list-projects',
  displayName: 'List Projects',
  description: 'List all projects in your Basecamp account',
  inputSchema: {
    type: 'object',
    properties: {},
  },
  outputSchema: {
    type: 'object',
    properties: {
      projects: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            name: { type: 'string' },
            description: { type: 'string' },
            created_at: { type: 'string' },
            updated_at: { type: 'string' },
            url: { type: 'string' },
          },
        },
      },
    },
  },
  async execute(input: any, config: { auth: BasecampConfig }) {
    try {
      const client = createBasecampClient(config.auth);
      const projects = await client.listProjects();
      
      return {
        projects,
      };
    } catch (error) {
      console.error('Error listing Basecamp projects:', error);
      throw error;
    }
  },
};
