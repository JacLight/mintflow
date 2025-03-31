// demo.ts

import aiPlugin from './index.js';
import { AIPluginConfig } from './interface/index.js';
// import redis from 'redis';

// Example configuration for the AI plugin
const createConfig = (): AIPluginConfig => ({
    defaultProvider: 'openai', // Primary provider
    fallbackProvider: 'ollama', // Fallback if primary fails
    providers: {
        openai: {
            apiKey: process.env.OPENAI_API_KEY || '',
            organization: process.env.OPENAI_ORG_ID
        },
        anthropic: {
            apiKey: process.env.ANTHROPIC_API_KEY || ''
        },
        google: {
            apiKey: process.env.GOOGLE_API_KEY || ''
        },
        ollama: {
            baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434'
        }
    }
});

// Redis client for caching
// const redisClient = redis.createClient({
//     url: process.env.REDIS_URL || 'redis://localhost:6379'
// });

// Function to get or compute embeddings with caching
// async function getCachedEmbeddings(text: string, model: string, userId: string) {
//     const config = createConfig();
//     const cacheKey = `embeddings:${userId}:${model}:${Buffer.from(text).toString('base64')}`;

//     try {
//         // Try to get from cache first
//         const cachedEmbeddings = await redisClient.get(cacheKey);
//         if (cachedEmbeddings) {
//             console.log('Using cached embeddings');
//             return JSON.parse(cachedEmbeddings);
//         }

//         // Not in cache, compute new embeddings
//         console.log('Computing new embeddings');
//         const response = await aiPlugin.actions
//             .find(a => a.name === 'generateEmbedding')
//             ?.execute({
//                 config,
//                 provider: 'openai',
//                 model: model,
//                 input: text
//             });

//         // Cache the result (with 24 hour expiry)
//         await redisClient.set(cacheKey, JSON.stringify(response.embeddings), {
//             EX: 86400 // 24 hours
//         });

//         return response.embeddings;
//     } catch (error) {
//         console.error('Error generating embeddings:', error);
//         throw error;
//     }
// }

// // Example of multi-tenant usage with different API keys
// async function multiTenantExample() {
//     // Tenant 1 with OpenAI
//     const tenant1Config: AIPluginConfig = {
//         defaultProvider: 'openai',
//         providers: {
//             openai: {
//                 apiKey: 'tenant1-openai-key'
//             }
//         }
//     };

//     // Tenant 2 with Anthropic
//     const tenant2Config: AIPluginConfig = {
//         defaultProvider: 'anthropic',
//         providers: {
//             anthropic: {
//                 apiKey: 'tenant2-anthropic-key'
//             }
//         }
//     };

//     // Process requests for different tenants
//     const [tenant1Response, tenant2Response] = await Promise.all([
//         aiPlugin.actions
//             .find(a => a.name === 'generateText')
//             ?.execute({
//                 config: tenant1Config,
//                 model: 'gpt-3.5-turbo',
//                 prompt: 'Explain quantum computing'
//             }),
//         aiPlugin.actions
//             .find(a => a.name === 'generateText')
//             ?.execute({
//                 config: tenant2Config,
//                 model: 'claude-3-haiku-20240307',
//                 prompt: 'Explain quantum computing'
//             })
//     ]);

//     console.log('Tenant 1 (OpenAI):', tenant1Response.text.substring(0, 100) + '...');
//     console.log('Tenant 2 (Anthropic):', tenant2Response.text.substring(0, 100) + '...');
// }

// // Example: Generate text with streaming callback
// async function streamingExample() {
//     const config = createConfig();

//     let fullText = '';
//     console.log('Streaming response:');

//     await aiPlugin.actions
//         .find(a => a.name === 'streamText')
//         ?.execute({
//             config,
//             provider: 'ollama',
//             model: 'llama3',
//             prompt: 'Write a short poem about AI',
//             temperature: 0.8
//         }, (chunk) => {
//             // Process each chunk as it arrives
//             process.stdout.write(chunk.text);
//             fullText += chunk.text;

//             if (chunk.isComplete) {
//                 console.log('\n--- Generation complete ---');
//             }
//         });

//     return fullText;
// }

// // Example: Using the plugin in a workflow engine
// async function workflowNodeExample(nodeData: any, flowData: any) {
//     const config = createConfig();

//     // Extract input from workflow
//     const { prompt, systemPrompt, temperature } = nodeData.inputs;
//     const userQuery = flowData.nodes.input_node.data.userQuery;

//     // Execute the AI action
//     const result = await aiPlugin.actions
//         .find(a => a.name === 'generateText')
//         ?.execute({}, {
//             config,
//             model: 'gpt-4',
//             prompt: prompt.replace('{{$userQuery}}', userQuery),
//             systemPrompt,
//             temperature
//         });

//     // Return the result to the workflow engine
//     return {
//         text: result.text,
//         usage: result.usage
//     };
// }

// // Export examples
// export {
//     getCachedEmbeddings,
//     multiTenantExample,
//     streamingExample,
//     workflowNodeExample
// };