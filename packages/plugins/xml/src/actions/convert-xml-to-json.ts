import { XMLParser } from 'fast-xml-parser';

/**
 * Converts an XML string to a JSON object
 */
export const convertXmlToJson = {
    name: 'convert_xml_to_json',
    displayName: 'Convert XML to JSON',
    description: 'Converts an XML string to a JSON object',
    icon: '',
    runner: 'node',
    inputSchema: {
        type: 'object',
        required: ['xml'],
        properties: {
            xml: {
                type: 'string',
                title: 'XML',
                description: 'The XML string to convert',
            },
            preserveOrder: {
                type: 'boolean',
                title: 'Preserve Order',
                description: 'Whether to preserve the order of elements',
                default: false,
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
                description: 'The parsed JSON object',
            },
            error: {
                type: 'string',
                title: 'Error',
                description: 'Error message if parsing failed',
            },
        },
    },
    exampleInput: {
        xml: '<root><person><name>John</name><age>30</age></person></root>',
        preserveOrder: false,
        ignoreAttributes: false,
    },
    exampleOutput: {
        result: {
            root: {
                person: {
                    name: 'John',
                    age: 30,
                },
            },
        },
    },
    execute: async (input: any, config: any, context: any): Promise<any> => {
        try {
            const { xml, preserveOrder = false, ignoreAttributes = false } = input.data;

            if (!xml) {
                return {
                    error: 'XML is required',
                };
            }

            // Configure the XML parser
            const options = {
                ignoreAttributes: ignoreAttributes,
                preserveOrder: preserveOrder,
                parseAttributeValue: true,
                trimValues: true,
            };

            // Create a new parser with the options
            const parser = new XMLParser(options);

            // Parse the XML
            const result = parser.parse(xml);

            return {
                result,
            };
        } catch (error) {
            console.error('Error parsing XML:', error);
            return {
                error: `Failed to parse XML: ${error instanceof Error ? error.message : String(error)}`,
            };
        }
    },
};
