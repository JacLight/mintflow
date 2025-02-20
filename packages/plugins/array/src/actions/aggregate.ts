import { commonSchema } from "../common.js";

export const aggregate = {
    name: 'aggregate',
    ...commonSchema,
    inputSchema: {
        type: 'object',
        field1: {
            type: 'string',
            displayStyle: 'outlined',
            displaySize: 'small',
            group: 'sortA',
        },
        direction1: {
            type: 'string',
            displayStyle: 'outlined',
            displaySize: 'small',
            group: 'sortA',
            enum: ['asc', 'desc'],
        },
        field2: {
            type: 'string',
            displayStyle: 'outlined',
            displaySize: 'small',
            group: 'sortB',
        },
        direction2: {
            type: 'string',
            displayStyle: 'outlined',
            displaySize: 'small',
            group: 'sortB',
            enum: ['asc', 'desc'],
        },
    },
    description: 'Sorts an array of numbers in ascending or descending order',
    execute: async (input: any, config: any) => {
        const sortArrayByField = (array: any, field: string, direction: string) => {
            const hasField = array?.any((item: any) => item[field]);
            if (hasField) {
                return array.sort((a: any, b: any) => direction === 'asc' ? a[field] - b[field] : b[field] - a[field]);
            } else {
                return array.sort((a: any, b: any) => direction === 'asc' ? a - b : b - a);
            }
        }
        let result = input.array;
        if (input.field2) {
            result = sortArrayByField(result, input.field2, input.direction2)
        }
        return sortArrayByField(result, input.field1, input.direction1)
    }
};

export default aggregate;