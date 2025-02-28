# MintFlow AssemblyAI Plugin

The AssemblyAI plugin provides advanced speech recognition and audio intelligence capabilities using the AssemblyAI API.

## Features

- **Speech-to-Text Transcription**: Convert audio files to text with high accuracy
- **Speaker Diarization**: Identify different speakers in audio
- **Sentiment Analysis**: Analyze the sentiment of spoken content
- **Entity Detection**: Identify entities like names, places, and organizations in audio
- **LeMUR (Language Model for Understanding and Reasoning)**: Analyze transcripts with AI to extract insights, summaries, and more

## Installation

```bash
pnpm add @mintflow/assemblyai
```

## Configuration

The AssemblyAI plugin requires an API key from AssemblyAI:

1. Sign up for an account at [AssemblyAI](https://www.assemblyai.com/)
2. Get your API key from the [dashboard](https://www.assemblyai.com/app/account)

## Usage

### Transcribe Audio

Convert audio to text with various options:

```javascript
const result = await mintflow.assemblyai.transcribe({
  apiKey: 'your-assemblyai-api-key',
  audioUrl: 'https://example.com/audio.mp3',
  language: 'en',
  speakerLabels: true,
  sentimentAnalysis: true,
  entityDetection: true,
  waitUntilReady: true
});

console.log(result.text); // The transcribed text
console.log(result.sentiment); // Sentiment analysis results
console.log(result.entities); // Detected entities
```

You can also transcribe from base64-encoded audio data:

```javascript
const result = await mintflow.assemblyai.transcribe({
  apiKey: 'your-assemblyai-api-key',
  audioData: 'base64-encoded-audio-data',
  audioMimeType: 'audio/mp3',
  waitUntilReady: true
});
```

### Check Transcription Status

Check the status of an ongoing transcription:

```javascript
const status = await mintflow.assemblyai.getTranscriptStatus({
  apiKey: 'your-assemblyai-api-key',
  transcriptId: 'transcript-id-from-previous-request'
});

console.log(status.status); // 'completed', 'processing', etc.
console.log(status.text); // Transcribed text if completed
```

### Analyze Transcripts with LeMUR

Use LeMUR to analyze transcripts with AI:

```javascript
const result = await mintflow.assemblyai.lemurTask({
  apiKey: 'your-assemblyai-api-key',
  transcriptIds: ['transcript-id-1', 'transcript-id-2'],
  prompt: 'Summarize the key points from these transcripts',
  context: 'This is a meeting about product development',
  temperature: 0.7
});

console.log(result.response); // AI-generated analysis of the transcripts
```

## Advanced Options

### Transcription Options

- **language**: Specify the language of the audio (e.g., 'en', 'fr', 'es')
- **speakerLabels**: Enable speaker diarization to identify different speakers
- **sentimentAnalysis**: Analyze the sentiment of the transcribed text
- **entityDetection**: Identify entities in the transcribed text
- **waitUntilReady**: Wait for the transcription to complete before returning

### LeMUR Options

- **prompt**: The instruction for LeMUR to analyze the transcripts
- **context**: Additional context to help LeMUR understand the transcripts
- **final_model**: The LLM model to use for the final response
- **max_output_size**: Maximum number of tokens in the response
- **temperature**: Temperature for the LLM (0.0 to 1.0)

## Error Handling

The plugin includes comprehensive error handling:

```javascript
try {
  const result = await mintflow.assemblyai.transcribe({
    apiKey: 'your-assemblyai-api-key',
    audioUrl: 'https://example.com/audio.mp3'
  });
  console.log(result.text);
} catch (error) {
  console.error('Error:', error.message);
}
```

## Development

### Testing

This plugin supports both Jest and Vitest for testing:

```bash
# Run tests with Jest (default)
pnpm test

# Run tests with Vitest
pnpm test:vitest
```

## License

MIT
