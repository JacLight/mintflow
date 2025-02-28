import * as slugifyPackage from 'slugify';

export const slugify = {
    name: "slugify",
    description: "Convert text to a URL-friendly slug",
    inputSchema: {
        type: "object",
        properties: {
            text: {
                type: "string",
                description: "The text to convert to a slug"
            },
            lowercase: {
                type: "boolean",
                description: "Whether to convert the slug to lowercase",
                default: true
            },
            replacement: {
                type: "string",
                description: "The character to replace spaces with",
                default: "-"
            },
            remove: {
                type: "string",
                description: "A regex pattern of characters to remove",
                default: ""
            },
            strict: {
                type: "boolean",
                description: "Whether to strip special characters",
                default: false
            }
        },
        required: ["text"]
    },
    outputSchema: {
        type: "string",
        description: "The slugified text"
    },
    exampleInput: {
        text: "Hello World! This is a test.",
        lowercase: true,
        replacement: "-"
    },
    exampleOutput: "hello-world-this-is-a-test",
    execute: async (input: any, config: any) => {
        try {
            const { text, lowercase = true, replacement = "-", remove = "", strict = false } = input.data || {};
            
            if (typeof text !== 'string') {
                return { error: "The 'text' parameter must be a string" };
            }
            
            // Implement our own basic slugify function if the package doesn't work
            let result = text;
            
            // Convert to lowercase if requested
            if (lowercase) {
                result = result.toLowerCase();
            }
            
            // Remove characters matching the remove pattern
            if (remove) {
                try {
                    const removeRegex = new RegExp(remove, 'g');
                    result = result.replace(removeRegex, '');
                } catch (error: any) {
                    return { error: `Invalid 'remove' regex pattern: ${error.message}` };
                }
            }
            
            // Replace spaces with the replacement character
            result = result.replace(/\s+/g, replacement);
            
            // Remove special characters if strict mode is enabled
            if (strict) {
                result = result.replace(/[^a-zA-Z0-9\-_]/g, '');
            } else {
                // Basic special character removal
                result = result
                    .replace(/[&/\\#,+()$~%.'":*?<>{}]/g, '')
                    .replace(new RegExp(`\\${replacement}+`, 'g'), replacement) // Remove duplicate separators
                    .replace(new RegExp(`^\\${replacement}|\\${replacement}$`, 'g'), ''); // Remove leading/trailing separators
            }
            
            return result;
        } catch (error: any) {
            return { error: `Error slugifying text: ${error.message}` };
        }
    }
};
