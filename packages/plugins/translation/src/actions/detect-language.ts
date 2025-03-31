import axios from 'axios';

export interface DetectLanguageInput {
  apiKey: string;
  text: string;
  provider: 'google';
}

export interface DetectLanguageOutput {
  detectedLanguage: string;
  confidence: number;
  provider: string;
}

/**
 * Detect the language of a text using Google Translate API
 * 
 * @param input The input parameters
 * @returns The detected language
 */
export async function detectLanguageGoogle(input: Omit<DetectLanguageInput, 'provider'>): Promise<DetectLanguageOutput> {
  try {
    const GOOGLE_DETECT_URL = 'https://translation.googleapis.com/language/translate/v2/detect';
    
    // Make the API request
    const response = await axios.post(GOOGLE_DETECT_URL, null, {
      params: {
        q: input.text,
        key: input.apiKey
      }
    });

    // Extract the detected language
    const data = response.data.data;
    if (!data || !data.detections || data.detections.length === 0 || data.detections[0].length === 0) {
      throw new Error('No language detection results returned from Google Translate API');
    }

    const detection = data.detections[0][0];
    return {
      detectedLanguage: detection.language,
      confidence: detection.confidence,
      provider: 'google'
    };
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Google Translate API Error: ${error.response?.data?.error?.message || error.message}`);
    }
    throw new Error(`Google Translate Error: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Detect the language of a text using the specified provider
 * 
 * @param input The input parameters
 * @returns The detected language
 */
export async function detectLanguage(input: DetectLanguageInput): Promise<DetectLanguageOutput> {
  if (input.provider === 'google') {
    return detectLanguageGoogle(input);
  } else {
    throw new Error(`Unsupported language detection provider: ${input.provider}`);
  }
}
