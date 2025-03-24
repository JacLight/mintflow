import { z } from 'zod';
import { FreshbooksClient } from '../utils/index.js';

export const getTimeEntry = {
  name: 'get_time_entry',
  displayName: 'Get Time Entry',
  description: 'Retrieve a time entry from Freshbooks by ID',
  inputSchema: {
    type: 'object',
    properties: {
      timeEntryId: {
        type: 'string',
        description: 'The ID of the time entry to retrieve',
        required: true,
      },
    },
    required: ['timeEntryId'],
  },
  outputSchema: {
    type: 'object',
    properties: {
      timeEntry: {
        type: 'object',
        description: 'The time entry data',
      },
    },
  },
  exampleInput: {
    timeEntryId: '123456',
  },
  exampleOutput: {
    timeEntry: {
      id: 123456,
      business_id: 7890,
      project_id: 1234,
      client_id: 5678,
      service_id: 9012,
      staff_id: 3456,
      started_at: '2023-01-15T09:00:00Z',
      duration: 3600,
      note: 'Working on project documentation',
      billable: true,
      active: true,
      internal: false,
      created_at: '2023-01-15T09:00:00Z',
      updated_at: '2023-01-15T10:00:00Z',
    },
  },
  async execute(input: any, auth: any): Promise<any> {
    try {
      // Validate input
      const timeEntryIdSchema = z.string().min(1);
      
      try {
        timeEntryIdSchema.parse(input.timeEntryId);
      } catch (error) {
        throw new Error(`Invalid input: ${(error as Error).message}`);
      }

      // Create Freshbooks client
      const client = new FreshbooksClient(auth);

      // Get the time entry
      const response = await client.getTimeEntry(input.timeEntryId);

      // Extract time entry data from response
      if (!response.time_entry) {
        throw new Error('Time entry not found or invalid response format');
      }

      return {
        timeEntry: response.time_entry,
      };
    } catch (error: any) {
      throw new Error(`Failed to get time entry: ${error.message}`);
    }
  },
};
