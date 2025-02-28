# Media Processor Plugin for MintFlow

A comprehensive plugin for processing various types of media including QR codes, barcodes, images, and more.

## Installation

```bash
npm install @mintflow/media-processor
```

## Features

- **QR Code Generation**: Convert text or URLs to QR codes with customizable settings
- **Barcode Generation**: Create various types of barcodes with customizable settings
- **Image Processing**: Resize, apply filters, and convert between formats
- **OCR**: Extract text from images with support for multiple languages
- **AI Image Analysis**: Object detection, face recognition, image captioning, and content moderation
- **Watermarking**: Add text or image watermarks to images with customizable position, opacity, and styling
- **Image Compression**: Compress images to reduce file size while maintaining acceptable quality
- **Metadata Extraction**: Extract EXIF, IPTC, XMP, and ICC metadata from images

## QR Code Actions

### text_to_qrcode

Converts text or URLs to QR codes.

#### Input

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| text | string | Yes | - | The text to convert to QR code |
| outputFormat | string | No | 'base64' | The format of the output QR code ('png' or 'base64') |
| errorCorrectionLevel | string | No | 'M' | The error correction level of the QR code ('L', 'M', 'Q', 'H') |
| margin | number | No | 4 | The margin around the QR code in modules |
| scale | number | No | 4 | The scale of the QR code |
| width | number | No | - | The width of the QR code in pixels (overrides scale) |
| color | object | No | - | The color of the QR code |
| color.dark | string | No | '#000000' | The color of the dark modules |
| color.light | string | No | '#ffffff' | The color of the light modules |

#### Output

| Parameter | Type | Description |
|-----------|------|-------------|
| qrcode | string | The generated QR code as a base64 string or binary data |
| error | string | Error message if the operation failed |

#### Example Usage

```javascript
// Generate a QR code from a URL
const result = await mintflow.run({
  plugin: 'media-processor',
  action: 'text_to_qrcode',
  input: {
    text: 'https://example.com',
    outputFormat: 'base64',
    errorCorrectionLevel: 'H',
    margin: 2,
    scale: 8
  }
});

// The result.qrcode will contain a base64 data URL that can be used in an <img> tag
console.log(result.qrcode);
// Output: data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...
```

### Error Correction Levels for QR Codes

- **L (Low)**: 7% of codewords can be restored
- **M (Medium)**: 15% of codewords can be restored
- **Q (Quartile)**: 25% of codewords can be restored
- **H (High)**: 30% of codewords can be restored

Higher error correction levels make the QR code more resistant to damage but also increase its size.

## Barcode Actions

### text_to_barcode

Converts text to various barcode formats.

#### Input

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| text | string | Yes | - | The text to convert to barcode |
| format | string | No | 'CODE128' | The format of the barcode ('CODE128', 'EAN13', 'EAN8', 'UPC', 'CODE39', 'ITF14') |
| outputFormat | string | No | 'base64' | The format of the output barcode ('png' or 'base64') |
| width | number | No | 2 | The width of the barcode in pixels |
| height | number | No | 100 | The height of the barcode in pixels |
| displayValue | boolean | No | true | Whether to display the value below the barcode |
| color | object | No | - | The color of the barcode |
| color.background | string | No | '#ffffff' | The background color of the barcode |
| color.lineColor | string | No | '#000000' | The color of the barcode lines |

#### Output

| Parameter | Type | Description |
|-----------|------|-------------|
| barcode | string | The generated barcode as a base64 string or binary data |
| error | string | Error message if the operation failed |

#### Example Usage

```javascript
// Generate an EAN-13 barcode
const result = await mintflow.run({
  plugin: 'media-processor',
  action: 'text_to_barcode',
  input: {
    text: '123456789012',
    format: 'EAN13',
    outputFormat: 'base64',
    width: 2,
    height: 100,
    displayValue: true
  }
});

// The result.barcode will contain a base64 data URL that can be used in an <img> tag
console.log(result.barcode);
// Output: data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...
```

### Barcode Formats

