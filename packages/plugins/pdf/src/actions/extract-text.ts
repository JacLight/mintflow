/**
 * Extracts text from a PDF file
 */
import pdfParse from 'pdf-parse';

export const extractText = {
    name: 'extract_text',
    displayName: 'Extract Text',
    description: 'Extract text from a PDF file',
    icon: '',
    runner: 'node',
    inputSchema: {
        type: 'object',
        required: ['file'],
        properties: {
            file: {
                type: 'string',
                title: 'PDF File',
                description: 'Base64-encoded PDF file data',
                format: 'binary',
            },
        },
    },
    outputSchema: {
        type: 'object',
        properties: {
            text: {
                type: 'string',
                title: 'Extracted Text',
                description: 'The text extracted from the PDF',
            },
            error: {
                type: 'string',
                title: 'Error',
                description: 'Error message if extraction failed',
            },
        },
    },
    exampleInput: {
        file: 'JVBERi0xLjMKJcTl8uXrp...' // Base64-encoded PDF data (truncated)
    },
    exampleOutput: {
        text: 'This is the extracted text from the PDF document.'
    },
    execute: async (input: any, config: any, context: any): Promise<any> => {
        try {
            const { file } = input.data;

            if (!file) {
                return {
                    error: 'PDF file is required',
                };
            }

            // Decode base64 file data
            const dataBuffer = Buffer.from(file, 'base64');
            
            // Parse the PDF
            const pdfData = await pdfParse(dataBuffer);
            
            return {
                text: pdfData.text,
            };
        } catch (error) {
            console.error('Error extracting text from PDF:', error);
            return {
                error: `Failed to extract text: ${error instanceof Error ? error.message : String(error)}`,
            };
        }
    },
};
