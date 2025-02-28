import { createAssemblyAIClient } from '../common.js';

export interface TranscribeInput {
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

export interface TranscribeOutput {
  id: string;
  status: string;
  text: string;
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
 * Transcribe audio to text using AssemblyAI
 * 
 * @param input The input parameters
 * @returns The transcription result
 */
export async function transcribe(input: TranscribeInput): Promise<TranscribeOutput> {
  try {
    const client = createAssemblyAIClient(input.apiKey);
    
    // Prepare the transcription parameters
    const transcriptParams: any = {
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
    Object.keys(transcriptParams).forEach(key => {
      if (transcriptParams[key] === undefined) {
        delete transcriptParams[key];
      }
    });
    
    // Handle audio data if provided
    if (input.audioData && !input.audioUrl) {
      // Upload the audio data
      const uploadResponse = await client.transcripts.upload({
        data: Buffer.from(input.audioData, 'base64'),
        contentType: input.audioMimeType || 'audio/mpeg'
      });
      
      transcriptParams.audio_url = uploadResponse.upload_url;
    }
    
    // Submit the transcription request
    const transcript = await client.transcripts.submit(transcriptParams);
    
    // Wait for the transcription to complete if requested
    if (input.waitUntilReady) {
      const completedTranscript = await client.transcripts.waitUntilDone(transcript.id);
      
      return {
        id: completedTranscript.id,
        status: completedTranscript.status,
        text: completedTranscript.text || '',
        audioUrl: completedTranscript.audio_url,
        words: completedTranscript.words,
        utterances: completedTranscript.utterances,
        confidence: completedTranscript.confidence,
        durationMs: completedTranscript.audio_duration,
        language: completedTranscript.language_code,
        sentiment: completedTranscript.sentiment_analysis_results,
        entities: completedTranscript.entities,
        error: completedTranscript.error
      };
    }
    
    // Return the initial transcript information
    return {
      id: transcript.id,
      status: transcript.status,
      text: '',
      audioUrl: transcript.audio_url
    };
  } catch (error: any) {
    throw new Error(`AssemblyAI Transcription Error: ${error.message}`);
  }
}