- **CODE128**: General-purpose code that can encode all 128 ASCII characters
- **EAN13**: European Article Number, 13 digits (12 data + 1 check digit)
- **EAN8**: Compact version of EAN, 8 digits (7 data + 1 check digit)
- **UPC**: Universal Product Code, 12 digits (11 data + 1 check digit)
- **CODE39**: Alphanumeric code, supports uppercase letters, numbers, and some special characters
- **ITF14**: Interleaved 2 of 5, 14 digits used for shipping containers

## Image Processing Actions

### resize_image

Resizes an image to specified dimensions.

#### Input

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| image | string | Yes | - | The image to resize (base64 encoded or URL) |
| width | number | No | - | The target width in pixels |
| height | number | No | - | The target height in pixels |
| fit | string | No | 'cover' | How the image should be resized to fit the target dimensions ('cover', 'contain', 'fill', 'inside', 'outside') |
| position | string | No | 'center' | Position when using cover or contain ('center', 'top', 'right top', 'right', 'right bottom', 'bottom', 'left bottom', 'left', 'left top') |
| outputFormat | string | No | 'jpeg' | The format of the output image ('jpeg', 'png', 'webp', 'avif') |
| quality | number | No | 80 | The quality of the output image (1-100) |

#### Output

| Parameter | Type | Description |
|-----------|------|-------------|
| image | string | The resized image as a base64 string |
| error | string | Error message if the operation failed |

#### Example Usage

```javascript
// Resize an image to 800x600 pixels
const result = await mintflow.run({
  plugin: 'media-processor',
  action: 'resize_image',
  input: {
    image: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD...',
    width: 800,
    height: 600,
    fit: 'cover',
    position: 'center',
    outputFormat: 'jpeg',
    quality: 80
  }
});

// The result.image will contain a base64 data URL that can be used in an <img> tag
console.log(result.image);
// Output: data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD...
```

### apply_filter

Applies a filter to an image.

#### Input

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| image | string | Yes | - | The image to apply the filter to (base64 encoded or URL) |
| filter | string | Yes | 'grayscale' | The filter to apply to the image ('grayscale', 'sepia', 'blur', 'sharpen', 'negative', 'brightness', 'contrast') |
| intensity | number | No | 50 | The intensity of the filter (0-100) |
| outputFormat | string | No | 'jpeg' | The format of the output image ('jpeg', 'png', 'webp', 'avif') |
| quality | number | No | 80 | The quality of the output image (1-100) |

#### Output

| Parameter | Type | Description |
|-----------|------|-------------|
| image | string | The filtered image as a base64 string |
| error | string | Error message if the operation failed |

#### Example Usage

```javascript
// Apply a grayscale filter to an image
const result = await mintflow.run({
  plugin: 'media-processor',
  action: 'apply_filter',
  input: {
    image: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD...',
    filter: 'grayscale',
    intensity: 100,
    outputFormat: 'jpeg',
    quality: 80
  }
});

// The result.image will contain a base64 data URL that can be used in an <img> tag
console.log(result.image);
// Output: data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD...
```

### convert_format

Converts an image to a different format.

#### Input

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| image | string | Yes | - | The image to convert (base64 encoded or URL) |
| format | string | Yes | 'jpeg' | The target format for the image ('jpeg', 'png', 'webp', 'avif', 'tiff', 'gif') |
| quality | number | No | 80 | The quality of the output image (1-100) |
| lossless | boolean | No | false | Whether to use lossless compression (for WebP and AVIF) |

#### Output

| Parameter | Type | Description |
|-----------|------|-------------|
| image | string | The converted image as a base64 string |
| error | string | Error message if the operation failed |

#### Example Usage

```javascript
// Convert an image to WebP format
const result = await mintflow.run({
  plugin: 'media-processor',
  action: 'convert_format',
  input: {
    image: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD...',
    format: 'webp',
    quality: 80,
    lossless: false
  }
});

// The result.image will contain a base64 data URL that can be used in an <img> tag
console.log(result.image);
// Output: data:image/webp;base64,UklGRlYAAABXRUJQVlA4WAoAAAAQAAAA...
```

