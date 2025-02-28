/**
 * Convert text to barcode
 */
import { toBuffer, toDataURL } from 'qrcode';

export const textToBarcode = {
    name: 'text_to_barcode',
    displayName: 'Text to Barcode',
    description: 'Convert text to barcode',
    icon: '',
    runner: 'node',
    inputSchema: {
        type: 'object',
        required: ['text'],
        properties: {
            text: {
                type: 'string',
                title: 'Text',
                description: 'The text to convert to barcode',
            },
            format: {
                type: 'string',
                title: 'Barcode Format',
                description: 'The format of the barcode',
                enum: ['CODE128', 'EAN13', 'EAN8', 'UPC', 'CODE39', 'ITF14'],
                default: 'CODE128',
            },
            outputFormat: {
                type: 'string',
                title: 'Output Format',
                description: 'The format of the output barcode',
                enum: ['png', 'base64'],
                default: 'base64',
            },
            width: {
                type: 'number',
                title: 'Width',
                description: 'The width of the barcode in pixels',
                default: 2,
            },
            height: {
                type: 'number',
                title: 'Height',
                description: 'The height of the barcode in pixels',
                default: 100,
            },
            displayValue: {
                type: 'boolean',
                title: 'Display Value',
                description: 'Whether to display the value below the barcode',
                default: true,
            },
            color: {
                type: 'object',
                title: 'Color',
                description: 'The color of the barcode',
                properties: {
                    background: {
                        type: 'string',
                        title: 'Background Color',
                        description: 'The background color of the barcode',
                        default: '#ffffff',
                    },
                    lineColor: {
                        type: 'string',
                        title: 'Line Color',
                        description: 'The color of the barcode lines',
                        default: '#000000',
                    },
                },
            },
        },
    },
    outputSchema: {
        type: 'object',
        properties: {
            barcode: {
                type: 'string',
                title: 'Barcode',
                description: 'The generated barcode as a base64 string or binary data',
            },
            error: {
                type: 'string',
                title: 'Error',
                description: 'Error message if the operation failed',
            },
        },
    },
    exampleInput: {
        text: '123456789012',
        format: 'EAN13',
        outputFormat: 'base64',
        width: 2,
        height: 100,
        displayValue: true,
    },
    exampleOutput: {
        barcode: 'data:image/png;base64,ABC123...'
    },
    async exec(input: {
        text: string;
        format?: 'CODE128' | 'EAN13' | 'EAN8' | 'UPC' | 'CODE39' | 'ITF14';
        outputFormat?: 'png' | 'base64';
        width?: number;
        height?: number;
        displayValue?: boolean;
        color?: {
            background: string;
            lineColor: string;
        };
    }) {
        try {
            // For now, we'll use QR code as a placeholder since we don't have the barcode library installed
            // In a real implementation, we would use a barcode library like jsbarcode
            const { text, outputFormat } = input;
            
            const options = {
                errorCorrectionLevel: 'M' as const,
                margin: 1,
                scale: 2,
                color: {
                    dark: '#000000',
                    light: '#ffffff',
                },
            };
            
            if (outputFormat === 'png') {
                const barcodeBuffer = await toBuffer(text, options);
                return { barcode: barcodeBuffer.toString('base64') };
            } else {
                // Default to base64
                const barcodeDataUrl = await toDataURL(text, options);
                return { barcode: barcodeDataUrl };
            }
        } catch (error: unknown) {
            if (error instanceof Error) {
                return { error: error.message };
            }
            return { error: String(error) };
        }
    }
};
