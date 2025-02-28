import { isEmpty } from "@mintflow/common";
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
        },
    },
    description: 'Aggregates an array of objects based on specified fields and operations',
    execute: async (input: any, config: any) => {
        const groupByFields = input.groupBy; // e.g., ['a']
        const aggregations = input.aggregations; // e.g., [{ field: 'b', operation: 'sum', alias: 'total' }]
        const pivotConfig = input.pivot;

        if (isEmpty(groupByFields) || isEmpty(aggregations)) {
            throw new Error('groupBy and aggregations are required');
        }

        if (!Array.isArray(groupByFields) || !Array.isArray(aggregations)) {
            throw new Error('groupBy and aggregations must be arrays');
        }

        // Helper: group an array by an array of keys
        const groupBy = (array: any[], keys: string[]) => {
            return array?.reduce((result, item) => {
                const key = keys.map(k => item[k]).join('|');
                if (!result[key]) {
                    result[key] = [];
                }
                result[key].push(item);
                return result;
            }, {} as Record<string, any[]>);
        };

        // Helper: aggregate a group of items using the given aggregations.
        const aggregateGroup = (group: any[], aggregations: any[]) => {
            return aggregations?.reduce((result, agg) => {
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
                    // Create a function that receives the group array.
                    case 'custom':
                        const customOp = customOperation.trim();
                        const opCode = customOp.startsWith('return') ? customOp : 'return ' + customOp;
                        result[outputField] = new Function('group', opCode)(group);
                        break;
                    default:
                        throw new Error(`Unsupported aggregation operation: ${operation}`);
                }

                return result;
            }, {} as Record<string, any>);
        };

        let aggregatedData: any[];

        // If pivot config exists, ignore the groupBy provided and group by pivotField from raw data.
        if (pivotConfig) {
            const pivotField = pivotConfig.pivotField;
            const pivotGroups = groupBy(input.array, [pivotField]);
            aggregatedData = Object.values(pivotGroups).map((group: any) => {
                const aggResult = aggregateGroup(group, aggregations);
                // Merge the pivot field value (taken from the first item)
                aggResult[pivotField] = group[0][pivotField];
                return aggResult;
            });
        } else {
            // Regular aggregation using the specified groupBy fields.
            const groupedData = groupBy(input.array, groupByFields);
            aggregatedData = Object.values(groupedData).map((group: any) => {
                const aggResult = aggregateGroup(group, aggregations);
                // Merge each groupBy field from the first item of the group into the result
                groupByFields.forEach((key: any) => {
                    aggResult[key] = group[0][key];
                });
                return aggResult;
            });
        }

        return aggregatedData;
    }
};

export default aggregate;