## OCR Actions

### extract_text

Extracts text from an image using OCR.

#### Input

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| image | string | Yes | - | The image to extract text from (base64 encoded or URL) |
| language | string | No | 'eng' | The language of the text in the image ('eng', 'fra', 'deu', 'spa', 'ita', 'por', 'nld', 'rus', 'jpn', 'kor', 'chi_sim', 'chi_tra', 'ara', 'hin', 'tur') |
| oem | number | No | 3 | The OCR engine mode to use (0-3) |
| psm | number | No | 3 | The page segmentation mode to use (0-13) |
| rectangles | array | No | - | Specific areas to extract text from (if not provided, the entire image is processed) |

#### Output

| Parameter | Type | Description |
|-----------|------|-------------|
| text | string | The extracted text from the image |
| confidence | number | The confidence level of the OCR result (0-100) |
| words | array | Individual words with their positions and confidence levels |
| error | string | Error message if the operation failed |

#### Example Usage

```javascript
// Extract text from an image
const result = await mintflow.run({
  plugin: 'media-processor',
  action: 'extract_text',
  input: {
    image: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD...',
    language: 'eng',
    oem: 3,
    psm: 3
  }
});

// The result.text will contain the extracted text
console.log(result.text);
// Output: "This is the extracted text from the image."

// You can also access individual words with their positions and confidence levels
console.log(result.words);
// Output: [{ text: "This", confidence: 98.2, bbox: { x0: 10, y0: 20, x1: 50, y1: 40 } }, ...]
```

## AI Image Analysis Actions

### analyze_image

Analyzes an image using AI to detect objects, faces, labels, and more.

#### Input

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| image | string | Yes | - | The image to analyze (base64 encoded or URL) |
| analysisTypes | array | No | ['objects', 'labels'] | The types of analysis to perform ('objects', 'faces', 'labels', 'text', 'moderation', 'colors', 'celebrities', 'landmarks') |
| minConfidence | number | No | 50 | The minimum confidence level for detection results (0-100) |
| maxResults | number | No | 20 | The maximum number of results to return for each analysis type |
| includeFacialAttributes | boolean | No | false | Whether to include facial attributes in face detection results |

#### Output

| Parameter | Type | Description |
|-----------|------|-------------|
| objects | array | Objects detected in the image with their names, confidence levels, and bounding boxes |
| faces | array | Faces detected in the image with their confidence levels, bounding boxes, and optional attributes |
| labels | array | Labels detected in the image with their names and confidence levels |
| moderation | object | Content moderation results including safety status and detected categories |
| colors | array | Dominant colors in the image with their hex codes, names, and percentages |
| error | string | Error message if the operation failed |

#### Example Usage

```javascript
// Analyze an image to detect objects and labels
const result = await mintflow.run({
  plugin: 'media-processor',
  action: 'analyze_image',
  input: {
    image: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD...',
    analysisTypes: ['objects', 'labels', 'faces'],
    minConfidence: 70,
    maxResults: 10,
    includeFacialAttributes: true
  }
});

// The result will contain the detected objects, labels, and faces
console.log(result.objects);
// Output: [{ name: "Person", confidence: 98.2, bbox: { x0: 10, y0: 20, x1: 100, y1: 200 } }, ...]

console.log(result.labels);
// Output: [{ name: "Outdoors", confidence: 92.4 }, { name: "City", confidence: 88.1 }, ...]

console.log(result.faces);
// Output: [{ confidence: 99.1, bbox: { x0: 20, y0: 30, x1: 80, y1: 90 }, attributes: { age: { low: 25, high: 35, confidence: 87.5 }, gender: { value: "Male", confidence: 96.2 }, emotion: { value: "Happy", confidence: 92.8 } } }, ...]
```

## Watermarking Actions

### add_watermark

Adds a text or image watermark to an image.

