export const stripHtml = {
    name: "strip_html",
    description: "Remove HTML tags from text",
    inputSchema: {
        type: "object",
        properties: {
            html: {
                type: "string",
                description: "The HTML text to strip tags from"
            },
            preserveLineBreaks: {
                type: "boolean",
                description: "Whether to preserve line breaks by converting <br>, <p>, etc. to newlines",
                default: true
            },
            preserveFormatting: {
                type: "boolean",
                description: "Whether to preserve basic formatting (bold, italic, etc.) with markdown-like syntax",
                default: false
            },
            collapseWhitespace: {
                type: "boolean",
                description: "Whether to collapse multiple whitespace characters into a single space",
                default: true
            },
            decodeEntities: {
                type: "boolean",
                description: "Whether to decode HTML entities like &amp;, &lt;, etc.",
                default: true
            }
        },
        required: ["html"]
    },
    outputSchema: {
        type: "string",
        description: "The text with HTML tags removed"
    },
    exampleInput: {
        html: "<h1>Hello World</h1><p>This is <strong>bold</strong> and this is <em>italic</em>.</p>",
        preserveLineBreaks: true,
        preserveFormatting: false
    },
    exampleOutput: "Hello World\n\nThis is bold and this is italic.",
    execute: async (input: any, config: any) => {
        const { html, preserveLineBreaks = true, preserveFormatting = false, 
                collapseWhitespace = true, decodeEntities = true } = input.data || {};
        
        if (typeof html !== 'string') {
            return { error: "The 'html' parameter must be a string" };
        }
        
        try {
            let result = html;
            
            // Preserve line breaks by converting <br>, <p>, etc. to newlines
            if (preserveLineBreaks) {
                result = result.replace(/<br\s*\/?>/gi, '\n');
                result = result.replace(/<\/p>\s*<p[^>]*>/gi, '\n\n');
                result = result.replace(/<\/div>\s*<div[^>]*>/gi, '\n');
                result = result.replace(/<\/h[1-6]>\s*<[^>]*>/gi, '\n\n');
                result = result.replace(/<\/li>\s*<li[^>]*>/gi, '\n');
                result = result.replace(/<\/tr>\s*<tr[^>]*>/gi, '\n');
                result = result.replace(/<\/table>/gi, '\n');
            }
            
            // Preserve basic formatting with markdown-like syntax
            if (preserveFormatting) {
                // Bold
                result = result.replace(/<(strong|b)>(.*?)<\/\1>/gi, '**$2**');
                
                // Italic
                result = result.replace(/<(em|i)>(.*?)<\/\1>/gi, '*$2*');
                
                // Underline
                result = result.replace(/<u>(.*?)<\/u>/gi, '_$1_');
                
                // Strikethrough
                result = result.replace(/<(strike|s|del)>(.*?)<\/\1>/gi, '~~$2~~');
                
                // Code
                result = result.replace(/<code>(.*?)<\/code>/gi, '`$1`');
                
                // Headings
                result = result.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1');
                result = result.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1');
                result = result.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1');
                result = result.replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1');
                result = result.replace(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1');
                result = result.replace(/<h6[^>]*>(.*?)<\/h6>/gi, '###### $1');
                
                // Lists
                result = result.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1');
            }
            
            // Remove all remaining HTML tags
            result = result.replace(/<[^>]*>/g, '');
            
            // Decode HTML entities
            if (decodeEntities) {
                result = result.replace(/&amp;/g, '&')
                               .replace(/&lt;/g, '<')
                               .replace(/&gt;/g, '>')
                               .replace(/&quot;/g, '"')
                               .replace(/&#39;/g, "'")
                               .replace(/&nbsp;/g, ' ')
                               .replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec));
            }
            
            // Collapse whitespace
            if (collapseWhitespace) {
                result = result.replace(/\s+/g, ' ');
                
                // Preserve line breaks if they were added
                if (preserveLineBreaks) {
                    result = result.replace(/ \n /g, '\n');
                    result = result.replace(/\n +/g, '\n');
                    result = result.replace(/ +\n/g, '\n');
                    result = result.replace(/\n\n+/g, '\n\n');
                }
            }
            
            return result.trim();
        } catch (error: any) {
            return { error: `Error stripping HTML: ${error.message}` };
        }
    }
};
