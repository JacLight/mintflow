# Groq Plugin for MintFlow

The Groq plugin for MintFlow provides integration with Groq's high-performance AI inference platform, allowing you to generate text completions and process audio with Groq's fast language models.

## Features

- **Fast Language Models**: Access to Groq's powerful Llama 3.1 and Mixtral models
- **Audio Processing**: Transcribe and translate audio files using Whisper models
- **Customizable Parameters**: Control temperature, tokens, and other generation parameters
- **Role-based Conversations**: Structure conversations with system, user, and assistant roles
- **Custom API Access**: Make custom API calls to the Groq API for advanced use cases

## Authentication

The Groq plugin requires an API key for authentication. To obtain an API key:

1. Create an account at [Groq](https://console.groq.com/)
2. Navigate to the API Keys section
3. Create a new API key
4. Copy the generated API key and use it in your MintFlow workflow

## Actions

### Ask AI

Generate text completions and answers to questions using Groq's language models.

#### Input

```json
{
  "model": "llama-3.1-70b-versatile",
  "prompt": "What is the capital of France?",
  "temperature": 0.9,
  "maxTokens": 2048,
  "topP": 1,
  "frequencyPenalty": 0,
  "presencePenalty": 0.6,
  "roles": [
    { "role": "system", "content": "You are a helpful assistant." }
  ]
}
```

#### Parameters

- **model** (required): The model to use for generating completions. Options include:
  - `llama-3.1-70b-versatile`
  - `llama-3.1-8b-versatile`
  - `llama-3.1-70b-instruct`
  - `llama-3.1-8b-instruct`
  - `mixtral-8x7b-32768`
  - `gemma-7b-it`

- **prompt** (required): The question or prompt to send to the model

- **temperature** (optional): Controls randomness in the response. Higher values (e.g., 0.9) make output more random, while lower values (e.g., 0.2) make it more focused and deterministic. Default: 0.9

- **maxTokens** (optional): The maximum number of tokens to generate. Default: 2048

- **topP** (optional): The nucleus sampling threshold (0-1). For each token, the model considers tokens with top_p probability mass. Default: 1

- **frequencyPenalty** (optional): Number between -2.0 and 2.0. Positive values penalize new tokens based on their existing frequency in the text so far. Default: 0

- **presencePenalty** (optional): Number between -2.0 and 2.0. Positive values penalize new tokens based on whether they appear in the text so far. Default: 0.6

- **roles** (optional): Array of roles to specify more accurate response. Available roles are "system", "user", and "assistant". Default: `[{ "role": "system", "content": "You are a helpful assistant." }]`

#### Output

```json
{
  "content": "The capital of France is Paris. Paris is located in the north-central part of the country on the Seine River. It is one of the world's most important and attractive cities, known for its art, culture, fashion, and cuisine. Paris is often referred to as the \"City of Light\" (La Ville Lumière) and is home to iconic landmarks such as the Eiffel Tower, the Louvre Museum, and Notre-Dame Cathedral."
}
```

### Transcribe Audio

Transcribes audio into text in the input language.

#### Input

```json
{
  "file": {
    "data": "base64-encoded-audio-data",
    "filename": "audio.mp3"
  },
  "model": "whisper-large-v3",
  "language": "en",
  "temperature": 0,
  "responseFormat": "json"
}
```

#### Parameters

- **file** (required): The audio file to transcribe
  - **data**: Base64-encoded content of the file
  - **filename**: Name of the file

- **model** (required): The model to use for transcription. Currently only supports `whisper-large-v3`

- **language** (optional): The language of the input audio in ISO-639-1 format (e.g., "en" for English)

- **prompt** (optional): An optional text to guide the model's style or continue a previous audio segment

- **temperature** (optional): The sampling temperature, between 0 and 1. Default: 0

- **responseFormat** (optional): The format of the transcript output. Options: `json`, `text`, `verbose_json`. Default: `json`

#### Output

```json
{
  "text": "This is a transcription of the audio file."
}
```

### Translate Audio

Translates audio into English text.

#### Input

```json
{
  "file": {
    "data": "base64-encoded-audio-data",
    "filename": "audio.mp3"
  },
  "model": "whisper-large-v3",
  "temperature": 0,
  "responseFormat": "json"
}
```

#### Parameters

- **file** (required): The audio file to translate
  - **data**: Base64-encoded content of the file
  - **filename**: Name of the file

- **model** (required): The model to use for translation. Currently only supports `whisper-large-v3`

- **prompt** (optional): An optional text in English to guide the model's style or continue a previous audio segment

- **temperature** (optional): The sampling temperature, between 0 and 1. Default: 0

- **responseFormat** (optional): The format of the translation output. Options: `json`, `text`, `verbose_json`. Default: `json`

#### Output

```json
{
  "text": "This is a translation of the audio file into English."
}
```

### Custom API Call

Make a custom API call to the Groq API.

#### Input

```json
{
  "endpoint": "models",
  "method": "GET",
  "queryParams": {
    "limit": 10
  }
}
```

#### Parameters

- **endpoint** (required): The Groq API endpoint to call (without the base URL)

- **method** (required): The HTTP method to use. Options: `GET`, `POST`, `PUT`, `DELETE`. Default: `GET`

- **body** (optional): The request body (for POST, PUT methods)

- **queryParams** (optional): Query parameters to include in the request

- **headers** (optional): Additional headers to include in the request

#### Output

```json
{
  "data": {
    "object": "list",
    "data": [
      {
        "id": "llama-3.1-70b-versatile",
        "object": "model",
        "created": 1717027200,
        "owned_by": "groq"
      },
      {
        "id": "llama-3.1-8b-versatile",
        "object": "model",
        "created": 1717027200,
        "owned_by": "groq"
      }
    ]
  },
  "status": 200,
  "headers": {
    "content-type": "application/json"
  }
}
```

## Model Selection Guide

- **Versatile Models**: Models with "versatile" in their name are general-purpose models that can be used for a wide range of tasks.
  - Example: `llama-3.1-70b-versatile`

- **Instruct Models**: Models with "instruct" in their name are optimized for following instructions.
  - Example: `llama-3.1-70b-instruct`

- **Size Considerations**: Models come in different sizes (8b, 70b) with different capabilities and token limits.
  - Smaller models are faster but may be less capable
  - Larger models are more capable but may be slower

## Common Use Cases

### Content Generation

- Generate creative writing or marketing copy
- Draft emails or messages
- Create outlines for articles or blog posts

### Information Retrieval and Analysis

- Answer factual questions
- Summarize articles or research papers
- Analyze and extract insights from text

### Audio Processing

- Transcribe interviews, meetings, or lectures
- Translate foreign language audio to English
- Process voice memos or audio notes

## Resources

- [Groq Documentation](https://console.groq.com/docs/quickstart)
- [Groq API Reference](https://console.groq.com/docs/api-reference)
- [Groq Models](https://console.groq.com/docs/models)