#### Input

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| image | string | Yes | - | The image to add a watermark to (base64 encoded or URL) |
| watermarkType | string | No | 'text' | The type of watermark to add ('text' or 'image') |
| text | string | No | - | The text to use as a watermark (required if watermarkType is 'text') |
| watermarkImage | string | No | - | The image to use as a watermark (required if watermarkType is 'image') |
| position | string | No | 'bottom-right' | The position of the watermark ('center', 'top-left', 'top-right', 'bottom-left', 'bottom-right', 'top-center', 'bottom-center', 'left-center', 'right-center') |
| opacity | number | No | 50 | The opacity of the watermark (0-100) |
| margin | number | No | 20 | The margin between the watermark and the edge of the image (in pixels) |
| rotation | number | No | 0 | The rotation of the watermark (in degrees) |
| scale | number | No | 1 | The scale of the watermark (1 = 100%) |
| font | object | No | - | Font settings for text watermarks |
| font.family | string | No | 'Arial' | The font family to use |
| font.size | number | No | 24 | The font size to use (in pixels) |
| font.color | string | No | '#ffffff' | The font color to use (hex code) |
| font.style | string | No | 'normal' | The font style to use ('normal', 'italic', 'bold', 'bold italic') |
| outputFormat | string | No | 'jpeg' | The format of the output image ('jpeg', 'png', 'webp', 'avif') |
| quality | number | No | 80 | The quality of the output image (1-100) |

#### Output

| Parameter | Type | Description |
|-----------|------|-------------|
| image | string | The watermarked image as a base64 string |
| error | string | Error message if the operation failed |

#### Example Usage

```javascript
// Add a text watermark to an image
const result = await mintflow.run({
  plugin: 'media-processor',
  action: 'add_watermark',
  input: {
    image: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD...',
    watermarkType: 'text',
    text: 'Copyright 2025',
    position: 'bottom-right',
    opacity: 50,
    margin: 20,
    rotation: 0,
    scale: 1,
    font: {
      family: 'Arial',
      size: 24,
      color: '#ffffff',
      style: 'normal'
    },
    outputFormat: 'jpeg',
    quality: 80
  }
});

// The result.image will contain a base64 data URL that can be used in an <img> tag
console.log(result.image);
// Output: data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD...
```

## Image Compression Actions

### compress_image

Compresses an image to reduce file size while maintaining acceptable quality.

#### Input

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| image | string | Yes | - | The image to compress (base64 encoded or URL) |
| quality | number | No | 80 | The quality of the output image (1-100) |
| format | string | No | 'jpeg' | The format of the output image ('jpeg', 'png', 'webp', 'avif') |
| maxWidth | number | No | - | The maximum width of the output image (if provided, the image will be resized if it exceeds this width) |
| maxHeight | number | No | - | The maximum height of the output image (if provided, the image will be resized if it exceeds this height) |
| progressive | boolean | No | false | Whether to use progressive encoding (for JPEG and PNG) |
| compressionLevel | number | No | 6 | The compression level for PNG (0-9) |
| effort | number | No | 4 | The compression effort for WebP and AVIF (0-6) |
| metadata | string | No | 'none' | The metadata to preserve in the output image ('none', 'copyright', 'all') |
| optimizeScans | boolean | No | false | Whether to optimize scans for progressive encoding |

#### Output

| Parameter | Type | Description |
|-----------|------|-------------|
| image | string | The compressed image as a base64 string |
| originalSize | number | The size of the original image in bytes |
| compressedSize | number | The size of the compressed image in bytes |
| compressionRatio | number | The ratio of compressed size to original size |
| error | string | Error message if the operation failed |

#### Example Usage

```javascript
// Compress an image to reduce file size
const result = await mintflow.run({
  plugin: 'media-processor',
  action: 'compress_image',
  input: {
    image: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD...',
    quality: 80,
    format: 'jpeg',
    maxWidth: 1920,
    maxHeight: 1080,
    progressive: true
  }
});

// The result will contain the compressed image and compression statistics
console.log(result.image);
// Output: data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD...

console.log(`Original size: ${result.originalSize} bytes`);
console.log(`Compressed size: ${result.compressedSize} bytes`);
console.log(`Compression ratio: ${result.compressionRatio}`);
// Output: Original size: 1024000 bytes
// Output: Compressed size: 819200 bytes
// Output: Compression ratio: 0.8
```

