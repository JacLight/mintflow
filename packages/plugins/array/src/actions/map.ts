import { ActionDescriptor } from "@mintflow/common";
import { commonSchema } from "src/index.js";

export const map: ActionDescriptor = {
    name: 'map',
    ...commonSchema,
    inputSchema: {
        type: "object",
        properties: {
            array: { type: "array" },
            max: {
                type: 'number',
                placeholder: 'Maximum number of items to map',
                group: 'max',
            },
            mappings: {
                type: 'array',
                items: {
                    type: 'object',
                    layout: 'horizontal',
                    properties: {
                        newField: {
                            type: 'string',
                            placeholder: 'The name of the new field',
                            group: 'map',
                        },
                        pattern: {
                            type: 'string',
                            placeholder: 'Enter custom JS template pattern {{fieldA - fieldB}} or {{fieldA.toUpperCase()}}',
                            rules: [{ operation: 'eq', valueA: 'custom', valueB: '{{transform}}', action: 'show' }],
                            group: 'map',
                        },
                    },
                },
            },
        },
    },
    description: 'Maps an array of numbers using a custom JS function',
    execute: async (input: any, config: any) => {
        const { array, name, max, mappings } = input;
        const limit = max === 0 ? array.length : max;

        const applyPattern = (item: any, pattern: string) => {
            return pattern.replace(/{{(.*?)}}/g, (_, expr) => {
                const func = new Function('item', `return ${expr}`);
                return func(item);
            });
        };

        const result = array.slice(0, limit).map((item: any) => {
            const newItem: any = { ...item };
            mappings.forEach((mapping: any) => {
                newItem[mapping.newField] = applyPattern(item, mapping.pattern);
            });
            return newItem;
        });

        return result;
    }
};
export default map;