import { XMLValidator } from 'fast-xml-parser';

/**
 * Validates an XML string
 */
export const validateXml = {
    name: 'validate_xml',
    displayName: 'Validate XML',
    description: 'Validates an XML string for well-formedness',
    icon: '',
    runner: 'node',
    inputSchema: {
        type: 'object',
        required: ['xml'],
        properties: {
            xml: {
                type: 'string',
                title: 'XML',
                description: 'The XML string to validate',
            },
        },
    },
    outputSchema: {
        type: 'object',
        properties: {
            valid: {
                type: 'boolean',
                title: 'Valid',
                description: 'Whether the XML is valid',
            },
            error: {
                type: 'string',
                title: 'Error',
                description: 'Error message if validation failed',
            },
        },
    },
    exampleInput: {
        xml: '<root><person><name>John</name><age>30</age></person></root>',
    },
    exampleOutput: {
        valid: true,
    },
    execute: async (input: any, config: any, context: any): Promise<any> => {
        try {
            const { xml } = input.data;

            if (!xml) {
                return {
                    valid: false,
                    error: 'XML is required',
                };
            }

            // Validate the XML
            const result = XMLValidator.validate(xml);

            // If the result is true, the XML is valid
            if (result === true) {
                return {
                    valid: true,
                };
            }

            // If the result is an object, it contains the error information
            return {
                valid: false,
                error: result.err.msg,
            };
        } catch (error) {
            console.error('Error validating XML:', error);
            return {
                valid: false,
                error: `Failed to validate XML: ${error instanceof Error ? error.message : String(error)}`,
            };
        }
    },
};
