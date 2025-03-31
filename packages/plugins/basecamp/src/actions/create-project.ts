import { createBasecampClient, BasecampConfig } from "src/common/client.js";

export interface CreateProjectProps {
  name: string;
  description?: string;
}

export const createProject = {
  name: 'create-project',
  displayName: 'Create Project',
  description: 'Create a new project in Basecamp',
  inputSchema: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'The name of the project',
        required: true,
      },
      description: {
        type: 'string',
        description: 'The description of the project',
        required: false,
      },
    },
  },
  outputSchema: {
    type: 'object',
    properties: {
      project: {
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
  async execute(input: CreateProjectProps, config: { auth: BasecampConfig }) {
    try {
      const client = createBasecampClient(config.auth);
      const project = await client.createProject(input.name, input.description);

      return {
        project,
      };
    } catch (error) {
      console.error('Error creating Basecamp project:', error);
      throw error;
    }
  },
};
