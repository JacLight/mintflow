export const find = {
    name: "find",
    description: "Find text patterns and return matches",
    inputSchema: {
        type: "object",
        properties: {
            text: {
                type: "string",
                description: "The text to search within"
            },
            pattern: {
                type: "string",
                description: "The pattern to search for"
            },
            useRegex: {
                type: "boolean",
                description: "Whether to interpret the pattern as a regular expression",
                default: false
            },
            caseInsensitive: {
                type: "boolean",
                description: "Whether to perform a case-insensitive search",
                default: false
            },
            findAll: {
                type: "boolean",
                description: "Whether to find all occurrences or just the first one",
                default: true
            },
            includePosition: {
                type: "boolean",
                description: "Whether to include position information in the results",
                default: false
            }
        },
        required: ["text", "pattern"]
    },
    outputSchema: {
        oneOf: [
            {
                type: "array",
                description: "Array of matches when findAll is true",
                items: {
                    oneOf: [
                        {
                            type: "string"
                        },
                        {
                            type: "object",
                            properties: {
                                match: { type: "string" },
                                index: { type: "number" },
                                length: { type: "number" }
                            }
                        }
                    ]
                }
            },
            {
                type: "null",
                description: "No matches found"
            },
            {
                oneOf: [
                    {
                        type: "string",
                        description: "The first match when findAll is false"
                    },
                    {
                        type: "object",
                        description: "The first match with position when findAll is false and includePosition is true",
                        properties: {
                            match: { type: "string" },
                            index: { type: "number" },
                            length: { type: "number" }
                        }
                    }
                ]
            }
        ]
    },
    exampleInput: {
        text: "Hello world! Hello universe!",
        pattern: "Hello",
        findAll: true
    },
    exampleOutput: ["Hello", "Hello"],
    execute: async (input: any, config: any) => {
        const { text, pattern, useRegex, caseInsensitive, findAll = true, includePosition = false } = input.data || {};
        
        if (typeof text !== 'string') {
            return { error: "The 'text' parameter must be a string" };
        }
        
        if (typeof pattern !== 'string') {
            return { error: "The 'pattern' parameter must be a string" };
        }
        
        try {
            if (useRegex) {
                const flags = caseInsensitive ? 'gi' : 'g';
                const regex = new RegExp(pattern, findAll ? flags : flags.replace('g', ''));
                
                if (findAll) {
                    const matches = [];
                    let match;
                    
                    while ((match = regex.exec(text)) !== null) {
                        if (includePosition) {
                            matches.push({
                                match: match[0],
                                index: match.index,
                                length: match[0].length
                            });
                        } else {
                            matches.push(match[0]);
                        }
                        
                        // Prevent infinite loops for zero-length matches
                        if (match.index === regex.lastIndex) {
                            regex.lastIndex++;
                        }
                    }
                    
                    return matches.length > 0 ? matches : null;
                } else {
                    const match = regex.exec(text);
                    
                    if (!match) return null;
                    
                    if (includePosition) {
                        return {
                            match: match[0],
                            index: match.index,
                            length: match[0].length
                        };
                    } else {
                        return match[0];
                    }
                }
            } else {
                if (findAll) {
                    const matches = [];
                    let searchText = text;
                    let startIndex = 0;
                    let index;
                    
                    const searchPattern = caseInsensitive ? pattern.toLowerCase() : pattern;
                    
                    while ((index = (caseInsensitive ? searchText.toLowerCase() : searchText).indexOf(searchPattern)) !== -1) {
                        const absoluteIndex = startIndex + index;
                        
                        if (includePosition) {
                            matches.push({
                                match: searchText.substr(index, pattern.length),
                                index: absoluteIndex,
                                length: pattern.length
                            });
                        } else {
                            matches.push(searchText.substr(index, pattern.length));
                        }
                        
                        searchText = searchText.substring(index + pattern.length);
                        startIndex = absoluteIndex + pattern.length;
                    }
                    
                    return matches.length > 0 ? matches : null;
                } else {
                    const index = caseInsensitive 
                        ? text.toLowerCase().indexOf(pattern.toLowerCase())
                        : text.indexOf(pattern);
                    
                    if (index === -1) return null;
                    
                    if (includePosition) {
                        return {
                            match: text.substr(index, pattern.length),
                            index,
                            length: pattern.length
                        };
                    } else {
                        return text.substr(index, pattern.length);
                    }
                }
            }
        } catch (error: any) {
            return { error: `Error finding pattern: ${error.message}` };
        }
    }
};
