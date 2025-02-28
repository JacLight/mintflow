export const replace = {
    name: "replace",
    description: "Find and replace text patterns",
    inputSchema: {
        type: "object",
        properties: {
            text: {
                type: "string",
                description: "The text to search within"
            },
            search: {
                type: "string",
                description: "The pattern to search for"
            },
            replacement: {
                type: "string",
                description: "The text to replace matches with"
            },
            useRegex: {
                type: "boolean",
                description: "Whether to interpret the search pattern as a regular expression",
                default: false
            },
            caseInsensitive: {
                type: "boolean",
                description: "Whether to perform a case-insensitive search",
                default: false
            },
            replaceAll: {
                type: "boolean",
                description: "Whether to replace all occurrences or just the first one",
                default: true
            }
        },
        required: ["text", "search", "replacement"]
    },
    outputSchema: {
        type: "string",
        description: "The text with replacements applied"
    },
    exampleInput: {
        text: "Hello world! Hello universe!",
        search: "Hello",
        replacement: "Hi",
        replaceAll: true
    },
    exampleOutput: "Hi world! Hi universe!",
    execute: async (input: any, config: any) => {
        const { text, search, replacement, useRegex, caseInsensitive, replaceAll } = input.data || {};
        
        if (typeof text !== 'string') {
            return { error: "The 'text' parameter must be a string" };
        }
        
        if (typeof search !== 'string') {
            return { error: "The 'search' parameter must be a string" };
        }
        
        if (typeof replacement !== 'string') {
            return { error: "The 'replacement' parameter must be a string" };
        }
        
        try {
            if (useRegex) {
                const flags = caseInsensitive ? 'gi' : 'g';
                const regex = new RegExp(search, replaceAll ? flags : flags.replace('g', ''));
                return text.replace(regex, replacement);
            } else {
                if (replaceAll) {
                    const regex = new RegExp(escapeRegExp(search), caseInsensitive ? 'gi' : 'g');
                    return text.replace(regex, replacement);
                } else {
                    const index = caseInsensitive 
                        ? text.toLowerCase().indexOf(search.toLowerCase())
                        : text.indexOf(search);
                    
                    if (index === -1) return text;
                    
                    return text.substring(0, index) + 
                           replacement + 
                           text.substring(index + search.length);
                }
            }
        } catch (error: any) {
            return { error: `Error performing replacement: ${error.message}` };
        }
    }
};

// Helper function to escape special regex characters
function escapeRegExp(string: string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
