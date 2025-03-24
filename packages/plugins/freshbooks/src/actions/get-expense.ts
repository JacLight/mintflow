import { z } from 'zod';
import { FreshbooksClient } from '../utils/index.js';

export const getExpense = {
  name: 'get_expense',
  displayName: 'Get Expense',
  description: 'Retrieve an expense from Freshbooks by ID',
  inputSchema: {
    type: 'object',
    properties: {
      expenseId: {
        type: 'string',
        description: 'The ID of the expense to retrieve',
        required: true,
      },
    },
    required: ['expenseId'],
  },
  outputSchema: {
    type: 'object',
    properties: {
      expense: {
        type: 'object',
        description: 'The expense data',
      },
    },
  },
  exampleInput: {
    expenseId: '123456',
  },
  exampleOutput: {
    expense: {
      id: 123456,
      staffid: 1,
      categoryid: 4,
      clientid: 5678,
      projectid: 9012,
      date: '2023-01-15',
      amount: {
        amount: '150.00',
        code: 'USD',
      },
      notes: 'Office supplies',
      status: 0,
      billable: true,
      taxName1: 'Tax',
      taxAmount1: 10,
      taxName2: '',
      taxAmount2: 0,
      account_name: 'Expenses',
      vendor: 'Office Depot',
      has_receipt: false,
      include_receipt: false,
      updated: '2023-01-15 12:00:00',
    },
  },
  async execute(input: any, auth: any): Promise<any> {
    try {
      // Validate input
      const expenseIdSchema = z.string().min(1);
      
      try {
        expenseIdSchema.parse(input.expenseId);
      } catch (error) {
        throw new Error(`Invalid input: ${(error as Error).message}`);
      }

      // Create Freshbooks client
      const client = new FreshbooksClient(auth);

      // Get the expense
      const response = await client.getExpense(input.expenseId);

      // Extract expense data from response
      if (!response.response || !response.response.result || !response.response.result.expense) {
        throw new Error('Expense not found or invalid response format');
      }

      return {
        expense: response.response.result.expense,
      };
    } catch (error: any) {
      throw new Error(`Failed to get expense: ${error.message}`);
    }
  },
};
