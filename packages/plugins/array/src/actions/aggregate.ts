import { commonSchema } from "../common.js";

export const aggregate = {
    name: 'aggregate',
    ...commonSchema,
    inputSchema: {
        type: 'object',
        properties: {
            groupBy: {
                type: 'array',
                description: 'Fields to group by',
                items: {
                    type: 'string',
                    placeholder: 'Enter field name (e.g., category, region)',
                },
            },
            aggregations: {
                type: 'array',
                description: 'Fields to aggregate and their operations',
                items: {
                    type: 'object',
                    properties: {
                        field: {
                            type: 'string',
                            placeholder: 'Field to aggregate',
                        },
                        operation: {
                            type: 'string',
                            enum: ['sum', 'average', 'count', 'min', 'max', 'custom'],
                            placeholder: 'Aggregation operation',
                        },
                        customOperation: {
                            type: 'string',
                            placeholder: 'Enter custom JavaScript function',
                            rules: [{ operation: 'eq', valueA: 'custom', valueB: '{{operation}}', action: 'show' }],
                        },
                        alias: {
                            type: 'string',
                            placeholder: 'Name of the aggregated field in the output',
                        },
                    },
                },
            },
            pivot: {
                type: 'object',
                description: 'Pivoting configuration (optional)',
                properties: {
                    pivotField: {
                        type: 'string',
                        placeholder: 'Field to pivot (e.g., year, month)',
                    },
                    valueField: {
                        type: 'string',
                        placeholder: 'Field to use as value in pivot (e.g., sales)',
                    },
                },
            },
        }
    },
    description: 'Aggregates an array of objects based on specified fields and operations',
    execute: async (input: any, config: any) => {
        const groupByFields = input.groupBy;
        const aggregations = input.aggregations;
        const pivotConfig = input.pivot;

        const groupBy = (array: any[], keys: string[]) => {
            return array.reduce((result, item) => {
                const key = keys.map(k => item[k]).join('|');
                if (!result[key]) {
                    result[key] = [];
                }
                result[key].push(item);
                return result;
            }, {});
        };

        const aggregateGroup = (group: any[], aggregations: any[]) => {
            return aggregations.reduce((result, agg) => {
                const { field, operation, customOperation, alias } = agg;
                const outputField = alias || field;

                switch (operation) {
                    case 'sum':
                        result[outputField] = group.reduce((sum, item) => sum + item[field], 0);
                        break;
                    case 'average':
                        result[outputField] = group.reduce((sum, item) => sum + item[field], 0) / group.length;
                        break;
                    case 'count':
                        result[outputField] = group.length;
                        break;
                    case 'min':
                        result[outputField] = Math.min(...group.map(item => item[field]));
                        break;
                    case 'max':
                        result[outputField] = Math.max(...group.map(item => item[field]));
                        break;
                    case 'custom':
                        result[outputField] = new Function('group', customOperation)(group);
                        break;
                    default:
                        throw new Error(`Unsupported aggregation operation: ${operation}`);
                }

                return result;
            }, {});
        };

        const pivotData = (data: any[], pivotField: string, valueField: string) => {
            const pivoted: any = {};
            data.forEach(item => {
                const pivotKey = item[pivotField];
                if (!pivoted[pivotKey]) {
                    pivoted[pivotKey] = {};
                }
                pivoted[pivotKey][valueField] = item[valueField];
            });
            return Object.keys(pivoted).map(key => ({ [pivotField]: key, ...pivoted[key] }));
        };

        const groupedData = groupBy(input.array, groupByFields);
        let aggregatedData = Object.values(groupedData).map((group: any) => aggregateGroup(group, aggregations));

        if (pivotConfig) {
            aggregatedData = pivotData(aggregatedData, pivotConfig.pivotField, pivotConfig.valueField);
        }

        return aggregatedData;
    }
};

export default aggregate;