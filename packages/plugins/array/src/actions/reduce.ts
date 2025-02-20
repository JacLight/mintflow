import { commonSchema } from "../common.js";

export const reduce = {
    ...commonSchema,
    inputSchema: {
        type: "object",
        properties: {
            array: { type: "array" },
            accumulator: {
                type: 'string',
                placeholder: 'Initial accumulator value',
                default: '0',
            },
            field: {
                type: 'string',
                placeholder: 'Field to aggregate',
            },
            operation: {
                type: 'string',
                enum: ['sum', 'product', 'average', 'concat', 'custom'],
                placeholder: 'Aggregation operation to perform',
            },
            separator: {
                type: 'string',
                placeholder: 'Enter separator (e.g., ", ", " - ")',
                rules: [{ operation: 'eq', valueA: 'concat', valueB: '{{operation}}', action: 'show' }],
            },
            customOperation: {
                type: 'string',
                placeholder: 'Enter custom JS function for aggregation',
                rules: [{ operation: 'eq', valueA: 'custom', valueB: '{{operation}}', action: 'show' }],
            },
        },
    },
    name: 'reduce',
    description: 'Reduces an array to a single value',
    execute: async (input: any, config: any) => {
        const { array, accumulator, field, operation, separator, customOperation } = input;
        let result = accumulator;
        switch (operation) {
            case 'sum':
                result = array.reduce((acc: number, current: any) => acc + current[field], parseFloat(accumulator));
                break;
            case 'product':
                result = array.reduce((acc: number, current: any) => acc * current[field], parseFloat(accumulator));
                break;
            case 'average':
                result = array.reduce((acc: number, current: any) => acc + current[field], parseFloat(accumulator)) / array.length;
                break;
            case 'concat':
                result = array.map((item: any) => item[field]).join(separator);
                break;
            case 'custom':
                result = array.reduce((acc: any, current: any) => eval(customOperation), accumulator);
                break;
        }
        return result;
    }
}

export default reduce;