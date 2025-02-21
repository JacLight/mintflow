import axios from 'axios';

const fetchPlugin = {
    name: "Fetch",
    icon: "",
    description: "Description for fetch",
    id: "fetch",
    runner: "node",
    inputSchema: {
        type: "object",
        properties: {
            method: {
                type: 'string',
                enum: ['get', 'post', 'put', 'delete'],
                displayStyle: 'outlined',
                displaySize: 'small',
            },
            url: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
            },
            headers: {
                name: 'headers',
                title: 'Headers',
                type: 'array',
                layout: 'horizontal',
                collapsible: true,
                items: {
                    type: 'object',
                    layout: 'horizontal',
                    properties: {
                        key: {
                            name: 'key',
                            type: 'string',
                            displayStyle: 'outlined',
                            displaySize: 'small',
                            group: 'option',
                        },
                        value: {
                            name: 'value',
                            type: 'string',
                            displayStyle: 'outlined',
                            displaySize: 'small',
                            group: 'option',
                        },
                    },
                },
            },
            format: {
                type: 'string',
                enum: ['json', 'text'],
            },
            body: {
                type: 'string',
                'x-control': 'Code',
                'x-control-variant': 'json',
                popup: 'mini',
                rules: [
                    { operation: 'notEqual', valueA: 'post', valueB: '{{method}}', action: 'hide' },
                    { operation: 'isNotEmpty', valueA: 'post', valueB: '{{format}}', action: 'set-property', property: [{ key: 'x-control-variant', value: '{{format}}' }] },
                ],
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
    documentation: "https://yourdocs.com/fetch",
    method: "exec",
    actions: [
        {
            name: 'fetch',
            execute: async (input: any, ctx: any) => {
                try {
                    const response = await axios({
                        method: input.method,
                        url: input.url,
                        headers: input.headers.reduce((acc: any, header: any) => {
                            acc[header.key] = header.value;
                            return acc;
                        }, {}),
                        data: input.method === 'post' ? input.body : undefined,
                        responseType: input.format === 'json' ? 'json' : 'text',
                    });
                    return response.data;
                } catch (error) {
                    if (axios.isAxiosError(error)) {
                        // Handle axios-specific errors
                        throw new Error(`Axios error: ${(error as Error).message}`);
                    } else {
                        // Handle other errors
                        if (error instanceof Error) {
                            throw new Error(`Unexpected error: ${error.message}`);
                        } else {
                            throw new Error('Unexpected error');
                        }
                    }
                }
            }
        }

    ]
};

export default fetchPlugin;