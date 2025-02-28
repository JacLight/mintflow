import {
  textToSpeech,
  getVoices,
  speechToText,
  getTranscriptionStatus,
  TextToSpeechInput,
  TextToSpeechOutput,
  SpeechToTextInput,
  SpeechToTextOutput
} from './actions/index.js';

const speechPlugin = {
  name: "Speech",
  icon: "FaMicrophone",
  description: "Convert text to speech and speech to text using various AI services",
  id: "speech",
  runner: "node",
  inputSchema: {
    type: "object",
    properties: {
      // Common properties
      text: { type: 'string' },
      voice: { type: 'string' },
      language: { type: 'string' },
      outputFormat: { 
        type: 'string', 
        enum: ['mp3', 'pcm', 'wav', 'flac', 'ogg', 'webm'] 
      },
      
      // Provider selection
      provider: { 
        type: 'string', 
        enum: ['elevenlabs', 'openai', 'microsoft', 'google'] 
      },
      
      // API keys for different providers
      apiKey: { type: 'string' },
      
      // ElevenLabs specific properties
      model: { type: 'string' },
      stability: { type: 'number' },
      similarityBoost: { type: 'number' },
      style: { type: 'number' },
      speakerBoost: { type: 'boolean' },
      
      // OpenAI specific properties
      speed: { type: 'number' },
      
      // Microsoft specific properties
      pitch: { type: 'string' },
      rate: { type: 'string' },
      
      // Speech-to-Text properties
      audioUrl: { type: 'string' },
      audioData: { type: 'string' },
      audioMimeType: { type: 'string' },
      speakerLabels: { type: 'boolean' },
      punctuate: { type: 'boolean' },
      formatText: { type: 'boolean' },
      disfluencies: { type: 'boolean' },
      sentimentAnalysis: { type: 'boolean' },
      entityDetection: { type: 'boolean' },
      autoPunctuation: { type: 'boolean' },
      filterProfanity: { type: 'boolean' },
      redactPII: { type: 'boolean' },
      redactPIIAudio: { type: 'boolean' },
      redactPIICategories: { type: 'array', items: { type: 'string' } },
      webhookUrl: { type: 'string' },
      waitUntilReady: { type: 'boolean' },
      
      // Transcription status check
      transcriptId: { type: 'string' }
    }
  },
  documentation: "https://docs.mintflow.com/plugins/speech",
  actions: [
    {
      name: 'textToSpeech',
      execute: async function(input: TextToSpeechInput): Promise<TextToSpeechOutput> {
        return textToSpeech({
          apiKey: input.apiKey,
          text: input.text,
          voice: input.voice,
          provider: input.provider,
          model: input.model,
          stability: input.stability,
          similarityBoost: input.similarityBoost,
          style: input.style,
          speakerBoost: input.speakerBoost,
          speed: input.speed,
          pitch: input.pitch,
          rate: input.rate,
          outputFormat: input.outputFormat,
          language: input.language
        });
      }
    },
    {
      name: 'getVoices',
      execute: async function(input: { provider: string, apiKey: string, language?: string }): Promise<any[]> {
        return getVoices(input.provider, input.apiKey, input.language);
      }
    },
    {
      name: 'speechToText',
      execute: async function(input: SpeechToTextInput): Promise<SpeechToTextOutput> {
        return speechToText({
          apiKey: input.apiKey,
          audioUrl: input.audioUrl,
          audioData: input.audioData,
          audioMimeType: input.audioMimeType,
          language: input.language,
          speakerLabels: input.speakerLabels,
          punctuate: input.punctuate,
          formatText: input.formatText,
          disfluencies: input.disfluencies,
          sentimentAnalysis: input.sentimentAnalysis,
          entityDetection: input.entityDetection,
          autoPunctuation: input.autoPunctuation,
          filterProfanity: input.filterProfanity,
          redactPII: input.redactPII,
          redactPIIAudio: input.redactPIIAudio,
          redactPIICategories: input.redactPIICategories,
          webhookUrl: input.webhookUrl,
          waitUntilReady: input.waitUntilReady
        });
      }
    },
    {
      name: 'getTranscriptionStatus',
      execute: async function(input: { apiKey: string, transcriptId: string }): Promise<SpeechToTextOutput> {
        return getTranscriptionStatus(input.apiKey, input.transcriptId);
      }
    }
  ]
};

export default speechPlugin;
