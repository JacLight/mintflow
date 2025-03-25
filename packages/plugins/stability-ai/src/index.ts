import { textToImage } from './actions/index.js';
import fetch from 'node-fetch';

const stabilityAiPlugin = {
    name: "Stability AI",
    icon: "TbPhoto",
    description: "Generative AI image model based on Stable Diffusion",
    id: "stability-ai",
    runner: "node",
    inputSchema: {
        type: "object",
        properties: {
            api_key: {
                type: "string",
                description: "Your Stability AI API key",
                required: true,
            }
        }
    },
    outputSchema: {
        type: "object",
    },
    exampleInput: {
        api_key: "YOUR_API_KEY",
    },
    exampleOutput: {
        images: [
            {
                base64: "base64_encoded_image_data",
                finishReason: "SUCCESS"
            }
        ]
    },
    documentation: "https://platform.stability.ai/docs/getting-started/authentication",
    method: "exec",
    actions: [
        textToImage,
        {
            name: 'custom-api-call',
            displayName: 'Custom API Call',
            description: 'Make a custom API call to the Stability AI API',
            inputSchema: {
                type: 'object',
                properties: {
                    method: {
                        type: 'string',
                        enum: ['GET', 'POST', 'PUT', 'DELETE'],
                        default: 'GET',
                        required: true,
                    },
                    path: {
                        type: 'string',
                        description: 'The path to append to the base URL (https://api.stability.ai/v1)',
                        required: true,
                    },
                    body: {
                        type: 'object',
                        description: 'The request body for POST and PUT requests',
                    },
                    queryParams: {
                        type: 'object',
                        description: 'Query parameters to include in the request',
                    },
                },
            },
            outputSchema: {
                type: 'object',
            },
            async execute(input: any, config: any) {
                const { method, path, body, queryParams } = input;
                const apiKey = config.auth?.api_key;
                
                if (!apiKey) {
                    throw new Error('API key is required for Stability AI');
                }
                
                const baseUrl = 'https://api.stability.ai/v1';
                let url = `${baseUrl}${path.startsWith('/') ? path : '/' + path}`;
                
                // Add query parameters if provided
                if (queryParams && Object.keys(queryParams).length > 0) {
                    const params = new URLSearchParams();
                    for (const [key, value] of Object.entries(queryParams)) {
                        params.append(key, String(value));
                    }
                    url += `?${params.toString()}`;
                }
                
                try {
                    const response = await fetch(url, {
                        method,
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                            'Authorization': `Bearer ${apiKey}`,
                        },
                        body: ['POST', 'PUT'].includes(method) && body ? JSON.stringify(body) : undefined,
                    });
                    
                    if (!response.ok) {
                        const errorData = await response.text();
                        throw new Error(`Stability AI API error: ${errorData}`);
                    }
                    
                    const data = await response.json();
                    return data;
                } catch (error) {
                    console.error('Error making custom API call:', error);
                    throw error;
                }
            },
        }
    ]
};

export default stabilityAiPlugin;
