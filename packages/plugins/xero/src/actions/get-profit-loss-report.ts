import { z } from 'zod';
import { XeroApiClient } from '../utils/index.js';

export const getProfitLossReport = {
  name: 'get_profit_loss_report',
  displayName: 'Get Profit and Loss Report',
  description: 'Generate a profit and loss report from Xero',
  inputSchema: {
    type: 'object',
    properties: {
      fromDate: {
        type: 'string',
        description: 'The start date of the report (YYYY-MM-DD)',
        required: true,
      },
      toDate: {
        type: 'string',
        description: 'The end date of the report (YYYY-MM-DD)',
        required: true,
      },
      periods: {
        type: 'number',
        description: 'The number of periods to compare',
        required: false,
      },
      timeframe: {
        type: 'string',
        description: 'The timeframe for the report',
        enum: ['MONTH', 'QUARTER', 'YEAR'],
        required: false,
      },
      trackingCategoryID: {
        type: 'string',
        description: 'The ID of the tracking category to filter by',
        required: false,
      },
      trackingOptionID: {
        type: 'string',
        description: 'The ID of the tracking option to filter by',
        required: false,
      },
      standardLayout: {
        type: 'boolean',
        description: 'Whether to use the standard layout',
        default: true,
        required: false,
      },
      paymentsOnly: {
        type: 'boolean',
        description: 'Whether to include only payments',
        default: false,
        required: false,
      },
    },
    required: ['fromDate', 'toDate'],
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
    fromDate: '2023-01-01',
    toDate: '2023-12-31',
    periods: 12,
    timeframe: 'MONTH',
    standardLayout: true,
    paymentsOnly: false,
  },
  exampleOutput: {
    report: {
      Reports: [
        {
          ReportID: 'ProfitAndLoss',
          ReportName: 'Profit and Loss',
          ReportType: 'ProfitAndLoss',
          ReportTitles: ['Profit and Loss'],
          ReportDate: '2023-12-31',
          UpdatedDateUTC: '2023-12-31T00:00:00',
          Rows: [
            {
              RowType: 'Header',
              Title: 'Income',
              Cells: [
                {
                  Value: 'Income',
                },
              ],
              Rows: [
                {
                  RowType: 'Row',
                  Cells: [
                    {
                      Value: 'Sales',
                    },
                    {
                      Value: '1000.00',
                    },
                  ],
                },
              ],
            },
            {
              RowType: 'Header',
              Title: 'Expenses',
              Cells: [
                {
                  Value: 'Expenses',
                },
              ],
              Rows: [
                {
                  RowType: 'Row',
                  Cells: [
                    {
                      Value: 'Rent',
                    },
                    {
                      Value: '500.00',
                    },
                  ],
                },
              ],
            },
            {
              RowType: 'Header',
              Title: 'Net Profit',
              Cells: [
                {
                  Value: 'Net Profit',
                },
                {
                  Value: '500.00',
                },
              ],
            },
          ],
        },
      ],
    },
  },
  async execute(input: any, auth: any): Promise<any> {
    try {
      // Validate input
      const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
      const periodsSchema = z.number().positive().optional();
      const timeframeSchema = z.enum(['MONTH', 'QUARTER', 'YEAR']).optional();
      const trackingCategoryIDSchema = z.string().uuid().optional();
      const trackingOptionIDSchema = z.string().uuid().optional();
      const standardLayoutSchema = z.boolean().default(true);
      const paymentsOnlySchema = z.boolean().default(false);
      
      try {
        dateSchema.parse(input.fromDate);
        dateSchema.parse(input.toDate);
        if (input.periods) {
          periodsSchema.parse(input.periods);
        }
        if (input.timeframe) {
          timeframeSchema.parse(input.timeframe);
        }
        if (input.trackingCategoryID) {
          trackingCategoryIDSchema.parse(input.trackingCategoryID);
        }
        if (input.trackingOptionID) {
          trackingOptionIDSchema.parse(input.trackingOptionID);
        }
        if (input.standardLayout !== undefined) {
          standardLayoutSchema.parse(input.standardLayout);
        }
        if (input.paymentsOnly !== undefined) {
          paymentsOnlySchema.parse(input.paymentsOnly);
        }
      } catch (error) {
        throw new Error(`Invalid input: ${(error as Error).message}`);
      }

      // Create Xero client
      const client = new XeroApiClient(auth);
      
      // Initialize the client with the refresh token
      await client.initialize(auth.refreshToken);

      // Get the report
      const response = await client.getReport('ProfitAndLoss', {
        fromDate: input.fromDate,
        toDate: input.toDate,
        periods: input.periods,
        timeframe: input.timeframe,
        trackingCategoryID: input.trackingCategoryID,
        trackingCategoryID2: undefined,
        trackingOptionID: input.trackingOptionID,
        trackingOptionID2: undefined,
        standardLayout: input.standardLayout !== undefined ? input.standardLayout : true,
        paymentsOnly: input.paymentsOnly !== undefined ? input.paymentsOnly : false,
      });

      return {
        report: response,
      };
    } catch (error: any) {
      throw new Error(`Failed to get profit and loss report: ${error.message}`);
    }
  },
};
