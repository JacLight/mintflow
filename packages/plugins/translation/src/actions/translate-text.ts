import axios from 'axios';

export interface TranslateTextInput {
  apiKey: string;
  text: string;
  targetLang: string;
  sourceLang?: string;
  provider: 'deepl' | 'google';
  splitSentences?: '0' | '1' | 'nonewlines';
  preserveFormatting?: boolean;
  formality?: 'default' | 'more' | 'less' | 'prefer_more' | 'prefer_less';
  glossaryId?: string;
  tagHandling?: 'xml' | 'html';
  outlineDetection?: boolean;
  nonSplittingTags?: string;
  splittingTags?: string;
  ignoreTags?: string;
}

export interface TranslateTextOutput {
  translatedText: string;
  detectedSourceLang?: string;
  provider: string;
}

/**
 * Translate text using DeepL API
 * 
 * @param input The input parameters
 * @returns The translated text
 */
export async function translateTextDeepL(input: Omit<TranslateTextInput, 'provider'>): Promise<TranslateTextOutput> {
  try {
    const DEEPL_FREE_URL = 'https://api-free.deepl.com/v2/translate';
    const DEEPL_PAID_URL = 'https://api.deepl.com/v2/translate';
    
    // Determine if this is a free or paid API key
    const isPaid = !input.apiKey.endsWith(':fx');
    const url = isPaid ? DEEPL_PAID_URL : DEEPL_FREE_URL;

    // Prepare the request parameters
    const params: any = {
      text: [input.text],
      target_lang: input.targetLang,
      source_lang: input.sourceLang,
      split_sentences: input.splitSentences,
      preserve_formatting: input.preserveFormatting,
      formality: input.formality,
      glossary_id: input.glossaryId,
      tag_handling: input.tagHandling,
      outline_detection: input.outlineDetection,
      non_splitting_tags: input.nonSplittingTags?.split(','),
      splitting_tags: input.splittingTags?.split(','),
      ignore_tags: input.ignoreTags?.split(',')
    };

    // Remove undefined parameters
    Object.keys(params).forEach(key => {
      if (params[key] === undefined) {
        delete params[key];
      }
    });

    // Make the API request
    const response = await axios.post(url, params, {
      headers: {
        'Authorization': `DeepL-Auth-Key ${input.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    // Extract the translated text
    const translations = response.data.translations;
    if (!translations || translations.length === 0) {
      throw new Error('No translations returned from DeepL API');
    }

    return {
      translatedText: translations[0].text,
      detectedSourceLang: translations[0].detected_source_language,
      provider: 'deepl'
    };
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      throw new Error(`DeepL API Error: ${error.response?.data?.message || error.message}`);
    }
    throw new Error(`DeepL Error: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Translate text using Google Translate API
 * 
 * @param input The input parameters
 * @returns The translated text
 */
export async function translateTextGoogle(input: Omit<TranslateTextInput, 'provider'>): Promise<TranslateTextOutput> {
  try {
    const GOOGLE_TRANSLATE_URL = 'https://translation.googleapis.com/language/translate/v2';
    
    // Prepare the request parameters
    const params = {
      q: input.text,
      target: input.targetLang.toLowerCase(),
      source: input.sourceLang?.toLowerCase(),
      format: input.tagHandling === 'html' ? 'html' : 'text',
      key: input.apiKey
    };

    // Remove undefined parameters
    Object.keys(params).forEach(key => {
      if (params[key as keyof typeof params] === undefined) {
        delete params[key as keyof typeof params];
      }
    });

    // Make the API request
    const response = await axios.post(GOOGLE_TRANSLATE_URL, null, {
      params
    });

    // Extract the translated text
    const data = response.data.data;
    if (!data || !data.translations || data.translations.length === 0) {
      throw new Error('No translations returned from Google Translate API');
    }

    return {
      translatedText: data.translations[0].translatedText,
      detectedSourceLang: data.translations[0].detectedSourceLanguage,
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
 * Translate text using the specified provider
 * 
 * @param input The input parameters
 * @returns The translated text
 */
export async function translateText(input: TranslateTextInput): Promise<TranslateTextOutput> {
  if (input.provider === 'deepl') {
    return translateTextDeepL(input);
  } else if (input.provider === 'google') {
    return translateTextGoogle(input);
  } else {
    throw new Error(`Unsupported translation provider: ${input.provider}`);
  }
}
