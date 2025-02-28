import axios from 'axios';
import { AssemblyAI } from 'assemblyai';

export interface SpeechToTextInput {
  apiKey: string;
  audioUrl?: string;
  audioData?: string;
  audioMimeType?: string;
  language?: string;
  speakerLabels?: boolean;
  punctuate?: boolean;
  formatText?: boolean;
  disfluencies?: boolean;
  sentimentAnalysis?: boolean;
  entityDetection?: boolean;
  autoPunctuation?: boolean;
  filterProfanity?: boolean;
  redactPII?: boolean;
  redactPIIAudio?: boolean;
  redactPIICategories?: string[];
  webhookUrl?: string;
  waitUntilReady?: boolean;
}

export interface SpeechToTextOutput {
  id: string;
  text: string;
  status: string;
  audioUrl?: string;
  words?: any[];
  utterances?: any[];
  confidence?: number;
  durationMs?: number;
  language?: string;
  sentiment?: any;
  entities?: any[];
  error?: string;
}

/**
 * Convert speech to text using AssemblyAI API
 * 
 * @param input The input parameters
 * @returns The transcription result
 */
export async function speechToText(input: SpeechToTextInput): Promise<SpeechToTextOutput> {
  try {
    // Initialize the AssemblyAI client
    const assemblyai = new AssemblyAI({
      apiKey: input.apiKey
    });

    // Prepare the transcription parameters
    const params: any = {
      audio_url: input.audioUrl,
      language_code: input.language,
      speaker_labels: input.speakerLabels,
      punctuate: input.punctuate,
      format_text: input.formatText,
      disfluencies: input.disfluencies,
      sentiment_analysis: input.sentimentAnalysis,
      entity_detection: input.entityDetection,
      auto_punctuation: input.autoPunctuation,
      filter_profanity: input.filterProfanity,
      redact_pii: input.redactPII,
      redact_pii_audio: input.redactPIIAudio,
      redact_pii_policies: input.redactPIICategories,
      webhook_url: input.webhookUrl
    };

    // Remove undefined parameters
    Object.keys(params).forEach(key => {
      if (params[key] === undefined) {
        delete params[key];
      }
    });

    // If audio data is provided instead of a URL, upload it first
    if (!input.audioUrl && input.audioData) {
      // Convert base64 to buffer
      const audioBuffer = Buffer.from(input.audioData, 'base64');
      
      // Upload the audio file
      const uploadResponse = await assemblyai.transcripts.upload(audioBuffer);
      params.audio_url = uploadResponse.upload_url;
    }

    // Submit the transcription request
    const transcript = await assemblyai.transcripts.submit(params);

    // If waitUntilReady is true, wait for the transcription to complete
    if (input.waitUntilReady) {
      const result = await assemblyai.transcripts.waitUntilDone(transcript.id);
      
      return {
        id: result.id,
        text: result.text || '',
        status: result.status,
        audioUrl: result.audio_url,
        words: result.words,
        utterances: result.utterances,
        confidence: result.confidence,
        durationMs: result.audio_duration,
        language: result.language_code,
        sentiment: result.sentiment_analysis_results,
        entities: result.entities,
        error: result.error
      };
    }

    // Otherwise, return the initial response
    return {
      id: transcript.id,
      text: '',
      status: transcript.status,
      audioUrl: transcript.audio_url
    };
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      throw new Error(`AssemblyAI API Error: ${error.response?.data?.message || error.message}`);
    }
    throw new Error(`AssemblyAI Error: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Get the status of a transcription job
 * 
 * @param apiKey The AssemblyAI API key
 * @param transcriptId The ID of the transcript to check
 * @returns The transcription result
 */
export async function getTranscriptionStatus(apiKey: string, transcriptId: string): Promise<SpeechToTextOutput> {
  try {
    // Initialize the AssemblyAI client
    const assemblyai = new AssemblyAI({
      apiKey: apiKey
    });

    // Get the transcript
    const result = await assemblyai.transcripts.get(transcriptId);

    return {
      id: result.id,
      text: result.text || '',
      status: result.status,
      audioUrl: result.audio_url,
      words: result.words,
      utterances: result.utterances,
      confidence: result.confidence,
      durationMs: result.audio_duration,
      language: result.language_code,
      sentiment: result.sentiment_analysis_results,
      entities: result.entities,
      error: result.error
    };
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      throw new Error(`AssemblyAI API Error: ${error.response?.data?.message || error.message}`);
    }
    throw new Error(`AssemblyAI Error: ${error.message || 'Unknown error'}`);
  }
}
