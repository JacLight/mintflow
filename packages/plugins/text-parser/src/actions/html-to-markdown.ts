import TurndownService from 'turndown';

export const htmlToMarkdown = {
    name: "html_to_markdown",
    description: "Convert HTML to Markdown text",
    inputSchema: {
        type: "object",
        properties: {
            html: {
                type: "string",
                description: "The HTML to convert"
            },
            headingStyle: {
                type: "string",
                description: "The style to use for headings",
                enum: ["setext", "atx"],
                default: "atx"
            },
            hr: {
                type: "string",
                description: "The string to use for horizontal rules",
                default: "---"
            },
            bulletListMarker: {
                type: "string",
                description: "The marker to use for bullet lists",
                enum: ["-", "*", "+"],
                default: "-"
            },
            codeBlockStyle: {
                type: "string",
                description: "The style to use for code blocks",
                enum: ["indented", "fenced"],
                default: "fenced"
            },
            emDelimiter: {
                type: "string",
                description: "The delimiter to use for emphasis",
                enum: ["_", "*"],
                default: "*"
            },
            strongDelimiter: {
                type: "string",
                description: "The delimiter to use for strong emphasis",
                enum: ["__", "**"],
                default: "**"
            },
            linkStyle: {
                type: "string",
                description: "The style to use for links",
                enum: ["inlined", "referenced"],
                default: "inlined"
            },
            linkReferenceStyle: {
                type: "string",
                description: "The style to use for link references",
                enum: ["full", "collapsed", "shortcut"],
                default: "full"
            }
        },
        required: ["html"]
    },
    outputSchema: {
        type: "string",
        description: "The resulting Markdown"
    },
    exampleInput: {
        html: "<h1>Hello World</h1><p>This is <strong>bold</strong> and this is <em>italic</em>.</p>"
    },
    exampleOutput: "# Hello World\n\nThis is **bold** and this is *italic*.",
    execute: async (input: any, config: any) => {
        try {
            const { html, headingStyle = "atx", hr = "---", bulletListMarker = "-", 
                    codeBlockStyle = "fenced", emDelimiter = "*", strongDelimiter = "**", 
                    linkStyle = "inlined", linkReferenceStyle = "full" } = input.data || {};
            
            if (typeof html !== 'string') {
                return { error: "The 'html' parameter must be a string" };
            }
            
            const turndownService = new TurndownService({
                headingStyle,
                hr,
                bulletListMarker,
                codeBlockStyle,
                emDelimiter,
                strongDelimiter,
                linkStyle,
                linkReferenceStyle
            });
            
            return turndownService.turndown(html);
        } catch (error: any) {
            return { error: `Error converting HTML to Markdown: ${error.message}` };
        }
    }
};
