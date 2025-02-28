import { XMLBuilder } from 'fast-xml-parser';

/**
 * Converts a JSON object to an XML string
 */
export const convertJsonToXml = {
    name: 'convert_json_to_xml',
    displayName: 'Convert JSON to XML',
    description: 'Converts a JSON object to an XML string',
    icon: '',
    runner: 'node',
    inputSchema: {
        type: 'object',
        required: ['json'],
        properties: {
            json: {
                type: 'object',
                title: 'JSON',
                description: 'The JSON object to convert',
            },
            rootName: {
                type: 'string',
                title: 'Root Element Name',
                description: 'The name of the root XML element (if not already specified in the JSON)',
                default: 'root',
            },
            format: {
                type: 'boolean',
                title: 'Format XML',
                description: 'Whether to format the XML with indentation for readability',
                default: false,
            },
            ignoreAttributes: {
                type: 'boolean',
                title: 'Ignore Attributes',
                description: 'Whether to ignore XML attributes in the JSON object',
                default: false,
            },
        },
    },
    outputSchema: {
        type: 'object',
        properties: {
            xml: {
                type: 'string',
                title: 'XML',
                description: 'The generated XML string',
            },
            error: {
                type: 'string',
                title: 'Error',
                description: 'Error message if conversion failed',
            },
        },
    },
    exampleInput: {
        json: {
            person: {
                name: 'John',
                age: 30,
            },
        },
        rootName: 'root',
        format: true,
    },
    exampleOutput: {
        xml: '<root>\n  <person>\n    <name>John</name>\n    <age>30</age>\n  </person>\n</root>',
    },
    execute: async (input: any, config: any, context: any): Promise<any> => {
        try {
            const { json, rootName = 'root', format = false, ignoreAttributes = false } = input.data;

            if (json === undefined || json === null) {
                return {
                    error: 'JSON is required',
                };
            }

            // Configure the XML builder
            const options = {
                ignoreAttributes: ignoreAttributes,
                format: format,
                indentBy: '  ',
            };

            // Create a new builder with the options
            const builder = new XMLBuilder(options);

            // Prepare the data for conversion
            let data = json;

            // If the JSON doesn't have a root element, add one
            if (typeof json === 'object' && !Array.isArray(json) && Object.keys(json).length > 1) {
                data = { [rootName]: json };
            } else if (Array.isArray(json)) {
                data = { [rootName]: { item: json } };
            }

            // Convert the JSON to XML
            const xml = builder.build(data);

            return {
                xml,
            };
        } catch (error) {
            console.error('Error converting JSON to XML:', error);
            return {
                error: `Failed to convert JSON to XML: ${error instanceof Error ? error.message : String(error)}`,
            };
        }
    },
};
