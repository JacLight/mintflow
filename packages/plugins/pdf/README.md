# MintFlow PDF Plugin

A MintFlow plugin for working with PDF documents - extract text, convert text to PDF, and convert images to PDF.

## Features

- **Extract Text**: Extract text content from PDF documents
- **Text to PDF**: Convert text to PDF documents with customizable formatting
- **Image to PDF**: Convert PNG or JPEG images to PDF documents

## Installation

This plugin is included in the MintFlow package. No additional installation is required.

## Usage

### Extract Text from PDF

Extracts text content from a PDF document.

```json
{
  "action": "extract_text",
  "file": "JVBERi0xLjMKJcTl8uXrp..." // Base64-encoded PDF data
}
```

**Parameters:**

- `file`: Base64-encoded PDF file data

**Response:**

```json
{
  "text": "This is the extracted text from the PDF document."
}
```

### Convert Text to PDF

Converts text to a PDF document with customizable formatting.

```json
{
  "action": "text_to_pdf",
  "text": "This is a sample text that will be converted to PDF.",
  "fontSize": 12,
  "fontType": "Helvetica"
}
```

**Parameters:**

- `text`: The text to convert to PDF
- `fontSize` (optional): The font size to use (default: 12)
- `fontType` (optional): The font type to use (Helvetica, Times, or Courier, default: Helvetica)

**Response:**

```json
{
  "pdf": "JVBERi0xLjMKJcTl8uXrp..." // Base64-encoded PDF data
}
```

### Convert Image to PDF

Converts a PNG or JPEG image to a PDF document.

```json
{
  "action": "image_to_pdf",
  "image": "iVBORw0KGgoAAAANSUhEUgAA...", // Base64-encoded image data
  "imageType": "png"
}
```

**Parameters:**

- `image`: Base64-encoded image data
- `imageType`: The type of image (png or jpeg)

**Response:**

```json
{
  "pdf": "JVBERi0xLjMKJcTl8uXrp..." // Base64-encoded PDF data
}
```

## Example Workflow

Here's an example of how to use the PDF plugin in a MintFlow workflow:

```javascript
// Extract text from a PDF file
const extractResult = await mintflow.execute('pdf', {
  action: 'extract_text',
  file: pdfFileData // Base64-encoded PDF data
});

console.log('Extracted text:', extractResult.text);

// Convert text to a PDF file
const textToPdfResult = await mintflow.execute('pdf', {
  action: 'text_to_pdf',
  text: 'This is a sample text that will be converted to PDF.',
  fontSize: 12,
  fontType: 'Helvetica'
});

console.log('PDF file created:', textToPdfResult.pdf);

// Convert an image to a PDF file
const imageToPdfResult = await mintflow.execute('pdf', {
  action: 'image_to_pdf',
  image: imageData, // Base64-encoded image data
  imageType: 'png'
});

console.log('PDF file created from image:', imageToPdfResult.pdf);
```

## Error Handling

The plugin provides descriptive error messages for common issues:

- Missing required parameters
- Invalid image types
- PDF parsing errors
- File conversion errors

## Dependencies

The PDF plugin uses the following libraries:

- **pdf-parse**: For extracting text from PDF documents
- **pdf-lib**: For creating and manipulating PDF documents
- **jimp**: For image processing (used in the convert-to-image action)

## Development

### Building the Plugin

```bash
cd packages/plugins/pdf
npm run build
```

### Running Tests

```bash
cd packages/plugins/pdf
npm test
```

## License

This plugin is part of the MintFlow project and is subject to the same license terms.
