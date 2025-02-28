# MintFlow AI Plugin

The AI plugin provides integration with various AI models for text generation, chat, embeddings, and image analysis. It supports multiple providers including OpenAI, Anthropic, Google (Gemini), and Ollama.

## Features

- **Text Generation**: Generate text using various AI models
- **Chat**: Have conversations with AI models with memory support
- **Embeddings**: Generate vector embeddings for text
- **Image Analysis**: Analyze images and generate descriptions
- **Model Management**: List available models and validate model IDs
- **Provider Fallback**: Automatically fall back to alternative providers if the primary provider fails

## Supported Providers

- **OpenAI**: GPT-3.5, GPT-4, and other OpenAI models
- **Anthropic**: Claude and other Anthropic models
- **Google**: Gemini Pro, Gemini Pro Vision, Gemini Ultra, and embedding models
- **Ollama**: Local models running on Ollama

## Installation

```bash
pnpm add @mintflow/ai
```

## Configuration

The AI plugin requires configuration for each provider you want to use:

```javascript
const config = {
  defaultProvider: 'openai', // The default provider to use
  fallbackProvider: 'google', // Optional fallback provider if the default fails
  providers: {
    openai: {
      apiKey: 'your-openai-api-key',
      // Optional settings
      baseUrl: 'https://api.openai.com/v1', // Default OpenAI API URL
      organization: 'your-organization-id', // Optional organization ID
      apiVersion: '2023-05-15' // Optional API version
    },
    anthropic: {
      apiKey: 'your-anthropic-api-key',
      // Optional settings
      baseUrl: 'https://api.anthropic.com', // Default Anthropic API URL
      apiVersion: '2023-06-01' // Optional API version
    },
    google: {
      apiKey: 'your-google-api-key',
      // Optional settings
      projectId: 'your-google-cloud-project-id', // Optional project ID for Google Cloud
      baseUrl: 'https://generativelanguage.googleapis.com/v1beta' // Default Google API URL
    },
    ollama: {
      baseUrl: 'http://localhost:11434', // URL where Ollama is running
      keepAlive: true // Optional setting to keep the connection alive
    }
  }
};
```

## Usage

### Text Generation

Generate text using an AI model:

```javascript
const result = await mintflow.ai.generateText({
  config,
  provider: 'openai', // Optional, uses defaultProvider if not specified
  model: 'gpt-4',
  prompt: 'Write a short story about a robot learning to paint.',
  systemPrompt: 'You are a creative writing assistant.', // Optional
  temperature: 0.7, // Optional, controls randomness (0.0 to 1.0)
  maxTokens: 500, // Optional, maximum number of tokens to generate
  topP: 0.9 // Optional, controls diversity (0.0 to 1.0)
});

console.log(result.text); // The generated text
console.log(result.usage); // Token usage information if available
```

### Streaming Text Generation

Generate text with streaming for real-time updates:

```javascript
const result = await mintflow.ai.streamText({
  config,
  provider: 'anthropic',
  model: 'claude-3-opus-20240229',
  prompt: 'Explain quantum computing in simple terms.',
  systemPrompt: 'You are a helpful assistant that explains complex topics simply.',
  temperature: 0.5,
  maxTokens: 1000
}, (chunk) => {
  if (!chunk.isComplete) {
    process.stdout.write(chunk.text); // Display text as it's generated
  }
});

console.log('\nFinal text:', result.text);
```

### Chat

Have a conversation with an AI model:

```javascript
const messages = [
  { role: 'system', content: 'You are a helpful assistant.' },
  { role: 'user', content: 'Hello, how are you?' },
  { role: 'assistant', content: 'I\'m doing well, thank you! How can I help you today?' },
  { role: 'user', content: 'Can you explain what machine learning is?' }
];

const result = await mintflow.ai.chat({
  config,
  provider: 'google',
  model: 'gemini-pro',
  messages,
  temperature: 0.7,
  memoryKey: 'conversation-123' // Optional, for persisting conversation history
});

console.log(result.text); // The assistant's response
console.log(result.messages); // Updated message history including the new response
```

