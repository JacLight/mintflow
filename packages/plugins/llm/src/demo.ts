// Example of how to use the AI Plugin in your workflow

import aiPlugin from "./index.js";

// Initialize the plugin with configuration including fallback
const initializeAIPlugin = () => {
    aiPlugin.initialize({
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

    return aiPlugin;
};

// Example: Text generation
const generateTextExample = async () => {
    const plugin: any = initializeAIPlugin();

    // First, list available models
    const models = await plugin.actions
        .find((a: any) => a.name === 'listModels')
        ?.execute({ capability: 'text-generation' });

    console.log('Available models:', models.map((m: any) => `${m.name} (${m.provider})`));

    // Generate text with OpenAI (default provider)
    const response = await plugin.actions
        .find((a: any) => a.name === 'generateText')
        ?.execute({
            model: 'gpt-3.5-turbo',
            prompt: 'Explain quantum computing in simple terms',
            systemPrompt: 'You are a helpful assistant that explains complex topics simply.',
            temperature: 0.7,
            maxTokens: 500
        });

    console.log('Response:', response.text);
    console.log('Token usage:', response.usage);

    // Generate text with Anthropic (explicit provider)
    const anthropicResponse = await plugin.actions
        .find((a: any) => a.name === 'generateText')
        ?.execute({
            provider: 'anthropic',
            model: 'claude-3-sonnet-20240229',
            prompt: 'Explain quantum computing in simple terms',
            temperature: 0.7
        });

    console.log('Anthropic response:', anthropicResponse.text);
};

// Example: Streaming text generation
const streamingExample = async () => {
    const plugin: any = initializeAIPlugin();

    let fullText = '';

    // Stream text with callback for each chunk
    await plugin.actions
        .find((a: any) => a.name === 'streamText')
        ?.execute({
            provider: 'ollama',
            model: 'llama3', // Local model
            prompt: 'Write a short story about a robot learning to paint',
            temperature: 0.8,
            maxTokens: 1000
        }, (chunk: any) => {
            // Process each chunk as it arrives
            process.stdout.write(chunk.text);
            fullText += chunk.text;

            if (chunk.isComplete) {
                console.log('\n--- Generation complete ---');
            }
        });

    return fullText;
};

// Example: Embedding generation
const embeddingExample = async () => {
    const plugin: any = initializeAIPlugin();

    // List models with embedding capability
    const embeddingModels = await plugin.actions
        .find((a: any) => a.name === 'listModels')
        ?.execute({ capability: 'embeddings' });

    console.log('Available embedding models:', embeddingModels.map((m: any) => `${m.name} (${m.provider})`));

    // Generate embeddings for multiple texts
    const embeddings = await plugin.actions
        .find((a: any) => a.name === 'generateEmbedding')
        ?.execute({
            provider: 'openai',
            model: 'text-embedding-3-small',
            input: [
                'This is the first document',
                'This is the second document',
                'This is the third document'
            ]
        });

    console.log(`Generated ${embeddings.embeddings.length} embeddings`);
    console.log(`Each embedding has ${embeddings.embeddings[0].length} dimensions`);

    return embeddings;
};

// Example: Using with your flow engine
const aiFlowNodeExample = {
    id: 'ai-text-generation',
    type: 'ai',
    action: 'generateText',
    inputs: {
        model: 'gpt-4',
        prompt: '{{$node["input_node"].data.userQuery}}',
        systemPrompt: 'You are a helpful assistant.',
        temperature: 0.7
    },
    outputs: ['text', 'usage']
};

// Export examples
export {
    generateTextExample,
    streamingExample,
    embeddingExample,
    aiFlowNodeExample
};