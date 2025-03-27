import { createAssemblyAIClient } from '../common.js';

export interface GetTranscriptStatusInput {
  apiKey: string;
  transcriptId: string;
}

export interface GetTranscriptStatusOutput {
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
 * Get the status of a transcription
 * 
 * @param input The input parameters
 * @returns The transcription status
 */
export async function getTranscriptStatus(input: GetTranscriptStatusInput): Promise<GetTranscriptStatusOutput> {
  try {
    const client = createAssemblyAIClient(input.apiKey);
    
    // Get the transcript
    const transcript = await client.transcripts.get(input.transcriptId);
    
    return {
      id: transcript.id,
      status: transcript.status,
      text: transcript.text || '',
      audioUrl: transcript.audio_url,
      words: transcript.words || [],
      utterances: transcript.utterances || [],
      confidence: transcript.confidence || undefined,
      durationMs: transcript.audio_duration || undefined,
      language: transcript.language_code,
      sentiment: transcript.sentiment_analysis_results,
      entities: transcript.entities || [],
      error: transcript.error
    };
  } catch (error: any) {
    throw new Error(`AssemblyAI Get Transcript Status Error: ${error.message}`);
  }
}
