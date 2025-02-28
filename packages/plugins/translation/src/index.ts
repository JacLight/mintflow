import {
  translateText,
  detectLanguage,
  TranslateTextInput,
  TranslateTextOutput,
  DetectLanguageInput,
  DetectLanguageOutput
} from './actions/index.js';

const translationPlugin = {
  name: "Translation",
  icon: "FaLanguage",
  description: "Translate text between languages and detect languages using various translation services",
  id: "translation",
  runner: "node",
  inputSchema: {
    type: "object",
    properties: {
      // Common properties
      text: { type: 'string' },
      provider: { type: 'string', enum: ['deepl', 'google'] },
      
      // Translation properties
      targetLang: { type: 'string' },
      sourceLang: { type: 'string' },
      
      // DeepL specific properties
      deeplApiKey: { type: 'string' },
      splitSentences: { type: 'string', enum: ['0', '1', 'nonewlines'] },
      preserveFormatting: { type: 'boolean' },
      formality: { type: 'string', enum: ['default', 'more', 'less', 'prefer_more', 'prefer_less'] },
      glossaryId: { type: 'string' },
      tagHandling: { type: 'string', enum: ['xml', 'html'] },
      outlineDetection: { type: 'boolean' },
      nonSplittingTags: { type: 'string' },
      splittingTags: { type: 'string' },
      ignoreTags: { type: 'string' },
      
      // Google specific properties
      googleApiKey: { type: 'string' }
    }
  },
  documentation: "https://docs.mintflow.com/plugins/translation",
  actions: [
    {
      name: 'translateText',
      execute: async function(input: TranslateTextInput): Promise<TranslateTextOutput> {
        return translateText({
          apiKey: input.provider === 'deepl' ? input.apiKey : input.apiKey,
          text: input.text,
          targetLang: input.targetLang,
          sourceLang: input.sourceLang,
          provider: input.provider,
          splitSentences: input.splitSentences,
          preserveFormatting: input.preserveFormatting,
          formality: input.formality,
          glossaryId: input.glossaryId,
          tagHandling: input.tagHandling,
          outlineDetection: input.outlineDetection,
          nonSplittingTags: input.nonSplittingTags,
          splittingTags: input.splittingTags,
          ignoreTags: input.ignoreTags
        });
      }
    },
    {
      name: 'detectLanguage',
      execute: async function(input: DetectLanguageInput): Promise<DetectLanguageOutput> {
        return detectLanguage({
          apiKey: input.apiKey,
          text: input.text,
          provider: input.provider
        });
      }
    }
  ]
};

export default translationPlugin;
