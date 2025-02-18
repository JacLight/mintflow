export interface NodeImplementation {
    language: 'js' | 'python';
    code: string; // Actual implementation code (hidden from UI)
}

export interface NodeDefinition {
    nodeId: string;
    name: string;
    description: string;
    examples: any; // This can be an array or object with sample inputs/outputs
    documentation: string;
    icon: string; // URL or icon name
    inputSchema: any; // JSON Schema or primitive type descriptor
    outputSchema: any; // JSON Schema or primitive type descriptor
    uiInputSchema: any; // Schema to build UI input forms
    implementation: NodeImplementation;
}

// For demonstration, we store a few nodes in memory.
export const nodeDefinitions: NodeDefinition[] = [
    {
        nodeId: 'addOne',
        name: 'Add One',
        description: 'Adds one to a numeric input.',
        examples: { input: 5, output: 6 },
        documentation: 'This node receives a number and returns the number plus one.',
        icon: 'plus-icon.png',
        inputSchema: { type: 'number' },
        outputSchema: { type: 'number' },
        uiInputSchema: { type: 'number', label: 'Enter a number' },
        implementation: {
            language: 'js',
            code: `
        export async function main(input) {
          if (typeof input !== 'number') throw new Error("Input must be a number");
          return input + 1;
        }
      `
        }
    },
    {
        nodeId: 'reverseString',
        name: 'Reverse String',
        description: 'Reverses a string input.',
        examples: { input: "hello", output: "olleh" },
        documentation: 'This node reverses the given string.',
        icon: 'reverse-icon.png',
        inputSchema: { type: 'string' },
        outputSchema: { type: 'string' },
        uiInputSchema: { type: 'string', label: 'Enter a string' },
        implementation: {
            language: 'js',
            code: `
        export async function main(input) {
          if (typeof input !== 'string') throw new Error("Input must be a string");
          return input.split('').reverse().join('');
        }
      `
        }
    },
    {
        nodeId: 'httpFetch',
        name: 'HTTP Fetch',
        description: 'Fetches data from a given URL.',
        examples: { input: { url: "https://api.example.com/data" }, output: { data: "..." } },
        documentation: 'This node performs an HTTP GET request to the provided URL and returns the response data.',
        icon: 'http-icon.png',
        inputSchema: {
            type: 'object',
            properties: {
                url: { type: 'string', format: 'uri' }
            },
            required: ['url']
        },
        outputSchema: { type: 'object' },
        uiInputSchema: { type: 'object', label: 'URL', properties: { url: { type: 'string' } } },
        implementation: {
            language: 'js',
            code: `
        import axios from 'axios';
        export async function main(input) {
          if (!input.url) throw new Error("Missing URL");
          const response = await axios.get(input.url);
          return response.data;
        }
      `
        }
    }
];
