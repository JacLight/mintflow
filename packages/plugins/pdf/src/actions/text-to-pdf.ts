/**
 * Converts text to a PDF document
 */
import { PDFDocument, StandardFonts } from 'pdf-lib';

export const textToPdf = {
    name: 'text_to_pdf',
    displayName: 'Text to PDF',
    description: 'Convert text to a PDF document',
    icon: '',
    runner: 'node',
    inputSchema: {
        type: 'object',
        required: ['text'],
        properties: {
            text: {
                type: 'string',
                title: 'Text',
                description: 'The text to convert to PDF',
            },
            fontSize: {
                type: 'number',
                title: 'Font Size',
                description: 'The font size to use (default: 12)',
                default: 12,
            },
            fontType: {
                type: 'string',
                title: 'Font Type',
                description: 'The font type to use',
                enum: ['Helvetica', 'Times', 'Courier'],
                default: 'Helvetica',
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
        text: 'This is a sample text that will be converted to PDF.',
        fontSize: 12,
        fontType: 'Helvetica'
    },
    exampleOutput: {
        pdf: 'JVBERi0xLjMKJcTl8uXrp...' // Base64-encoded PDF data (truncated)
    },
    execute: async (input: any, config: any, context: any): Promise<any> => {
        try {
            const { text, fontSize = 12, fontType = 'Helvetica' } = input.data;

            if (!text) {
                return {
                    error: 'Text is required',
                };
            }

            // Map font type to StandardFonts
            let standardFont: StandardFonts;
            switch (fontType) {
                case 'Times':
                    standardFont = StandardFonts.TimesRoman;
                    break;
                case 'Courier':
                    standardFont = StandardFonts.Courier;
                    break;
                case 'Helvetica':
                default:
                    standardFont = StandardFonts.Helvetica;
                    break;
            }

            // Create a new PDF document
            const pdfDoc = await PDFDocument.create();
            
            // Standard A4 size
            const pageSize: [number, number] = [595, 842];
            const margin = 50;
            const topMargin = 70;
            const lineSpacing = 5;
            const paragraphSpacing = 8;
            
            // Add a page to the document
            let page = pdfDoc.addPage(pageSize);
            const { width, height } = page.getSize();
            
            // Embed the font
            const font = await pdfDoc.embedFont(standardFont);
            
            // Calculate line height
            const lineHeight = font.heightAtSize(fontSize) + lineSpacing;
            const maxWidth = width - margin * 2;
            
            // Split text into paragraphs
            const paragraphs = text.split('\n');
            let yPosition = height - topMargin;
            
            // Process each paragraph
            paragraphs.forEach((paragraph: string) => {
                const words = paragraph.split(' ');
                let line = '';
                
                // Process each word
                words.forEach((word: string) => {
                    const testLine = line + word + ' ';
                    const testLineWidth = font.widthOfTextAtSize(testLine, fontSize);
                    
                    // Check if the line is too long
                    if (testLineWidth > maxWidth) {
                        // Draw the current line
                        page.drawText(line.trim(), {
                            x: margin,
                            y: yPosition,
                            size: fontSize,
                            font,
                        });
                        
                        // Start a new line
                        line = word + ' ';
                        yPosition -= lineHeight;
                        
                        // Check if we need a new page
                        if (yPosition < margin + lineHeight) {
                            page = pdfDoc.addPage(pageSize);
                            yPosition = height - topMargin;
                        }
                    } else {
                        line = testLine;
                    }
                });
                
                // Draw the last line of the paragraph
                if (line.trim()) {
                    page.drawText(line.trim(), {
                        x: margin,
                        y: yPosition,
                        size: fontSize,
                        font,
                    });
                    yPosition -= lineHeight;
                }
                
                // Add paragraph spacing
                yPosition -= paragraphSpacing;
                
                // Check if we need a new page
                if (yPosition < margin + lineHeight) {
                    page = pdfDoc.addPage(pageSize);
                    yPosition = height - topMargin;
                }
            });
            
            // Save the PDF
            const pdfBytes = await pdfDoc.save();
            
            // Convert to base64
            const base64Pdf = Buffer.from(pdfBytes).toString('base64');
            
            return {
                pdf: base64Pdf,
            };
        } catch (error) {
            console.error('Error converting text to PDF:', error);
            return {
                error: `Failed to convert text to PDF: ${error instanceof Error ? error.message : String(error)}`,
            };
        }
    },
};
