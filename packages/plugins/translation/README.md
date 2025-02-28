# MintFlow Translation Plugin

The Translation plugin provides integration with various translation services, enabling text translation and language detection in your workflows.

## Features

- **Text Translation**: Translate text between languages using DeepL or Google Translate
- **Language Detection**: Detect the language of a text using Google Translate
- **Multiple Providers**: Support for DeepL and Google Translate APIs
- **Advanced Options**: Control formatting, formality, sentence splitting, and more

## Installation

```bash
pnpm add @mintflow/translation
```

## Configuration

The Translation plugin requires API keys for the services you want to use:

- For DeepL translation, you need a [DeepL API key](https://www.deepl.com/pro-api)
- For Google Translate, you need a [Google Cloud API key](https://cloud.google.com/translate/docs/setup) with the Cloud Translation API enabled

## Usage

### Translate Text

Translate text using DeepL or Google Translate:

```javascript
// Using DeepL
const result = await mintflow.translation.translateText({
  apiKey: 'your-deepl-api-key',
  text: 'Hello, how are you?',
  targetLang: 'DE', // German
  provider: 'deepl',
  formality: 'more' // Optional, for more formal language
});

// Using Google Translate
const result = await mintflow.translation.translateText({
  apiKey: 'your-google-api-key',
  text: 'Hello, how are you?',
  targetLang: 'es', // Spanish
  provider: 'google'
});

console.log(result.translatedText); // Translated text
console.log(result.detectedSourceLang); // Source language if not specified
```

### DeepL-Specific Options

DeepL provides additional options for fine-tuning translations:

```javascript
const result = await mintflow.translation.translateText({
  apiKey: 'your-deepl-api-key',
  text: 'Hello, how are you?',
  targetLang: 'FR', // French
  sourceLang: 'EN', // Optional, source language
  provider: 'deepl',
  splitSentences: '1', // Optional, controls sentence splitting
  preserveFormatting: true, // Optional, preserves formatting
  formality: 'more', // Optional, controls formality
  tagHandling: 'html', // Optional, for handling HTML tags
  outlineDetection: true, // Optional, for XML structure detection
  nonSplittingTags: 'code,pre', // Optional, tags that shouldn't be split
  splittingTags: 'p,br', // Optional, tags that force splits
  ignoreTags: 'script,style' // Optional, tags to ignore
});
```

### Detect Language

Detect the language of a text:

```javascript
const result = await mintflow.translation.detectLanguage({
  apiKey: 'your-google-api-key',
  text: 'Bonjour, comment ça va?',
  provider: 'google'
});

console.log(result.detectedLanguage); // 'fr' for French
console.log(result.confidence); // Confidence score (0-1)
```

## Supported Languages

### DeepL

DeepL supports translation between the following languages:

- Bulgarian (BG)
- Czech (CS)
- Danish (DA)
- German (DE)
- Greek (EL)
- English (EN-GB, EN-US)
- Spanish (ES)
- Estonian (ET)
- Finnish (FI)
- French (FR)
- Hungarian (HU)
- Indonesian (ID)
- Italian (IT)
- Japanese (JA)
- Korean (KO)
- Lithuanian (LT)
- Latvian (LV)
- Norwegian (NB)
- Dutch (NL)
- Polish (PL)
- Portuguese (PT-BR, PT-PT)
- Romanian (RO)
- Russian (RU)
- Slovak (SK)
- Slovenian (SL)
- Swedish (SV)
- Turkish (TR)
- Ukrainian (UK)
- Chinese (ZH)

### Google Translate

Google Translate supports over 100 languages. See the [Google Cloud Translation documentation](https://cloud.google.com/translate/docs/languages) for a complete list.

## Error Handling

The plugin includes comprehensive error handling:

```javascript
try {
  const result = await mintflow.translation.translateText({
    apiKey: 'your-deepl-api-key',
    text: 'Hello world',
    targetLang: 'DE',
    provider: 'deepl'
  });
  console.log(result.translatedText);
} catch (error) {
  console.error('Error:', error.message);
}
```

## License

MIT
