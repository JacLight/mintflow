import { textToQrcode } from './actions/qrcode/text-to-qrcode.js';
import { textToBarcode } from './actions/barcode/text-to-barcode.js';
import { resizeImage } from './actions/image/resize-image.js';
import { applyFilter } from './actions/image/apply-filter.js';
import { convertFormat } from './actions/image/convert-format.js';
import { extractText } from './actions/ocr/extract-text.js';
import { analyzeImage } from './actions/ai/analyze-image.js';
import { addWatermark } from './actions/watermark/add-watermark.js';
import { compressImage } from './actions/compression/compress-image.js';
import { extractMetadata } from './actions/metadata/extract-metadata.js';

const mediaProcessorPlugin = {
    name: "media-processor",
    icon: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0ibHVjaWRlIGx1Y2lkZS1pbWFnZSI+PHJlY3QgeD0iMyIgeT0iMyIgd2lkdGg9IjE4IiBoZWlnaHQ9IjE4IiByeD0iMiIgcnk9IjIiLz48Y2lyY2xlIGN4PSI4LjUiIGN5PSI4LjUiIHI9IjEuNSIvPjxwb2x5bGluZSBwb2ludHM9IjIxIDE1IDxwYXRoIGQ9Ik0yMSAxNWwtNS0xMC0xMSAxMCIvPjwvc3ZnPg==",
    description: "Process media files including QR codes, barcodes, images, OCR, AI analysis, watermarking, compression, and metadata extraction",
    groups: ["utility"],
    tags: ["utility","tool","helper","function","operation"],
    version: '1.0.0',
    id: "media-processor",
    runner: "node",
    inputSchema: {
        type: "object",
        required: ["action", "input"],
        properties: {
            action: {
                type: "string",
                enum: [
                    "text_to_qrcode", 
                    "text_to_barcode", 
                    "resize_image", 
                    "apply_filter", 
                    "convert_format",
                    "extract_text",
                    "analyze_image",
                    "add_watermark",
                    "compress_image",
                    "extract_metadata"
                ],
                description: "The action to perform"
            },
            input: {
                type: "object",
                description: "The input for the action"
            }
        }
    },
    outputSchema: {
        type: "object",
        properties: {
            qrcode: {
                type: "string",
                description: "The generated QR code as a base64 string or binary data"
            },
            barcode: {
                type: "string",
                description: "The generated barcode as a base64 string or binary data"
            },
            image: {
                type: "string",
                description: "The processed image as a base64 string"
            },
            text: {
                type: "string",
                description: "The extracted text from an image"
            },
            confidence: {
                type: "number",
                description: "The confidence level of OCR or AI analysis results"
            },
            words: {
                type: "array",
                description: "Individual words with positions and confidence levels from OCR"
            },
            objects: {
                type: "array",
                description: "Objects detected in an image by AI analysis"
            },
            faces: {
                type: "array",
                description: "Faces detected in an image by AI analysis"
            },
            labels: {
                type: "array",
                description: "Labels detected in an image by AI analysis"
            },
            moderation: {
                type: "object",
                description: "Content moderation results from AI analysis"
            },
            colors: {
                type: "array",
                description: "Dominant colors detected in an image by AI analysis"
            },
            originalSize: {
                type: "number",
                description: "The size of the original image in bytes"
            },
            compressedSize: {
                type: "number",
                description: "The size of the compressed image in bytes"
            },
            compressionRatio: {
                type: "number",
                description: "The ratio of compressed size to original size"
            },
            metadata: {
                type: "object",
                description: "Metadata extracted from an image"
            },
            format: {
                type: "string",
                description: "The format of the image"
            },
            size: {
                type: "object",
                description: "The size of the image"
            },
            error: {
                type: "string",
                description: "Error message if the operation failed"
            }
        }
    },
    exampleInput: {
        action: "text_to_qrcode",
        input: {
            text: "https://mintflow.com",
            outputFormat: "base64"
        }
    },
    exampleOutput: {
        qrcode: "data:image/png;base64,ABC123..."
    },
    documentation: "https://github.com/mintflow/media-processor",
    method: "exec",
    actions: [
        textToQrcode,
        textToBarcode,
        resizeImage,
        applyFilter,
        convertFormat,
        extractText,
        analyzeImage,
        addWatermark,
        compressImage,
        extractMetadata
    ]
};

export default mediaProcessorPlugin;