## Metadata Extraction Actions

### extract_metadata

Extracts metadata from an image including EXIF, IPTC, and XMP data.

#### Input

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| image | string | Yes | - | The image to extract metadata from (base64 encoded or URL) |
| includeExif | boolean | No | true | Whether to include EXIF data in the output |
| includeIptc | boolean | No | true | Whether to include IPTC data in the output |
| includeXmp | boolean | No | true | Whether to include XMP data in the output |
| includeIcc | boolean | No | false | Whether to include ICC profile data in the output |
| sanitize | boolean | No | false | Whether to sanitize sensitive information like GPS coordinates |
| flatten | boolean | No | false | Whether to flatten nested metadata objects |

#### Output

| Parameter | Type | Description |
|-----------|------|-------------|
| metadata | object | The extracted metadata from the image |
| metadata.exif | object | EXIF metadata (camera, exposure, GPS, etc.) |
| metadata.iptc | object | IPTC metadata (title, keywords, copyright, etc.) |
| metadata.xmp | object | XMP metadata (creator, creation date, etc.) |
| metadata.icc | object | ICC profile metadata (color profile) |
| format | string | The format of the image |
| size | object | The size of the image (width, height, bytes) |
| error | string | Error message if the operation failed |

#### Example Usage

```javascript
// Extract metadata from an image
const result = await mintflow.run({
  plugin: 'media-processor',
  action: 'extract_metadata',
  input: {
    image: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD...',
    includeExif: true,
    includeIptc: true,
    includeXmp: true,
    includeIcc: false,
    sanitize: false
  }
});

// The result will contain the extracted metadata
console.log(result.metadata.exif);
// Output: { Make: "Canon", Model: "Canon EOS 5D Mark IV", ExposureTime: "1/125", ... }

console.log(result.metadata.iptc);
// Output: { ObjectName: "Sample Image", Keywords: ["nature", "landscape"], ... }

console.log(result.format);
// Output: "jpeg"

console.log(result.size);
// Output: { width: 3840, height: 2160, bytes: 2457600 }
```

## Dependencies

This plugin uses the following libraries:
- [node-qrcode](https://github.com/soldair/node-qrcode) for QR code generation
- [jsbarcode](https://github.com/lindell/JsBarcode) for barcode generation
- [sharp](https://github.com/lovell/sharp) for image processing, compression, and format conversion
- [tesseract.js](https://github.com/naptha/tesseract.js) for OCR
- [canvas](https://github.com/Automattic/node-canvas) for watermarking
- [exif-reader](https://github.com/devongovett/exif-reader) for metadata extraction

## Future Enhancements

The media-processor plugin is designed to be extensible and can be enhanced with additional features in the future:

### Animated GIF and Video Processing
- Support for creating and manipulating animated GIFs
- Basic video processing capabilities including trimming, resizing, and format conversion
- Frame extraction from videos
- Video thumbnail generation

### Batch Processing
- Process multiple images in a single operation
- Apply the same transformations to a collection of images
- Generate reports on batch processing results

### Advanced Image Editing
- Cropping with custom shapes and aspect ratios
- Rotation and flipping with precise angle control
- Image compositing and layering
- Drawing and annotation tools
- Background removal with AI assistance

### Enhanced AI Integration
- Integration with cloud-based AI services for more advanced image analysis
- Custom model support for specialized image recognition tasks
- Image captioning and description generation
- Visual similarity search
- Content-aware image editing

### Performance Optimizations
- Streaming processing for large images
- Worker thread support for parallel processing
- Memory usage optimizations for handling very large images
- Progressive loading and processing

### Additional Formats and Standards
- Support for more specialized image formats (RAW, HDR, etc.)
- Advanced SVG generation and manipulation
- 3D model thumbnail generation
- Medical imaging format support (DICOM)

## License

MIT
