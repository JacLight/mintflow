/**
 * Convert text to QR code
 */
import { toBuffer, toDataURL } from 'qrcode';

export const textToQrcode = {
    name: 'text_to_qrcode',
    displayName: 'Text to QR Code',
    description: 'Convert text to QR code',
    icon: '',
    runner: 'node',
    inputSchema: {
        type: 'object',
        required: ['text'],
        properties: {
            text: {
                type: 'string',
                title: 'Text',
                description: 'The text to convert to QR code',
            },
            outputFormat: {
                type: 'string',
                title: 'Output Format',
                description: 'The format of the output QR code',
                enum: ['png', 'base64'],
                default: 'base64',
            },
            errorCorrectionLevel: {
                type: 'string',
                title: 'Error Correction Level',
                description: 'The error correction level of the QR code',
                enum: ['L', 'M', 'Q', 'H'],
                default: 'M',
            },
            margin: {
                type: 'number',
                title: 'Margin',
                description: 'The margin around the QR code in modules',
                default: 4,
            },
            scale: {
                type: 'number',
                title: 'Scale',
                description: 'The scale of the QR code',
                default: 4,
            },
            width: {
                type: 'number',
                title: 'Width',
                description: 'The width of the QR code in pixels (overrides scale)',
            },
            color: {
                type: 'object',
                title: 'Color',
                description: 'The color of the QR code',
                properties: {
                    dark: {
                        type: 'string',
                        title: 'Dark Color',
                        description: 'The color of the dark modules',
                        default: '#000000',
                    },
                    light: {
                        type: 'string',
                        title: 'Light Color',
                        description: 'The color of the light modules',
                        default: '#ffffff',
                    },
                },
            },
        },
    },
    outputSchema: {
        type: 'object',
        properties: {
            qrcode: {
                type: 'string',
                title: 'QR Code',
                description: 'The generated QR code as a base64 string or binary data',
            },
            error: {
                type: 'string',
                title: 'Error',
                description: 'Error message if the operation failed',
            },
        },
    },
    exampleInput: {
        text: 'https://mintflow.com',
        outputFormat: 'base64',
        errorCorrectionLevel: 'M',
        margin: 4,
        scale: 4,
    },
    exampleOutput: {
        qrcode: 'data:image/png;base64,ABC123...'
    },
    async exec(input: {
        text: string;
        outputFormat?: 'png' | 'base64';
        errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
        margin?: number;
        scale?: number;
        width?: number;
        color?: {
            dark: string;
            light: string;
        };
    }) {
        try {
            const { text, outputFormat, errorCorrectionLevel, margin, scale, width, color } = input;
            
            const options = {
                errorCorrectionLevel: errorCorrectionLevel || 'M',
                margin: margin || 4,
                scale: scale || 4,
                width: width,
                color: color || {
                    dark: '#000000',
                    light: '#ffffff',
                },
            };
            
            if (outputFormat === 'png') {
                const qrcodeBuffer = await toBuffer(text, options);
                return { qrcode: qrcodeBuffer.toString('base64') };
            } else {
                // Default to base64
                const qrcodeDataUrl = await toDataURL(text, options);
                return { qrcode: qrcodeDataUrl };
            }
        } catch (error: unknown) {
            if (error instanceof Error) {
                return { error: error.message };
            }
            return { error: String(error) };
        }
    }
};
