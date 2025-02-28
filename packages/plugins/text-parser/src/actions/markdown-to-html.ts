import { Converter, Flavor } from 'showdown';

export const markdownToHtml = {
    name: "markdown_to_html",
    description: "Convert Markdown text to HTML",
    inputSchema: {
        type: "object",
        properties: {
            markdown: {
                type: "string",
                description: "The Markdown text to convert"
            },
            flavor: {
                type: "string",
                description: "The flavor of Markdown to use",
                enum: ["vanilla", "original", "github"],
                default: "github"
            },
            headerLevelStart: {
                type: "number",
                description: "The minimum header level to use",
                minimum: 1,
                maximum: 6,
                default: 1
            },
            tables: {
                type: "boolean",
                description: "Whether to support tables",
                default: true
            },
            noHeaderId: {
                type: "boolean",
                description: "Whether to add an ID to headers",
                default: false
            },
            simpleLineBreaks: {
                type: "boolean",
                description: "Parse line breaks as <br> without needing 2 spaces at the end of the line",
                default: false
            },
            openLinksInNewWindow: {
                type: "boolean",
                description: "Whether to open links in a new window",
                default: false
            }
        },
        required: ["markdown"]
    },
    outputSchema: {
        type: "string",
        description: "The resulting HTML"
    },
    exampleInput: {
        markdown: "# Hello World\n\nThis is **bold** and this is *italic*.",
        flavor: "github"
    },
    exampleOutput: "<h1 id=\"hello-world\">Hello World</h1>\n<p>This is <strong>bold</strong> and this is <em>italic</em>.</p>",
    execute: async (input: any, config: any) => {
        try {
            const { markdown, flavor = "github", headerLevelStart = 1, tables = true, 
                    noHeaderId = false, simpleLineBreaks = false, openLinksInNewWindow = false } = input.data || {};
            
            if (typeof markdown !== 'string') {
                return { error: "The 'markdown' parameter must be a string" };
            }
            
            if (headerLevelStart < 1 || headerLevelStart > 6) {
                return { error: "The 'headerLevelStart' parameter must be between 1 and 6" };
            }
            
            const converter = new Converter({
                headerLevelStart,
                omitExtraWLInCodeBlocks: true,
                noHeaderId,
                tables,
                simpleLineBreaks,
                openLinksInNewWindow
            });
            
            converter.setFlavor(flavor as Flavor);
            return converter.makeHtml(markdown);
        } catch (error: any) {
            return { error: `Error converting Markdown to HTML: ${error.message}` };
        }
    }
};
