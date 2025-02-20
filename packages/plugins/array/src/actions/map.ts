import { ActionDescriptor, isEmpty } from "@mintflow/common";
import { commonSchema } from "../common.js";

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

        if (isEmpty(array) || !Array.isArray(array)) {
            return [];
        }

        if (isEmpty(mappings) || !Array.isArray(mappings)) {
            return array;
        }

        const applyPattern = (row: any, pattern: string) => {
            return pattern.replace(/{{(.*?)}}/g, (_, expr) => {
                const func = new Function('row', `return ${expr}`);
                return func(row);
            });
        };

        const result = array.slice(0, limit).map((item: any) => {
            const newItem: any = {};
            mappings.forEach((mapping: any) => {
                if (mapping.pattern.startsWith('{{') && mapping.pattern.endsWith('}}')) {
                    newItem[mapping.newField] = applyPattern(item, mapping.pattern);
                } else {
                    newItem[mapping.newField] = item[mapping.pattern];
                }
            });
            return newItem;
        });

        return result;
    }
};
export default map;