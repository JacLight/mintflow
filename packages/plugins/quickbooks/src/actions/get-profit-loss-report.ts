import { z } from 'zod';
import { QuickBooksClient } from '../utils/index.js';

export const getProfitLossReport = {
  name: 'get_profit_loss_report',
  displayName: 'Get Profit and Loss Report',
  description: 'Generate a profit and loss report from QuickBooks',
  inputSchema: {
    type: 'object',
    properties: {
      startDate: {
        type: 'string',
        description: 'The start date of the report (YYYY-MM-DD)',
        required: true,
      },
      endDate: {
        type: 'string',
        description: 'The end date of the report (YYYY-MM-DD)',
        required: true,
      },
      accountingMethod: {
        type: 'string',
        description: 'The accounting method to use for the report',
        enum: ['Accrual', 'Cash'],
        default: 'Accrual',
        required: false,
      },
      summarizeColumnsBy: {
        type: 'string',
        description: 'How to summarize columns in the report',
        enum: ['Total', 'Month', 'Quarter', 'Year'],
        default: 'Total',
        required: false,
      },
    },
    required: ['startDate', 'endDate'],
  },
  outputSchema: {
    type: 'object',
    properties: {
      report: {
        type: 'object',
        description: 'The profit and loss report data',
      },
    },
  },
  exampleInput: {
    startDate: '2023-01-01',
    endDate: '2023-12-31',
    accountingMethod: 'Accrual',
    summarizeColumnsBy: 'Month',
  },
  exampleOutput: {
    report: {
      Header: {
        ReportName: 'Profit and Loss',
        Time: '2023-01-01T00:00:00 - 2023-12-31T23:59:59',
        ReportBasis: 'Accrual',
      },
      Columns: {
        Column: [
          {
            ColTitle: 'Jan 2023',
            ColType: 'Money',
          },
          {
            ColTitle: 'Feb 2023',
            ColType: 'Money',
          },
        ],
      },
      Rows: {
        Row: [
          {
            Header: {
              ColData: [
                {
                  value: 'Income',
                },
              ],
            },
            Rows: {
              Row: [
                {
                  ColData: [
                    {
                      value: 'Sales',
                    },
                    {
                      value: '1000.00',
                    },
                    {
                      value: '1200.00',
                    },
                  ],
                },
              ],
            },
            Summary: {
              ColData: [
                {
                  value: 'Total Income',
                },
                {
                  value: '1000.00',
                },
                {
                  value: '1200.00',
                },
              ],
            },
          },
        ],
      },
    },
  },
  async execute(input: any, auth: any): Promise<any> {
    try {
      // Validate input
      const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
      const accountingMethodSchema = z.enum(['Accrual', 'Cash']).default('Accrual');
      const summarizeColumnsBySchema = z.enum(['Total', 'Month', 'Quarter', 'Year']).default('Total');
      
      try {
        dateSchema.parse(input.startDate);
        dateSchema.parse(input.endDate);
        if (input.accountingMethod) {
          accountingMethodSchema.parse(input.accountingMethod);
        }
        if (input.summarizeColumnsBy) {
          summarizeColumnsBySchema.parse(input.summarizeColumnsBy);
        }
      } catch (error) {
        throw new Error(`Invalid input: ${(error as Error).message}`);
      }

      // Create QuickBooks client
      const client = new QuickBooksClient(auth);

      // Make the API request
      const response = await client.makeRequest(
        auth,
        'GET',
        'reports/ProfitAndLoss',
        undefined,
        {
          start_date: input.startDate,
          end_date: input.endDate,
          accounting_method: input.accountingMethod || 'Accrual',
          summarize_column_by: input.summarizeColumnsBy || 'Total',
          minorversion: 65,
        }
      );

      return {
        report: response,
      };
    } catch (error: any) {
      throw new Error(`Failed to get profit and loss report: ${error.message}`);
    }
  },
};
