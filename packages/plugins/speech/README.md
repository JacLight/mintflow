# MintFlow Speech Plugin

The Speech plugin provides integration with various speech-related AI services, enabling text-to-speech and speech-to-text functionality in your workflows.

## Features

- **Text-to-Speech**: Convert text to natural-sounding speech using multiple providers:
  - ElevenLabs
  - OpenAI
  - Microsoft Azure
  - Google Cloud
- **Speech-to-Text**: Transcribe audio files to text using AssemblyAI
- **Voice Management**: List available voices from all supported providers
- **Advanced Transcription**: Support for speaker identification, sentiment analysis, entity detection, and more

## Installation

```bash
pnpm add @mintflow/speech
```

## Configuration

The Speech plugin requires API keys for the services you want to use:

- For text-to-speech functionality, you need one of the following:
  - [ElevenLabs API key](https://elevenlabs.io/docs/api-reference/authentication)
  - [OpenAI API key](https://platform.openai.com/api-keys)
  - [Microsoft Azure Speech API key](https://azure.microsoft.com/en-us/products/cognitive-services/speech-services)
  - [Google Cloud API key](https://cloud.google.com/text-to-speech) with Text-to-Speech API enabled
- For speech-to-text functionality, you need an [AssemblyAI API key](https://www.assemblyai.com/docs/getting-started)

## Usage

### Text-to-Speech

#### Using ElevenLabs

```javascript
const result = await mintflow.speech.textToSpeech({
  provider: 'elevenlabs',
  apiKey: 'your-elevenlabs-api-key',
  text: 'Hello, this is a test of the text to speech functionality.',
  voice: 'voice-id', // Voice ID from ElevenLabs
  model: 'eleven_turbo_v2', // Optional, defaults to eleven_turbo_v2
  stability: 0.5, // Optional, controls stability (0.0 to 1.0)
  similarityBoost: 0.75, // Optional, controls similarity boost (0.0 to 1.0)
  style: 0.0, // Optional, controls speaking style (0.0 to 1.0)
  speakerBoost: true, // Optional, enhances speaker clarity
  outputFormat: 'mp3' // Optional, one of: mp3, pcm, wav, flac
});

console.log(result.audioData); // Base64 encoded audio data
console.log(result.mimeType); // MIME type of the audio (e.g., audio/mpeg)
console.log(result.provider); // 'elevenlabs'
```

#### Using OpenAI

```javascript
const result = await mintflow.speech.textToSpeech({
  provider: 'openai',
  apiKey: 'your-openai-api-key',
  text: 'Hello, this is a test of the text to speech functionality.',
  voice: 'alloy', // One of: alloy, echo, fable, onyx, nova, shimmer
  speed: 1.0, // Optional, controls speech speed (0.25 to 4.0)
  outputFormat: 'mp3' // Optional, one of: mp3, wav, ogg, flac, webm
});
```

#### Using Microsoft Azure

```javascript
const result = await mintflow.speech.textToSpeech({
  provider: 'microsoft',
  apiKey: 'eastus:your-azure-api-key', // Format: region:key
  text: 'Hello, this is a test of the text to speech functionality.',
  voice: 'en-US-JennyNeural', // Voice ID from Microsoft
  language: 'en-US', // Optional, language code
  pitch: '+10%', // Optional, controls pitch
  rate: 'slow', // Optional, controls speech rate
  outputFormat: 'mp3' // Optional, one of: mp3, wav, ogg, webm
});
```

#### Using Google Cloud

```javascript
const result = await mintflow.speech.textToSpeech({
  provider: 'google',
  apiKey: 'your-google-api-key',
  text: 'Hello, this is a test of the text to speech functionality.',
  voice: 'en-US-Standard-A', // Voice ID from Google
  language: 'en-US', // Optional, language code
  outputFormat: 'mp3' // Optional, one of: mp3, wav, ogg
});
```

### Get Available Voices

List available voices from any provider:

```javascript
// ElevenLabs voices
const elevenLabsVoices = await mintflow.speech.getVoices({
  provider: 'elevenlabs',
  apiKey: 'your-elevenlabs-api-key'
});

// OpenAI voices
const openaiVoices = await mintflow.speech.getVoices({
  provider: 'openai',
  apiKey: 'your-openai-api-key'
});

// Microsoft voices (optionally filtered by language)
const microsoftVoices = await mintflow.speech.getVoices({
  provider: 'microsoft',
  apiKey: 'eastus:your-azure-api-key',
  language: 'en-US' // Optional, filter by language
});

// Google voices (optionally filtered by language)
const googleVoices = await mintflow.speech.getVoices({
  provider: 'google',
  apiKey: 'your-google-api-key',
  language: 'en-US' // Optional, filter by language
});
```

### Speech-to-Text

Transcribe audio to text using AssemblyAI:

```javascript
// Option 1: Transcribe from a URL
const result = await mintflow.speech.speechToText({
  apiKey: 'your-assemblyai-api-key',
  audioUrl: 'https://example.com/audio.mp3',
  language: 'en', // Optional, language code
  speakerLabels: true, // Optional, identify different speakers
  sentimentAnalysis: true, // Optional, analyze sentiment
  entityDetection: true, // Optional, detect entities
  waitUntilReady: true // Optional, wait for transcription to complete
});

// Option 2: Transcribe from base64 audio data
const result = await mintflow.speech.speechToText({
  apiKey: 'your-assemblyai-api-key',
  audioData: 'base64-encoded-audio-data',
  audioMimeType: 'audio/mp3',
  waitUntilReady: true
});

console.log(result.text); // Transcribed text
console.log(result.words); // Word-level details if available
console.log(result.sentiment); // Sentiment analysis results if requested
console.log(result.entities); // Detected entities if requested
```

### Check Transcription Status

Check the status of an ongoing transcription:

```javascript
const status = await mintflow.speech.getTranscriptionStatus({
  apiKey: 'your-assemblyai-api-key',
  transcriptId: 'transcript-id-from-previous-request'
});

console.log(status.status); // Status of the transcription (e.g., 'completed', 'processing')
console.log(status.text); // Transcribed text if completed
```

## Advanced Features

### Text-to-Speech Options

#### ElevenLabs-specific Options
- **Model Selection**: Choose between different ElevenLabs models for different quality levels and use cases
- **Voice Settings**: Adjust stability, similarity boost, style, and speaker boost to fine-tune the voice output

#### OpenAI-specific Options
- **Speed Control**: Adjust the speaking speed from 0.25 to 4.0

#### Microsoft-specific Options
- **Pitch and Rate**: Control the pitch and speaking rate of the voice
- **SSML Support**: Advanced control using Speech Synthesis Markup Language

#### Common Options
- **Output Format**: Select from mp3, pcm, wav, flac, ogg, or webm formats (availability depends on provider)
- **Language Selection**: Choose from a wide range of languages and regional accents

### Speech-to-Text Options

- **Speaker Labels**: Identify different speakers in the audio
- **Sentiment Analysis**: Analyze the sentiment of the transcribed text
- **Entity Detection**: Identify entities like names, places, organizations, etc.
- **PII Redaction**: Redact personally identifiable information from the transcript and/or audio
- **Formatting Options**: Control punctuation, formatting, and disfluencies
- **Webhook Support**: Receive notifications when transcription is complete

## Error Handling

The plugin includes comprehensive error handling:

```javascript
try {
  const result = await mintflow.speech.textToSpeech({
    provider: 'elevenlabs',
    apiKey: 'your-elevenlabs-api-key',
    text: 'Hello world',
    voice: 'voice-id'
  });
  console.log(result.audioData);
} catch (error) {
  console.error('Error:', error.message);
}
```

## License

MIT
