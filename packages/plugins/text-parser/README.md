# MintFlow Text Parser Plugin

The Text Parser plugin provides a comprehensive set of tools for text processing and manipulation. It enables you to perform common text operations like concatenation, find and replace, splitting, and more advanced transformations like Markdown/HTML conversion.

## Features

- **Concatenation**: Combine multiple text strings with optional separators
- **Find and Replace**: Search for text patterns and replace them
- **Text Splitting**: Divide text into arrays based on a separator
- **Markdown/HTML Conversion**: Convert between Markdown and HTML formats
- **HTML Stripping**: Remove HTML tags from content
- **Slugify**: Convert text to URL-friendly slugs
- **Default Values**: Provide fallback values for empty text

## Installation

```bash
pnpm add @mintflow/text-parser
```

## Usage

### Concatenate Text

Combine multiple text strings with an optional separator:

```javascript
const result = await mintflow.textParser.concat({
  texts: ["Hello", "World"],
  separator: " "
});

console.log(result); // "Hello World"
```

### Find and Replace

Search for text patterns and replace them:

```javascript
const result = await mintflow.textParser.replace({
  text: "Hello world! Hello universe!",
  search: "Hello",
  replacement: "Hi",
  replaceAll: true,
  useRegex: false,
  caseInsensitive: false
});

console.log(result); // "Hi world! Hi universe!"
```

### Split Text

Divide text into an array based on a separator:

```javascript
const result = await mintflow.textParser.split({
  text: "apple,banana,cherry",
  separator: ",",
  trim: true
});

console.log(result); // ["apple", "banana", "cherry"]
```

### Find Text Patterns

Find text patterns and return matches:

```javascript
const result = await mintflow.textParser.find({
  text: "Hello world! Hello universe!",
  pattern: "Hello",
  findAll: true,
  includePosition: true
});

console.log(result);
// [
//   { match: "Hello", index: 0, length: 5 },
//   { match: "Hello", index: 13, length: 5 }
// ]
```

### Convert Markdown to HTML

Transform Markdown text into HTML:

```javascript
const result = await mintflow.textParser.markdownToHtml({
  markdown: "# Hello World\n\nThis is **bold** and this is *italic*.",
  flavor: "github",
  headerLevelStart: 1,
  tables: true
});

console.log(result);
// "<h1 id="hello-world">Hello World</h1>
// <p>This is <strong>bold</strong> and this is <em>italic</em>.</p>"
```

### Convert HTML to Markdown

Transform HTML into Markdown text:

```javascript
const result = await mintflow.textParser.htmlToMarkdown({
  html: "<h1>Hello World</h1><p>This is <strong>bold</strong> and this is <em>italic</em>.</p>",
  headingStyle: "atx",
  bulletListMarker: "-"
});

console.log(result);
// "# Hello World
//
// This is **bold** and this is *italic*."
```

### Strip HTML

Remove HTML tags from text:

```javascript
const result = await mintflow.textParser.stripHtml({
  html: "<h1>Hello World</h1><p>This is <strong>bold</strong> and this is <em>italic</em>.</p>",
  preserveLineBreaks: true,
  preserveFormatting: false,
  collapseWhitespace: true,
  decodeEntities: true
});

console.log(result);
// "Hello World
//
// This is bold and this is italic."
```

### Slugify Text

Convert text to a URL-friendly slug:

```javascript
const result = await mintflow.textParser.slugify({
  text: "Hello World! This is a test.",
  lowercase: true,
  replacement: "-"
});

console.log(result); // "hello-world-this-is-a-test"
```

### Default Value

Provide a default value if the input is empty or undefined:

```javascript
const result = await mintflow.textParser.defaultValue({
  value: "",
  default: "Default Value",
  emptyValues: ["N/A", "None"],
  treatZeroAsEmpty: false
});

console.log(result); // "Default Value"
```

## Dependencies

This plugin uses the following libraries:

- [showdown](https://github.com/showdownjs/showdown) - For Markdown to HTML conversion
- [turndown](https://github.com/mixmark-io/turndown) - For HTML to Markdown conversion
- [slugify](https://github.com/simov/slugify) - For URL-friendly slug generation

## License

MIT
