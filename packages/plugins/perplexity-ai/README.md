# Perplexity AI Plugin for MintFlow

The Perplexity AI plugin for MintFlow provides integration with Perplexity's AI-powered search engine, allowing you to generate text completions and answers to questions with citations.

## Features

- **Advanced AI Models**: Access to Perplexity's powerful Llama 3.1 models
- **Online Search Capability**: Models with "online" in their name can search the web for up-to-date information
- **Citation Support**: Receive citations for information provided in responses
- **Customizable Parameters**: Control temperature, tokens, and other generation parameters
- **Role-based Conversations**: Structure conversations with system, user, and assistant roles

## Authentication

The Perplexity AI plugin requires an API key for authentication. To obtain an API key:

1. Create an account at [Perplexity AI](https://www.perplexity.ai/)
2. Navigate to [API Settings](https://www.perplexity.ai/settings/api)
3. Click on "Create New API Key"
4. Copy the generated API key and use it in your MintFlow workflow

## Actions

### Ask AI

Generate text completions and answers to questions using Perplexity's AI models.

#### Input

```json
{
  "model": "llama-3.1-sonar-small-128k-online",
  "prompt": "What is the capital of France?",
  "temperature": 0.2,
  "top_p": 0.9,
  "presence_penalty": 0,
  "frequency_penalty": 1.0,
  "roles": [
    { "role": "system", "content": "You are a helpful assistant." }
  ]
}
```

#### Parameters

- **model** (required): The model to use for generating completions. Options include:
  - `llama-3.1-sonar-small-128k-online`
  - `llama-3.1-sonar-large-128k-online`
  - `llama-3.1-sonar-huge-128k-online`
  - `llama-3.1-sonar-small-128k-chat`
  - `llama-3.1-sonar-large-128k-chat`
  - `llama-3.1-8b-instruct`
  - `llama-3.1-70b-instruct`

- **prompt** (required): The question or prompt to send to the model

- **temperature** (optional): Controls randomness in the response. Higher values (e.g., 0.8) make output more random, while lower values (e.g., 0.2) make it more focused and deterministic. Default: 0.2

- **max_tokens** (optional): The maximum number of tokens to generate. Refer to the model documentation for token limits.

- **top_p** (optional): The nucleus sampling threshold (0-1). For each token, the model considers tokens with top_p probability mass. Default: 0.9

- **presence_penalty** (optional): Number between -2.0 and 2.0. Positive values penalize new tokens based on whether they appear in the text so far. Default: 0

- **frequency_penalty** (optional): Value greater than 0. Values greater than 1.0 penalize tokens based on their existing frequency in the text. Default: 1.0

- **roles** (optional): Array of roles to specify more accurate response. Available roles are "system", "user", and "assistant". Default: `[{ "role": "system", "content": "You are a helpful assistant." }]`

#### Output

```json
{
  "result": "The capital of France is Paris. Paris is located in the north-central part of the country on the Seine River. It is one of the world's most important and attractive cities, known for its art, culture, fashion, and cuisine. Paris is often referred to as the \"City of Light\" (La Ville Lumière) and is home to iconic landmarks such as the Eiffel Tower, the Louvre Museum, and Notre-Dame Cathedral.",
  "citations": [
    {
      "start": 0,
      "end": 30,
      "text": "The capital of France is Paris.",
      "url": "https://en.wikipedia.org/wiki/Paris"
    }
  ]
}
```

## Model Selection Guide

- **Online Models**: Models with "online" in their name can search the web for up-to-date information and provide citations.
  - Example: `llama-3.1-sonar-small-128k-online`

- **Chat Models**: Models with "chat" in their name are optimized for conversational interactions.
  - Example: `llama-3.1-sonar-small-128k-chat`

- **Instruct Models**: Models with "instruct" in their name are optimized for following instructions.
  - Example: `llama-3.1-8b-instruct`

- **Size Considerations**: Models come in different sizes (small, large, huge) with different capabilities and token limits.
  - Smaller models are faster but may be less capable
  - Larger models are more capable but may be slower

## Common Use Cases

### Information Retrieval and Research

- Answer factual questions with citations
- Summarize articles or research papers
- Gather information on specific topics with up-to-date data

### Content Creation

- Generate creative writing or marketing copy
- Draft emails or messages
- Create outlines for articles or blog posts

### Educational Support

- Explain complex concepts
- Create study materials or quizzes
- Provide step-by-step solutions to problems

## Resources

- [Perplexity AI Documentation](https://docs.perplexity.ai/)
- [Perplexity AI Model Cards](https://docs.perplexity.ai/guides/model-cards)
- [Perplexity AI API Reference](https://docs.perplexity.ai/reference/post_chat_completions)