### Streaming Chat

Chat with streaming for real-time responses:

```javascript
const result = await mintflow.ai.chatStream({
  config,
  provider: 'openai',
  model: 'gpt-4',
  messages: [
    { role: 'user', content: 'Write a poem about the ocean.' }
  ],
  temperature: 0.8
}, (chunk) => {
  if (!chunk.isComplete) {
    process.stdout.write(chunk.text);
  }
});

console.log('\nFinal response:', result.text);
```

### Multimodal Chat (with Images)

Chat with both text and images:

```javascript
const messages = [
  { 
    role: 'user', 
    content: [
      { 
        type: 'image', 
        imageData: {
          data: 'base64-encoded-image-data',
          mimeType: 'image/jpeg'
        }
      },
      { 
        type: 'text', 
        text: 'What's in this image?' 
      }
    ]
  }
];

const result = await mintflow.ai.chat({
  config,
  provider: 'google',
  model: 'gemini-pro-vision',
  messages
});

console.log(result.text); // Description of the image
```

### Image Analysis

Analyze an image and generate a description:

```javascript
const result = await mintflow.ai.analyzeImage({
  config,
  provider: 'google',
  model: 'gemini-pro-vision',
  prompt: 'Describe this image in detail.',
  image: {
    data: 'base64-encoded-image-data',
    mimeType: 'image/jpeg',
    filename: 'image.jpg' // Optional
  },
  temperature: 0.7
});

console.log(result.text); // Description of the image
```

### Embeddings

Generate vector embeddings for text:

```javascript
const result = await mintflow.ai.generateEmbedding({
  config,
  provider: 'openai',
  model: 'text-embedding-3-small',
  input: 'The quick brown fox jumps over the lazy dog.'
});

console.log(result.embeddings); // Vector embeddings
```

You can also generate embeddings for multiple texts at once:

```javascript
const result = await mintflow.ai.generateEmbedding({
  config,
  provider: 'openai',
  model: 'text-embedding-3-small',
  input: [
    'The quick brown fox jumps over the lazy dog.',
    'Machine learning is a subset of artificial intelligence.'
  ]
});

console.log(result.embeddings); // Array of vector embeddings
```

### List Models

List available models from a provider:

```javascript
const models = await mintflow.ai.listModels({
  config,
  provider: 'openai', // Optional, lists models from all configured providers if not specified
  capability: 'text-generation' // Optional, filter by capability
});

console.log(models);
```

### Validate Model

Check if a model is valid for a provider:

```javascript
const isValid = await mintflow.ai.validateModel({
  config,
  provider: 'google',
  model: 'gemini-pro'
});

console.log(isValid); // true or false
```

## Passthrough Mode

The AI plugin includes a passthrough mode that allows you to directly access provider-specific APIs without any processing. This is useful for advanced use cases where you need to use features that aren't covered by the standard AI plugin interface.

```javascript
const result = await mintflow.ai.passthrough({
  config,
  provider: 'openai',
  endpoint: '/chat/completions',
  data: {
    model: 'gpt-4',
    messages: [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: 'Tell me a joke.' }
    ],
    temperature: 0.7
  },
  method: 'post', // optional, defaults to 'post'
  headers: {      // optional, additional headers
    'X-Custom-Header': 'value'
  }
});

console.log(result);
```

The passthrough mode automatically handles authentication and base URLs for each provider, so you only need to specify the endpoint path and the data to send.

## Error Handling

The AI plugin includes error handling with automatic fallback to the configured fallback provider:

```javascript
try {
  const result = await mintflow.ai.generateText({
    config,
    provider: 'openai',
    model: 'gpt-4',
    prompt: 'Write a short story.'
  });
  console.log(result.text);
} catch (error) {
  console.error('Error:', error.message);
}
```

If the primary provider fails and a fallback provider is configured, the plugin will automatically try the fallback provider.

## License

MIT
