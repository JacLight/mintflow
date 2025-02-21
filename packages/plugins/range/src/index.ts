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
                            type: 'number',
                            displayStyle: 'outlined',
                            displaySize: 'small',
                            group: 'option',
                        },
                        valueTto: {
                            type: 'number',
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
    actions: [
        {
            name: "range",
            execute: async (input: any, config: any) => {
                let output: any = {};

                // Ensure we have valid options
                if (!Array.isArray(config.options) || !config.data?.options) {
                    return output;
                }

                for (const rangeInfo of config.options) {
                    let sourceValue;

                    // Get source value
                    if (rangeInfo.source === 'flow') {
                        sourceValue = config.flowContext.get(rangeInfo.name);
                    } else {
                        sourceValue = input.data?.[rangeInfo.name];
                    }

                    // Convert to number and validate
                    sourceValue = Number(sourceValue);
                    if (isNaN(sourceValue)) {
                        continue;
                    }

                    // Validate range values
                    const valueFrom = Number(rangeInfo.valueFrom);
                    const valueTo = Number(rangeInfo.valueTto);
                    if (isNaN(valueFrom) || isNaN(valueTo) || valueFrom >= valueTo) {
                        continue;
                    }

                    // Check if value is within range
                    if (sourceValue < valueFrom || sourceValue >= valueTo) {
                        continue;
                    }

                    // Find matching range info in data.options
                    const dataOption = config.data.options.find((opt: any) =>
                        opt.source === rangeInfo.source &&
                        opt.name === rangeInfo.name
                    );

                    if (!dataOption) {
                        continue;
                    }

                    // Validate data option range
                    const dataValueFrom = Number(dataOption.valueFrom);
                    const dataValueTo = Number(dataOption.valueTto);

                    if (isNaN(dataValueFrom) || isNaN(dataValueTo) ||
                        dataValueFrom >= dataValueTo ||
                        sourceValue < dataValueFrom ||
                        sourceValue >= dataValueTo) {
                        continue;
                    }

                    const targetName = dataOption.newName || rangeInfo.name;
                    const targetValue = getTemplateValue(dataOption.newValue, input.data || {});

                    if (rangeInfo.source === 'flow') {
                        await config.flowContext.set(targetName, targetValue);
                    } else {
                        output[targetName] = targetValue;
                    }
                }

                return output;
            }
        }
    ]
};

export default rangePlugin;