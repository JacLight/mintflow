import { createAssemblyAIClient } from '../common.js';

export interface LemurTaskInput {
  apiKey: string;
  transcriptIds: string[];
  prompt: string;
  context?: string;
  final_model?: string;
  max_output_size?: number;
  temperature?: number;
}

export interface LemurTaskOutput {
  id: string;
  request: {
    prompt: string;
    context?: string;
    transcript_ids: string[];
    final_model?: string;
    max_output_size?: number;
    temperature?: number;
  };
  response: string;
  status: string;
  error?: string;
}

/**
 * Run a LeMUR task to analyze transcripts with AI
 * 
 * @param input The input parameters
 * @returns The LeMUR task result
 */
export async function lemurTask(input: LemurTaskInput): Promise<LemurTaskOutput> {
  try {
    const client = createAssemblyAIClient(input.apiKey);
    
    // Prepare the LeMUR task parameters
    const taskParams: any = {
      transcript_ids: input.transcriptIds,
      prompt: input.prompt,
      context: input.context,
      final_model: input.final_model,
      max_output_size: input.max_output_size,
      temperature: input.temperature
    };
    
    // Remove undefined parameters
    Object.keys(taskParams).forEach(key => {
      if (taskParams[key] === undefined) {
        delete taskParams[key];
      }
    });
    
    // Submit the LeMUR task
    const taskResponse = await client.lemur.task(taskParams);
    
    return {
      id: (taskResponse as any).id,
      request: {
        prompt: (taskResponse as any).request.prompt,
        context: (taskResponse as any).request.context,
        transcript_ids: (taskResponse as any).request.transcript_ids,
        final_model: (taskResponse as any).request.final_model,
        max_output_size: (taskResponse as any).request.max_output_size,
        temperature: (taskResponse as any).request.temperature
      },
      response: taskResponse.response,
      status: (taskResponse as any).status,
      error: (taskResponse as any).error
    };
  } catch (error: any) {
    throw new Error(`AssemblyAI LeMUR Task Error: ${error.message}`);
  }
}
