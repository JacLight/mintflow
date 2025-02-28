import { extractText } from './actions/extract-text.js';
import { textToPdf } from './actions/text-to-pdf.js';
import { imageToPdf } from './actions/image-to-pdf.js';

const pdfPlugin = {
    name: "PDF",
    icon: "📄",
    description: "Work with PDF documents - extract text, convert text to PDF, and convert images to PDF",
    id: "pdf",
    runner: "node",
    inputSchema: {
        type: "object",
        properties: {
            action: {
                type: 'string',
                enum: ['extract_text', 'text_to_pdf', 'image_to_pdf'],
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Action to perform',
            },
        },
    },
    outputSchema: {
        type: "object",
    },
    exampleInput: {
        action: 'extract_text',
        file: 'JVBERi0xLjMKJcTl8uXrp...' // Base64-encoded PDF data (truncated)
    },
    exampleOutput: {
        text: 'This is the extracted text from the PDF document.'
    },
    documentation: "https://mintflow.com/docs/plugins/pdf",
    method: "exec",
    actions: [
        extractText,
        textToPdf,
        imageToPdf
    ]
};

export default pdfPlugin;
