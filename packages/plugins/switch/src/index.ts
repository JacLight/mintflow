import { validateValue } from '@mintflow/common';
import * as objectPath from 'object-path';

const getTemplateValue = (template: string, data: any) => {
    if (!template) return '';

    const templateParts = template.split(' ');
    let result = '';
    for (const part of templateParts) {
        if (part.startsWith('{{') && part.endsWith('}}')) {
            const key = part.slice(2, -2);
            result += data[key] || '';
        } else {
            result += part;
        }
    }
    return result;
};

const switchPlugin = {
    name: "Switch",
    icon: "",
    description: "Description for switch",
    groups: ["utility"],
    tags: ["utility","tool","helper","function","operation"],
    version: '1.0.0',
    id: "switch",
    runner: "node",
    inputSchema: {
        type: "object",
        properties: {
            source: {
                type: 'string',
                enum: ['data', 'flow'],
                group: 'key',
            },
            key: {
                type: 'string',
                group: 'key',
            },
            options: {
                type: 'array',
                showIndex: true,
                items: {
                    layout: 'horizontal',
                    type: 'object',
                    properties: {
                        label: { type: 'string', group: 'option' },
                        operation: { type: 'string', group: 'option' },
                        value: { type: 'string', group: 'option' },
                    },
                },
            },
        },
    },
    outputSchema: { type: "object" },
    method: "exec",
    actions: [
        {
            name: 'switch',
            execute: async (input: any, config: any): Promise<any> => {
                const data = input.data || {};
                const { source, key, options = [] } = config.data;

                let sourceValue;
                if (source === 'flow') {
                    sourceValue = await config.flowContext.get(key);
                } else {
                    sourceValue = objectPath.get(data, key);
                }

                if (sourceValue === undefined) {
                    return data;
                }

                for (let i = 0; i < options.length; i++) {
                    const { operation, value } = options[i];
                    if (!operation || !value) continue;

                    const tValue = await getTemplateValue(value, data);
                    let result
                    try {
                        result = await validateValue(operation, sourceValue, tValue);
                    } catch (e) {
                        console.error(e);
                        result = { valid: false }
                    }
                    if (result.valid && config.callback) {
                        await config.callback({
                            ...config.nodeMessage,
                            message: {
                                ...config.nodeMessage.message,
                                handle: i
                            }
                        });
                    }
                }

                return data;
            }
        }
    ]
};

export default switchPlugin;