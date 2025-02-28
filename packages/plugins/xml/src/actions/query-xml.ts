import { XMLParser } from 'fast-xml-parser';

/**
 * Queries an XML string using a simple path expression
 */
export const queryXml = {
    name: 'query_xml',
    displayName: 'Query XML',
    description: 'Extracts data from an XML string using a simple path expression',
    icon: '',
    runner: 'node',
    inputSchema: {
        type: 'object',
        required: ['xml', 'path'],
        properties: {
            xml: {
                type: 'string',
                title: 'XML',
                description: 'The XML string to query',
            },
            path: {
                type: 'string',
                title: 'Path',
                description: 'The path to the element(s) to extract (e.g., "root.person.name")',
            },
            ignoreAttributes: {
                type: 'boolean',
                title: 'Ignore Attributes',
                description: 'Whether to ignore XML attributes',
                default: false,
            },
        },
    },
    outputSchema: {
        type: 'object',
        properties: {
            result: {
                type: 'object',
                title: 'Result',
                description: 'The extracted data',
            },
            error: {
                type: 'string',
                title: 'Error',
                description: 'Error message if querying failed',
            },
        },
    },
    exampleInput: {
        xml: '<root><person><name>John</name><age>30</age></person><person><name>Jane</name><age>25</age></person></root>',
        path: 'root.person',
    },
    exampleOutput: {
        result: [
            {
                name: 'John',
                age: 30,
            },
            {
                name: 'Jane',
                age: 25,
            },
        ],
    },
    execute: async (input: any, config: any, context: any): Promise<any> => {
        try {
            const { xml, path, ignoreAttributes = false } = input.data;

            if (!xml) {
                return {
                    error: 'XML is required',
                };
            }

            if (!path) {
                return {
                    error: 'Path is required',
                };
            }

            // Configure the XML parser
            const options = {
                ignoreAttributes: ignoreAttributes,
                parseAttributeValue: true,
                trimValues: true,
            };

            // Create a new parser with the options
            const parser = new XMLParser(options);

            // Parse the XML
            const jsonObj = parser.parse(xml);

            // Split the path into segments
            const segments = path.split('.');

            // Navigate through the JSON object using the path segments
            let result = jsonObj;
            for (const segment of segments) {
                if (result === undefined || result === null) {
                    return {
                        error: `Path segment '${segment}' not found`,
                    };
                }
                result = result[segment];
            }

            return {
                result,
            };
        } catch (error) {
            console.error('Error querying XML:', error);
            return {
                error: `Failed to query XML: ${error instanceof Error ? error.message : String(error)}`,
            };
        }
    },
};
