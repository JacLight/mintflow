/**
 * Converts an image to a PDF document
 */
import { PDFDocument } from 'pdf-lib';

export const imageToPdf = {
    name: 'image_to_pdf',
    displayName: 'Image to PDF',
    description: 'Convert an image to a PDF document',
    icon: '',
    runner: 'node',
    inputSchema: {
        type: 'object',
        required: ['image'],
        properties: {
            image: {
                type: 'string',
                title: 'Image',
                description: 'Base64-encoded image data (PNG or JPEG)',
                format: 'binary',
            },
            imageType: {
                type: 'string',
                title: 'Image Type',
                description: 'The type of image',
                enum: ['png', 'jpeg'],
                default: 'png',
            },
        },
    },
    outputSchema: {
        type: 'object',
        properties: {
            pdf: {
                type: 'string',
                title: 'PDF',
                description: 'Base64-encoded PDF data',
                format: 'binary',
            },
            error: {
                type: 'string',
                title: 'Error',
                description: 'Error message if conversion failed',
            },
        },
    },
    exampleInput: {
        image: 'iVBORw0KGgoAAAANSUhEUgAA...', // Base64-encoded image data (truncated)
        imageType: 'png'
    },
    exampleOutput: {
        pdf: 'JVBERi0xLjMKJcTl8uXrp...' // Base64-encoded PDF data (truncated)
    },
    execute: async (input: any, config: any, context: any): Promise<any> => {
        try {
            const { image, imageType = 'png' } = input.data;

            if (!image) {
                return {
                    error: 'Image is required',
                };
            }

            if (imageType !== 'png' && imageType !== 'jpeg') {
                return {
                    error: 'Image type must be either "png" or "jpeg"',
                };
            }

            // Decode base64 image data
            const imageData = Buffer.from(image, 'base64');

            // Create a new PDF document
            const pdfDoc = await PDFDocument.create();
            
            // Standard A4 size
            const pageSize: [number, number] = [595, 842];
            
            // Add a page to the document
            const page = pdfDoc.addPage(pageSize);
            const { width, height } = page.getSize();
            
            // Embed the image
            let pdfImage;
            if (imageType === 'png') {
                pdfImage = await pdfDoc.embedPng(imageData);
            } else {
                pdfImage = await pdfDoc.embedJpg(imageData);
            }
            
            // Calculate dimensions to fit the image on the page with margins
            const margin = 50;
            const maxWidth = width - margin * 2;
            const maxHeight = height - margin * 2;
            
            // Scale the image to fit within the page
            const scaledDimensions = pdfImage.scaleToFit(maxWidth, maxHeight);
            
            // Calculate position to center the image on the page
            const x = (width - scaledDimensions.width) / 2;
            const y = (height - scaledDimensions.height) / 2;
            
            // Draw the image on the page
            page.drawImage(pdfImage, {
                x,
                y,
                width: scaledDimensions.width,
                height: scaledDimensions.height,
            });
            
            // Save the PDF
            const pdfBytes = await pdfDoc.save();
            
            // Convert to base64
            const base64Pdf = Buffer.from(pdfBytes).toString('base64');
            
            return {
                pdf: base64Pdf,
            };
        } catch (error) {
            console.error('Error converting image to PDF:', error);
            return {
                error: `Failed to convert image to PDF: ${error instanceof Error ? error.message : String(error)}`,
            };
        }
    },
};
