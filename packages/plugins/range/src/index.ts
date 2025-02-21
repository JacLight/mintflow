
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

const rangePlugin = {
    name: "Range",
    icon: "",
    description: "Description for range",
    id: "range",
    runner: "node",
    inputSchema: {
        type: "object",
        properties: {
            ignoreUndefined: {
                type: 'boolean',
            },
            options: {
                title: 'Properties',
                type: 'array',
                items: {
                    type: 'object',
                    layout: 'horizontal',
                    properties: {
                        source: {
                            type: 'string',
                            enum: ['flow', 'data'],
                            styleClass: 'mintflow-select',
                            displayStyle: 'outlined',
                            displaySize: 'small',
                            group: 'option',
                        },
                        name: {
                            type: 'string',
                            displayStyle: 'outlined',
                            displaySize: 'small',
                            group: 'option',
                        },
                        valueFrom: {
                            type: 'string',
                            displayStyle: 'outlined',
                            displaySize: 'small',
                            group: 'option',
                        },
                        valueTto: {
                            type: 'string',
                            displayStyle: 'outlined',
                            displaySize: 'small',
                            group: 'option',
                        },
                        newName: {
                            type: 'string',
                            displayStyle: 'outlined',
                            displaySize: 'small',
                            group: 'option',
                        },
                        newValue: {
                            type: 'string',
                            displayStyle: 'outlined',
                            displaySize: 'small',
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
    documentation: "https://yourdocs.com/range",
    method: "exec",
    actions: [
        {
            name: "range",
            execute: async (input: any, config: any) => {
                let output: any = {};
                for (const rangeInfo of config.options) {
                    let sourceValue;
                    if (rangeInfo.source === 'flow') {
                        sourceValue = config.flowContext.get(rangeInfo.name)
                    } else {
                        sourceValue = input.data[rangeInfo.name]
                    }
                    const mappedInfo = config.data.options.find((info: any) => {
                        return info.source === rangeInfo.source && info.name === rangeInfo.name && sourceValue >= rangeInfo.valueFrom && sourceValue < rangeInfo.valueTto
                    })
                    if (mappedInfo) {
                        const targetName = mappedInfo?.newName ? mappedInfo.newName : rangeInfo.name;
                        const targetValue = getTemplateValue(mappedInfo.newValue, input)
                        if (rangeInfo.source === 'flow') {
                            await config.flowContext.set(targetName, targetValue)
                        } else {
                            output[targetName] = targetValue
                        }
                    }
                }
                return output;
            }
        }

    ]
};

export default rangePlugin;