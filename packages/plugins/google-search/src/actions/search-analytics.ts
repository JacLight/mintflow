import { createAuthClient, commonSchema, googleSearchUtils } from '../common.js';

interface SearchAnalyticsFilter {
    dimension: string;
    operator: string;
    expression: string;
}

export const searchAnalytics = {
    name: 'search_analytics',
    displayName: 'Search Analytics',
    ...commonSchema,
    inputSchema: {
        type: 'object',
        properties: {
            auth: {
                type: 'object',
                properties: {
                    access_token: { type: 'string' }
                },
                required: ['access_token']
            },
            siteUrl: {
                type: 'string',
                description: 'The URL of the site to query data for'
            },
            startDate: {
                type: 'string',
                description: 'The start date of the date range to query (in YYYY-MM-DD format)'
            },
            endDate: {
                type: 'string',
                description: 'The end date of the date range to query (in YYYY-MM-DD format)'
            },
            dimensions: {
                type: 'array',
                items: { type: 'string' },
                description: 'The dimensions to group results by (e.g., query, page, country, device, searchAppearance, date)'
            },
            filters: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        dimension: { type: 'string' },
                        operator: { type: 'string' },
                        expression: { type: 'string' }
                    }
                },
                description: 'Optional filters to apply to the data'
            },
            aggregationType: {
                type: 'string',
                description: 'How data is aggregated (auto, byPage, byProperty)'
            },
            rowLimit: {
                type: 'number',
                description: 'The maximum number of rows to return'
            },
            startRow: {
                type: 'number',
                description: 'The first row to return (for pagination)'
            }
        },
        required: ['auth', 'siteUrl', 'startDate', 'endDate']
    },
    outputSchema: {
        type: 'object',
        properties: {
            rows: { type: 'array' },
            responseAggregationType: { type: 'string' }
        }
    },
    exampleInput: {
        auth: {
            access_token: 'ya29.a0AfB_byC...'
        },
        siteUrl: 'https://example.com',
        startDate: '2023-01-01',
        endDate: '2023-01-31',
        dimensions: ['query', 'page', 'country'],
        filters: [
            {
                dimension: 'country',
                operator: 'equals',
                expression: 'usa'
            }
        ],
        rowLimit: 100
    },
    exampleOutput: {
        rows: [
            {
                keys: ['search term', 'https://example.com/page', 'usa'],
                clicks: 150,
                impressions: 2500,
                ctr: 0.06,
                position: 12.5
            }
        ],
        responseAggregationType: 'byPage'
    },
    execute: async (input: any, context: any) => {
        try {
            const { 
                auth, 
                siteUrl, 
                startDate, 
                endDate, 
                dimensions, 
                filters, 
                aggregationType, 
                rowLimit, 
                startRow 
            } = input;

            if (!googleSearchUtils.validateToken(auth.access_token)) {
                throw new Error('Invalid or missing access token');
            }

            const webmasters = createAuthClient(auth.access_token);
            
            // Format dates to YYYY-MM-DD
            const formattedStartDate = new Date(startDate).toISOString().split('T')[0];
            const formattedEndDate = new Date(endDate).toISOString().split('T')[0];
            
            // Prepare request body
            const requestBody: Record<string, any> = {
                startDate: formattedStartDate,
                endDate: formattedEndDate
            };
            
            // Add optional parameters if provided
            if (dimensions && dimensions.length > 0) {
                requestBody.dimensions = dimensions;
            }
            
            if (filters && filters.length > 0) {
                requestBody.dimensionFilterGroups = filters.map((filter: SearchAnalyticsFilter) => ({
                    filters: [{
                        dimension: filter.dimension,
                        operator: filter.operator,
                        expression: filter.expression
                    }]
                }));
            }
            
            if (aggregationType) {
                requestBody.aggregationType = aggregationType;
            }
            
            if (rowLimit) {
                requestBody.rowLimit = rowLimit;
            }
            
            if (startRow) {
                requestBody.startRow = startRow;
            }
            
            // Make API request
            const response = await webmasters.searchanalytics.query({
                siteUrl: siteUrl,
                requestBody: requestBody
            });
            
            return response.data;
        } catch (error: unknown) {
            return googleSearchUtils.handleApiError(error);
        }
    }
};
