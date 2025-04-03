const evalExpression = (template: string, data: any) => {
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
    return eval(result);
}

const processTemplate = (template: string, data: any) => {
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


const modifyPlugin = {
    name: "Modify",
    icon: "Edit",
    description: "Description for modify",
    groups: ["utility"],
    tags: ["utility", "tool", "helper", "function", "operation"],
    version: '1.0.0',
    id: "modify",
    runner: "node",
    inputSchema: {
        type: "object",
        properties: {
            ignoreUndefined: {
                type: 'boolean',
            },
            values: {
                type: 'array',
                items: {
                    type: 'object',
                    layout: 'horizontal',
                    properties: {
                        operation: {
                            type: 'string',
                            enum: ['set', 'move', 'delete'],
                            styleClass: 'mintflow-select',
                            displayStyle: 'outlined',
                            displaySize: 'small',
                            group: 'option',
                            'x-ui': {
                                'control': {
                                    classes: ['w-24']
                                }
                            }
                        },
                        target: {
                            type: 'string',
                            enum: ['flow', 'data'],
                            styleClass: 'mintflow-select',
                            displayStyle: 'outlined',
                            displaySize: 'small',
                            rules: [{ operation: 'equal', valueA: 'move', valueB: '{{operation}}', action: 'set-property', property: [{ key: 'title', value: 'From' }] }],
                            group: 'option',
                            'x-ui': {
                                'control': {
                                    classes: ['w-24']
                                }
                            }
                        },
                        name: {
                            type: 'string',
                            displayStyle: 'outlined',
                            displaySize: 'small',
                            group: 'option',
                            'x-ui': {
                                'control': {
                                    classes: ['w-24']
                                }
                            }
                        },
                        to: {
                            type: 'string',
                            enum: ['string', 'number', 'false', 'true', 'timestamp', 'expression', 'data', 'flow'],
                            styleClass: 'mintflow-select',
                            displayStyle: 'outlined',
                            displaySize: 'small',
                            rules: [
                                { operation: 'equal', valueA: 'delete', valueB: '{{operation}}', action: 'hide' },
                                { operation: 'equal', valueA: 'move', valueB: '{{operation}}', action: 'set-property', property: [{ key: 'enum', value: ['flow', 'data'] }] },
                            ],
                            group: 'option',
                            'x-ui': {
                                'control': {
                                    classes: ['w-24']
                                }
                            }
                        },
                        value: {
                            type: 'string',
                            displayStyle: 'outlined',
                            displaySize: 'small',
                            rules: [
                                { operation: 'equal', valueA: 'delete', valueB: '{{operation}}', action: 'hide' },
                                { operation: 'in', valueA: ['true', 'false', 'timestamp'], valueB: '{{to}}', action: 'hide' },
                                { operation: 'in', valueA: ['data', 'flow'], valueB: '{{to}}', action: 'set-property', property: [{ key: 'title', value: 'Name' }] },
                                { operation: 'equal', valueA: 'move', valueB: '{{operation}}', action: 'set-property', property: [{ key: 'title', value: 'Name' }] },
                            ],
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
    documentation: "https://yourdocs.com/modify",
    method: "exec",
    actions: [

        {
            name: 'modify',
            execute: async (input: any, config: any) => {
                const data = {};
                for (const valueInfo of config.data.values) {
                    if (valueInfo.operation === 'set') {
                        await setItem(valueInfo, data, config.flowContext)
                    } else if (valueInfo.operation === 'move') {
                        await moveItem(valueInfo, input, data, config.flowContext) // Pass input here
                    } else if (valueInfo.operation === 'delete') {
                        await deleteItem(valueInfo, data, config.flowContext)
                    }
                };
                return data
            }
        }
    ]
};

const setItem = async (valueInfo: any, data: any, flowContext: any) => {
    let value;
    switch (valueInfo.to) {
        case ('number'):
            value = 1 * valueInfo.value
            break;
        case ('true'):
            value = true
            break;
        case ('false'):
            value = false
            break;
        case ('timestamp'):
            value = (new Date()).getTime()
            break;
        case ('expression'):
            value = await evalExpression(valueInfo.value, data)
            break;
        case ('data'):
            value = data[valueInfo.value]
            break;
        case ('flow'):
            value = await flowContext.get(valueInfo.value)
            break;
        default:
            value = valueInfo.value;
            if (typeof value === 'string') {
                value = await processTemplate(value, data)
            }
            break;
    }
    switch (valueInfo.target) {
        case ('flow'):
            await flowContext.set(valueInfo.name, value)
            break;
        default:
            data[valueInfo.name] = value;
            break;
    }
}

const moveItem = async (valueInfo: any, input: any, data: any, flowContext: any) => {
    let value;
    switch (valueInfo.target) {
        case ('data'):
            value = input[valueInfo.name]; // Get value from input data instead of empty data object
            delete input[valueInfo.name];
            break;
        case ('flow'):
            value = await flowContext.get(valueInfo.name);
            await flowContext.delete(valueInfo.name);
            break;
        default:
            break;
    }

    switch (valueInfo.to) {
        case ('flow'):
            await flowContext.set(valueInfo.value, value);
            break;
        case ('data'):
            data[valueInfo.value] = value;
            break;
        default:
            break;
    }
}

const deleteItem = async (valueInfo: any, data: any, flowContext: any) => {
    switch (valueInfo.target) {
        case ('flow'):
            await flowContext.delete(valueInfo.name)
            break;
        case ('data'):
            delete data[valueInfo.name]
            break;
        default:
            break;
    }
}

export default modifyPlugin;
