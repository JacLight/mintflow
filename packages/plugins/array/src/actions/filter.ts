import { commonSchema } from "src/index.js";
import { ActionDescriptor, PluginDescriptor, ruleOperations } from '@mintflow/common';

interface Filter {
    source: 'data' | 'flow';
    field: string;
    operation: string;
    value: string;
}

interface Input {
    array: any[];
    join: 'or' | 'and';
    max?: number;
    filters: Filter[];
}

export const filter: ActionDescriptor = {
    outputSchema: {
        type: 'array',
        items: { type: 'any' }
    },
    exampleOutput: [],
    name: 'sort',
    ...commonSchema,
    inputSchema: {
        type: 'object',
        properties: {
            array: { type: "array" },
            join: {
                type: 'string',
                enum: ['or', 'and'],
                group: 'max',
            },
            max: {
                type: 'number',
                group: 'max',
            },
            filters: {
                type: 'array',
                layout: 'horizontal',
                showIndex: true,
                items: {
                    type: 'object',
                    layout: 'horizontal',
                    properties: {
                        source: {
                            type: 'string',
                            enum: ['data', 'flow'],
                            group: 'filter',
                        },
                        field: {
                            type: 'string',
                            displayStyle: 'outlined',
                            group: 'filter',
                        },
                        operation: {
                            type: 'string',
                            enum: Object.keys(ruleOperations).filter(name => name !== 'required'),
                            group: 'filter',
                        },
                        value: {
                            type: 'string',
                            rules: [{ operation: 'in', valueA: ['true', 'false', 'falsy', 'truthy', 'empty', 'not-empty'], valueB: '{{operator}}', action: 'hide' }],
                            group: 'filter',
                        },
                    },
                },
            }
        },
        description: 'Sorts an array of numbers in ascending or descending order',
        execute: async (input: Input, config: any) => {
            const { array, filters, join, max } = input;

            // Apply filters
            let filteredArray = array.filter(item => {
                if (join === 'and') {
                    return filters.every(filter => {
                        const { field, operation, value } = filter;
                        const fieldValue = item[field];
                        const ruleOperation: any = ruleOperations[operation];
                        return ruleOperation(fieldValue, value);
                    });
                } else {
                    return filters.some(filter => {
                        const { field, operation, value } = filter;
                        const fieldValue = item[field];
                        const ruleOperation: any = ruleOperations[operation];
                        return ruleOperation(fieldValue, value);
                    });
                }
            });

            // If max is not set or 0, return all elements found
            if (!max || max === 0) {
                return filteredArray;
            }

            // Return up to max elements
            return filteredArray.slice(0, max);
        }
    }
};

export default filter;