import axios from 'axios';
import { ElevenLabsClient } from 'elevenlabs';

export interface TextToSpeechInput {
  apiKey: string;
  text: string;
  voice: string;
  provider: 'elevenlabs' | 'openai' | 'microsoft' | 'google';

  // ElevenLabs specific parameters
  model?: string;
  stability?: number;
  similarityBoost?: number;
  style?: number;
  speakerBoost?: boolean;

  // OpenAI specific parameters
  speed?: number;

  // Microsoft specific parameters
  pitch?: string;
  rate?: string;

  // Common parameters
  outputFormat?: 'mp3' | 'pcm' | 'wav' | 'flac' | 'ogg' | 'webm';
  language?: string;
}

export interface TextToSpeechOutput {
  audioData: string; // Base64 encoded audio data
  mimeType: string;
  provider: string;
}

/**
 * Convert text to speech using ElevenLabs API
 * 
 * @param input The input parameters
 * @returns The audio data as a base64 encoded string
 */
export async function textToSpeechElevenLabs(input: Omit<TextToSpeechInput, 'provider'>): Promise<TextToSpeechOutput> {
  try {
    // Initialize the ElevenLabs client
    const elevenlabs = new ElevenLabsClient({
      apiKey: input.apiKey,
    });

    // Set the options for the text-to-speech request
    const options: any = {
      voice: input.voice,
      text: input.text,
      model: input.model || 'eleven_turbo_v2',
      outputFormat: input.outputFormat || 'mp3',
    };

    // Add optional parameters if provided
    if (input.stability !== undefined) options.voiceSettings = { stability: input.stability };
    if (input.similarityBoost !== undefined) options.voiceSettings = { ...options.voiceSettings, similarity_boost: input.similarityBoost };
    if (input.style !== undefined) options.voiceSettings = { ...options.voiceSettings, style: input.style };
    if (input.speakerBoost !== undefined) options.voiceSettings = { ...options.voiceSettings, speaker_boost: input.speakerBoost };

    // Generate the audio
    const audio = await elevenlabs.generate(options);

    // Collect the audio chunks
    const chunks: any[] = [];
    for await (const chunk of audio) {
      chunks.push(chunk);
    }

    // Combine the chunks into a single buffer
    const audioBuffer = Buffer.concat(chunks);

    // Convert the buffer to a base64 encoded string
    const audioData = audioBuffer.toString('base64');

    // Determine the MIME type based on the output format
    let mimeType = 'audio/mpeg';
    if (input.outputFormat === 'wav') mimeType = 'audio/wav';
    if (input.outputFormat === 'flac') mimeType = 'audio/flac';
    if (input.outputFormat === 'pcm') mimeType = 'audio/pcm';

    return {
      audioData,
      mimeType,
      provider: 'elevenlabs'
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`ElevenLabs API Error: ${error.response?.data?.message || error.message}`);
    }
    throw error;
  }
}

/**
 * Convert text to speech using OpenAI API
 * 
 * @param input The input parameters
 * @returns The audio data as a base64 encoded string
 */
export async function textToSpeechOpenAI(input: Omit<TextToSpeechInput, 'provider'>): Promise<TextToSpeechOutput> {
  try {
    // Set the options for the text-to-speech request
    const options = {
      model: 'tts-1', // or 'tts-1-hd' for higher quality
      voice: input.voice, // 'alloy', 'echo', 'fable', 'onyx', 'nova', or 'shimmer'
      input: input.text,
      response_format: input.outputFormat || 'mp3',
      speed: input.speed || 1.0
    };

    // Make the API request
    const response = await axios.post('https://api.openai.com/v1/audio/speech', options, {
      headers: {
        'Authorization': `Bearer ${input.apiKey}`,
        'Content-Type': 'application/json'
      },
      responseType: 'arraybuffer'
    });

    // Convert the audio buffer to a base64 encoded string
    const audioData = Buffer.from(response.data).toString('base64');

    // Determine the MIME type based on the output format
    let mimeType = 'audio/mpeg';
    if (input.outputFormat === 'wav') mimeType = 'audio/wav';
    if (input.outputFormat === 'flac') mimeType = 'audio/flac';
    if (input.outputFormat === 'ogg') mimeType = 'audio/ogg';
    if (input.outputFormat === 'webm') mimeType = 'audio/webm';

    return {
      audioData,
      mimeType,
      provider: 'openai'
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`OpenAI API Error: ${error.response?.data?.message || error.message}`);
    }
    throw error;
  }
}

/**
 * Convert text to speech using Microsoft Azure API
 * 
 * @param input The input parameters
 * @returns The audio data as a base64 encoded string
 */
