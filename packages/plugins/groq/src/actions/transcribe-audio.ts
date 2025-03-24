import axios from 'axios';
import FormData from 'form-data';

export const transcribeAudio = {
  name: 'transcribe_audio',
  displayName: 'Transcribe Audio',
  description: 'Transcribes audio into text in the input language.',
  inputSchema: {
    type: 'object',
    properties: {
      file: {
        type: 'object',
        description: 'The audio file to transcribe. Supported formats: flac, mp3, mp4, mpeg, mpga, m4a, ogg, wav, webm.',
        properties: {
          data: {
            type: 'string',
            description: 'The base64-encoded content of the file',
          },
          filename: {
            type: 'string',
            description: 'The name of the file',
          },
        },
        required: ['data', 'filename'],
      },
      model: {
        type: 'string',
        description: 'The model to use for transcription.',
        enum: [
          'whisper-large-v3',
        ],
        default: 'whisper-large-v3',
        required: true,
      },
      language: {
        type: 'string',
        description: 'The language of the input audio in ISO-639-1 format (e.g., "en" for English). This will improve accuracy and latency.',
        required: false,
      },
      prompt: {
        type: 'string',
        description: 'An optional text to guide the model\'s style or continue a previous audio segment. The prompt should match the audio language.',
        required: false,
      },
      temperature: {
        type: 'number',
        description: 'The sampling temperature, between 0 and 1. Higher values like 0.8 will make the output more random, while lower values like 0.2 will make it more focused and deterministic.',
        default: 0,
        required: false,
      },
      responseFormat: {
        type: 'string',
        description: 'The format of the transcript output.',
        enum: ['json', 'text', 'verbose_json'],
        default: 'json',
        required: false,
      },
    },
    required: ['file', 'model'],
  },
  outputSchema: {
    type: 'object',
    properties: {
      text: {
        type: 'string',
        description: 'The transcribed text',
      },
    },
  },
  exampleInput: {
    file: {
      data: 'base64-encoded-audio-data',
      filename: 'audio.mp3',
    },
    model: 'whisper-large-v3',
    language: 'en',
    temperature: 0,
    responseFormat: 'json',
  },
  exampleOutput: {
    text: 'This is a transcription of the audio file.',
  },
  async execute(input: any, auth: { apiKey: string }): Promise<any> {
    const { file, model, language, prompt, temperature, responseFormat } = input;

    // Create form data
    const formData = new FormData();
    formData.append('file', Buffer.from(file.data, 'base64'), file.filename);
    formData.append('model', model);

    if (language) formData.append('language', language);
    if (prompt) formData.append('prompt', prompt);
    if (temperature !== undefined) formData.append('temperature', temperature.toString());
    if (responseFormat) formData.append('response_format', responseFormat);

    try {
      const response = await axios({
        method: 'POST',
        url: 'https://api.groq.com/openai/v1/audio/transcriptions',
        headers: {
          'Authorization': `Bearer ${auth.apiKey}`,
          ...formData.getHeaders(),
        },
        data: formData,
      });

      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(`Groq API error: ${error.response.status} - ${error.response.data.error?.message || error.response.statusText}`);
      }
      throw new Error(`Failed to make request to Groq: ${error.message}`);
    }
  },
};
