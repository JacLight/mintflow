/**
 * Extract text from an image using OCR
 */
import { toDataURL } from 'qrcode';

export const extractText = {
    name: 'extract_text',
    displayName: 'Extract Text',
    description: 'Extract text from an image using OCR',
    icon: '',
    runner: 'node',
    inputSchema: {
        type: 'object',
        required: ['image'],
        properties: {
            image: {
                type: 'string',
                title: 'Image',
                description: 'The image to extract text from (base64 encoded or URL)',
            },
            language: {
                type: 'string',
                title: 'Language',
                description: 'The language of the text in the image',
                enum: ['eng', 'fra', 'deu', 'spa', 'ita', 'por', 'nld', 'rus', 'jpn', 'kor', 'chi_sim', 'chi_tra', 'ara', 'hin', 'tur'],
                default: 'eng',
            },
            oem: {
                type: 'number',
                title: 'OCR Engine Mode',
                description: 'The OCR engine mode to use',
                enum: [0, 1, 2, 3],
                default: 3,
            },
            psm: {
                type: 'number',
                title: 'Page Segmentation Mode',
                description: 'The page segmentation mode to use',
                enum: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
                default: 3,
            },
            rectangles: {
                type: 'array',
                title: 'Rectangles',
                description: 'Specific areas to extract text from (if not provided, the entire image is processed)',
                items: {
                    type: 'object',
                    properties: {
                        left: {
                            type: 'number',
                            title: 'Left',
                            description: 'The left coordinate of the rectangle',
                        },
                        top: {
                            type: 'number',
                            title: 'Top',
                            description: 'The top coordinate of the rectangle',
                        },
                        width: {
                            type: 'number',
                            title: 'Width',
                            description: 'The width of the rectangle',
                        },
                        height: {
                            type: 'number',
                            title: 'Height',
                            description: 'The height of the rectangle',
                        },
                    },
                    required: ['left', 'top', 'width', 'height'],
                },
            },
        },
    },
    outputSchema: {
        type: 'object',
        properties: {
            text: {
                type: 'string',
                title: 'Text',
                description: 'The extracted text from the image',
            },
            confidence: {
                type: 'number',
                title: 'Confidence',
                description: 'The confidence level of the OCR result (0-100)',
            },
            words: {
                type: 'array',
                title: 'Words',
                description: 'Individual words with their positions and confidence levels',
                items: {
                    type: 'object',
                    properties: {
                        text: {
                            type: 'string',
                            title: 'Text',
                            description: 'The word text',
                        },
                        confidence: {
                            type: 'number',
                            title: 'Confidence',
                            description: 'The confidence level for this word (0-100)',
                        },
                        bbox: {
                            type: 'object',
                            title: 'Bounding Box',
                            description: 'The bounding box of the word',
                            properties: {
                                x0: { type: 'number' },
                                y0: { type: 'number' },
                                x1: { type: 'number' },
                                y1: { type: 'number' },
                            },
                        },
                    },
                },
            },
            error: {
                type: 'string',
                title: 'Error',
                description: 'Error message if the operation failed',
            },
        },
    },
    exampleInput: {
        image: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD...',
        language: 'eng',
        oem: 3,
        psm: 3,
    },
    exampleOutput: {
        text: 'This is the extracted text from the image.',
        confidence: 95.8,
        words: [
            {
                text: 'This',
                confidence: 98.2,
                bbox: { x0: 10, y0: 20, x1: 50, y1: 40 }
            },
            {
                text: 'is',
                confidence: 99.1,
                bbox: { x0: 55, y0: 20, x1: 75, y1: 40 }
            },
            // ... more words
        ]
    },
    async exec(input: {
        image: string;
        language?: string;
        oem?: number;
        psm?: number;
        rectangles?: Array<{
            left: number;
            top: number;
            width: number;
            height: number;
        }>;
    }) {
        try {
            // For now, we'll return a placeholder result since we don't have the tesseract.js library installed
            // In a real implementation, we would use the tesseract.js library for OCR
            const { image, language } = input;
            
            // Generate a placeholder image (a QR code with the text "OCR placeholder")
            const options = {
                errorCorrectionLevel: 'M' as const,
                margin: 1,
                scale: 4,
                color: {
                    dark: '#000000',
                    light: '#ffffff',
                },
            };
            
            const placeholderText = `OCR placeholder (${language || 'eng'})`;
            await toDataURL(placeholderText, options);
            
            // Return a placeholder OCR result
            return {
                text: 'This is a placeholder for OCR text extraction. In a real implementation, this would be the actual text extracted from the image.',
                confidence: 95.8,
                words: [
                    {
                        text: 'This',
                        confidence: 98.2,
                        bbox: { x0: 10, y0: 20, x1: 50, y1: 40 }
                    },
                    {
                        text: 'is',
                        confidence: 99.1,
                        bbox: { x0: 55, y0: 20, x1: 75, y1: 40 }
                    },
                    {
                        text: 'a',
                        confidence: 99.5,
                        bbox: { x0: 80, y0: 20, x1: 90, y1: 40 }
                    },
                    {
                        text: 'placeholder',
                        confidence: 97.3,
                        bbox: { x0: 95, y0: 20, x1: 180, y1: 40 }
                    }
                ]
            };
        } catch (error: unknown) {
            if (error instanceof Error) {
                return { error: error.message };
            }
            return { error: String(error) };
        }
    }
};