export async function textToSpeechMicrosoft(input: Omit<TextToSpeechInput, 'provider'>): Promise<TextToSpeechOutput> {
  try {
    // Get the region from the API key (format: region:key)
    const [region, key] = input.apiKey?.includes(':') ? input.apiKey?.split(':') : ['eastus', input.apiKey];

    // Get access token
    const tokenResponse = await axios.post(
      `https://${region}.api.cognitive.microsoft.com/sts/v1.0/issueToken`,
      null,
      {
        headers: {
          'Ocp-Apim-Subscription-Key': key,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const accessToken = tokenResponse.data;

    // Prepare SSML
    const language = input.language || 'en-US';
    const pitch = input.pitch || 'default';
    const rate = input.rate || 'default';

    const ssml = `
      <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${language}">
         <voice xml:lang='en-US' xml:gender='Male' name='${input.voice || "en-US-AvaMultilingualNeural"}'>
          <prosody pitch="${pitch}" rate="${rate}">
            ${input.text}
          </prosody>
        </voice>
      </speak>
    `;

    // Determine output format
    let outputFormat = 'audio-24khz-96kbitrate-mono-mp3';
    if (input.outputFormat === 'wav') outputFormat = 'riff-24khz-16bit-mono-pcm';
    if (input.outputFormat === 'ogg') outputFormat = 'ogg-24khz-16bit-mono-opus';
    if (input.outputFormat === 'webm') outputFormat = 'webm-24khz-16bit-mono-opus';

    // Make the API request
    const response = await axios.post(
      `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`,
      ssml,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/ssml+xml',
          'X-Microsoft-OutputFormat': outputFormat,
          'User-Agent': 'MintFlow'
        },
        responseType: 'arraybuffer'
      }
    );

    // Convert the audio buffer to a base64 encoded string
    const audioData = Buffer.from(response.data).toString('base64');

    // Determine the MIME type based on the output format
    let mimeType = 'audio/mpeg';
    if (input.outputFormat === 'wav') mimeType = 'audio/wav';
    if (input.outputFormat === 'ogg') mimeType = 'audio/ogg';
    if (input.outputFormat === 'webm') mimeType = 'audio/webm';

    return {
      audioData,
      mimeType,
      provider: 'microsoft'
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Microsoft API Error: ${error.response?.data?.message || error.message}`);
    }
    throw error;
  }
}

/**
 * Convert text to speech using Google Text-to-Speech API
 * 
 * @param input The input parameters
 * @returns The audio data as a base64 encoded string
 */
export async function textToSpeechGoogle(input: Omit<TextToSpeechInput, 'provider'>): Promise<TextToSpeechOutput> {
  try {
    // Prepare the request body
    const requestBody = {
      input: { text: input.text },
      voice: {
        languageCode: input.language || 'en-US',
        name: input.voice
      },
      audioConfig: {
        audioEncoding: input.outputFormat === 'mp3' ? 'MP3' :
          input.outputFormat === 'wav' ? 'LINEAR16' :
            input.outputFormat === 'ogg' ? 'OGG_OPUS' : 'MP3'
      }
    };

    // Make the API request
    const response = await axios.post(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${input.apiKey}`,
      requestBody,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    // The response contains base64 encoded audio data
    const audioData = response.data.audioContent;

    // Determine the MIME type based on the output format
    let mimeType = 'audio/mpeg';
    if (input.outputFormat === 'wav') mimeType = 'audio/wav';
    if (input.outputFormat === 'ogg') mimeType = 'audio/ogg';

    return {
      audioData,
      mimeType,
      provider: 'google'
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Google API Error: ${error.response?.data?.error?.message || error.message}`);
    }
    throw error;
  }
}

/**
 * Convert text to speech using the specified provider
 * 
 * @param input The input parameters
 * @returns The audio data as a base64 encoded string
 */
export async function textToSpeech(input: TextToSpeechInput): Promise<TextToSpeechOutput> {
  if (input.provider === 'elevenlabs') {
    return textToSpeechElevenLabs(input);
  } else if (input.provider === 'openai') {
    return textToSpeechOpenAI(input);
  } else if (input.provider === 'microsoft') {
    return textToSpeechMicrosoft(input);
  } else if (input.provider === 'google') {
    return textToSpeechGoogle(input);
  } else {
    throw new Error(`Unsupported text-to-speech provider: ${input.provider}`);
  }
}

/**
 * Get available voices from ElevenLabs API
 * 
 * @param apiKey The ElevenLabs API key
 * @returns An array of voice objects
 */
export async function getElevenLabsVoices(apiKey: string): Promise<any[]> {
  try {
    const response = await axios.get('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json'
      }
    });

    return response.data.voices.map((voice: any) => ({
      id: voice.voice_id,
      name: voice.name,
      description: voice.description || '',
      previewUrl: voice.preview_url || '',
      category: voice.category || 'premium',
      provider: 'elevenlabs'
    }));
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`ElevenLabs API Error: ${error.response?.data?.message || error.message}`);
    }
    throw error;
  }
}

/**
 * Get available voices from OpenAI API
 * 
 * @returns An array of voice objects
 */
export function getOpenAIVoices(): any[] {
  // OpenAI has a fixed set of voices
  return [
    { id: 'alloy', name: 'Alloy', description: 'Versatile, balanced voice', provider: 'openai' },
    { id: 'echo', name: 'Echo', description: 'Soft, warm voice', provider: 'openai' },
    { id: 'fable', name: 'Fable', description: 'Narrative, soothing voice', provider: 'openai' },
    { id: 'onyx', name: 'Onyx', description: 'Deep, authoritative voice', provider: 'openai' },
    { id: 'nova', name: 'Nova', description: 'Energetic, bright voice', provider: 'openai' },
    { id: 'shimmer', name: 'Shimmer', description: 'Clear, optimistic voice', provider: 'openai' }
  ];
}

/**
 * Get available voices from Microsoft Azure API
 * 
 * @param apiKey The Microsoft API key (format: region:key)
 * @param language The language code to filter voices by
 * @returns An array of voice objects
 */
export async function getMicrosoftVoices(apiKey: string, language?: string): Promise<any[]> {
  try {
    // Get the region from the API key (format: region:key)
    const [region, key] = apiKey.includes(':') ? apiKey.split(':') : ['eastus', apiKey];

    // Get access token
    const tokenResponse = await axios.post(
      `https://${region}.api.cognitive.microsoft.com/sts/v1.0/issueToken`,
      null,
      {
        headers: {
          'Ocp-Apim-Subscription-Key': key,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const accessToken = tokenResponse.data;

    // Get voices
    const response = await axios.get(
      `https://${region}.tts.speech.microsoft.com/cognitiveservices/voices/list`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    // Filter by language if specified
    let voices = response.data;
    if (language) {
      voices = voices.filter((voice: any) => voice.Locale.toLowerCase() === language.toLowerCase());
    }

    return voices.map((voice: any) => ({
      id: voice.ShortName,
      name: voice.DisplayName,
      description: `${voice.Gender} voice, ${voice.LocaleName}`,
      language: voice.Locale,
      gender: voice.Gender,
      provider: 'microsoft'
    }));
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Microsoft API Error: ${error.response?.data?.message || error.message}`);
    }
    throw error;
  }
}

/**
 * Get available voices from Google Text-to-Speech API
 * 
 * @param apiKey The Google API key
 * @param language The language code to filter voices by
 * @returns An array of voice objects
 */
export async function getGoogleVoices(apiKey: string, language?: string): Promise<any[]> {
  try {
    const response = await axios.get(
      `https://texttospeech.googleapis.com/v1/voices?key=${apiKey}`
    );

    // Filter by language if specified
    let voices = response.data.voices;
    if (language) {
      voices = voices.filter((voice: any) =>
        voice.languageCodes.some((code: string) => code.toLowerCase() === language.toLowerCase())
      );
    }

    return voices.map((voice: any) => ({
      id: voice.name,
      name: voice.name.split('-').pop(),
      description: `${voice.ssmlGender} voice, ${voice.languageCodes.join(', ')}`,
      languages: voice.languageCodes,
      gender: voice.ssmlGender,
      provider: 'google'
    }));
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Google API Error: ${error.response?.data?.error?.message || error.message}`);
    }
    throw error;
  }
}

/**
 * Get available voices from the specified provider
 * 
 * @param provider The provider to get voices from
 * @param apiKey The API key for the provider
 * @param language Optional language code to filter voices by
 * @returns An array of voice objects
 */
export async function getVoices(provider: string, apiKey: string, language?: string): Promise<any[]> {
  if (provider === 'elevenlabs') {
    return getElevenLabsVoices(apiKey);
  } else if (provider === 'openai') {
    return getOpenAIVoices();
  } else if (provider === 'microsoft') {
    return getMicrosoftVoices(apiKey, language);
  } else if (provider === 'google') {
    return getGoogleVoices(apiKey, language);
  } else {
    throw new Error(`Unsupported voice provider: ${provider}`);
  }
}
