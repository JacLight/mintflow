import { ruleOperations, validateValue } from "@mintflow/common";
import * as objectPath from 'object-path';


const getTemplateValue = (template: string, data: any) => {
    const templateParts = template.split(' ');
    let result = '';
    for (const part of templateParts) {
        if (part.startsWith('{{') && part.endsWith('}}')) {
            const key = part.slice(2, -2);
            result += data[key];
        } else {
            result += part;
        }
    }
    return result;
}


const switchPlugin = {
    name: "Switch",
    icon: "",
    description: "Description for switch",
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
                        label: {
                            type: 'string',
                            group: 'option',
                        },
                        operation: {
                            type: 'string',
                            enum: Object.keys(ruleOperations).filter(name => name !== 'required'),
                            styleClass: 'mintflow-select',
                            displayStyle: 'outlined',
                            displaySize: 'small',
                            group: 'option',
                        },
                        value: {
                            type: 'string',
                            title: ' ',
                            displayStyle: 'outlined',
                            displaySize: 'small',
                            rules: [{ operation: 'in', valueA: ['true', 'false', 'falsy', 'truthy', 'empty', 'not-empty'], valueB: '{{operation}}', action: 'hide' }],
                            group: 'option',
                        },
                    },
                },
            },
        },
    },
    outputSchema: {
        type: "object",
    },
    exampleInput: {

    },
    exampleOutput: {
    },
    documentation: "https://yourdocs.com/switch",
    method: "exec",
    actions: [
        {
            name: 'switch',
            execute: async (input: any, config: any): Promise<any> => {
                const data: any = {};
                const { source, key } = config.data;


                let sourceValue;
                if (source === 'flow') {
                    sourceValue = await config.flowContext.get(key)
                } else {
                    sourceValue = objectPath.get(data, key)
                }

                let validHandles = [];
                let count = 0;
                for (const option of config.data.options) {
                    const { operation, value } = option;
                    const tValue = await getTemplateValue(value, data);
                    let result = validateValue(operation, sourceValue, tValue)
                    if (result.valid) {
                        if (config.callback) {
                            const nodeMessage = {
                                ...config.nodeMessage,
                                message: {
                                    ...config.nodeMessage.message,
                                    handle: count
                                }
                            }
                            await config.callback(nodeMessage)
                        }
                        validHandles.push(count)
                    }
                    count++
                }

                return data;
            }
        }
    ]
};

export default switchPlugin;