import { SoapClient } from '../common/index.js';
import { xmlUtils } from '../common/index.js';

/**
 * Generate a template SOAP message for a specific operation
 */
export const generateTemplate = {
  name: 'generate_template',
  displayName: 'Generate SOAP Template',
  description: 'Generate a template SOAP message for a specific operation',
  icon: '',
  runner: 'node',
  inputSchema: {
    type: 'object',
    required: ['wsdl', 'method'],
    properties: {
      wsdl: {
        type: 'string',
        title: 'WSDL URL',
        description: 'The URL of the WSDL specification',
      },
      method: {
        type: 'string',
        title: 'Method',
        description: 'The SOAP method to generate a template for',
      },
      soapVersion: {
        type: 'string',
        title: 'SOAP Version',
        description: 'The SOAP version to use',
        enum: ['1.1', '1.2'],
        default: '1.1',
      },
      includeComments: {
        type: 'boolean',
        title: 'Include Comments',
        description: 'Whether to include comments in the template',
        default: true,
      },
      format: {
        type: 'boolean',
        title: 'Format',
        description: 'Whether to format the template',
        default: true,
      },
    },
  },
  outputSchema: {
    type: 'object',
    properties: {
      template: {
        type: 'string',
        title: 'Template',
        description: 'The generated SOAP template',
      },
      parameters: {
        type: 'object',
        title: 'Parameters',
        description: 'The parameters for the SOAP method',
      },
      error: {
        type: 'boolean',
        title: 'Error',
        description: 'Whether an error occurred',
      },
      message: {
        type: 'string',
        title: 'Message',
        description: 'The error message if an error occurred',
      },
    },
  },
  exampleInput: {
    wsdl: 'http://www.dneonline.com/calculator.asmx?WSDL',
    method: 'Add',
    soapVersion: '1.1',
    includeComments: true,
    format: true,
  },
  exampleOutput: {
    template: `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <soap:Body>
    <Add xmlns="http://tempuri.org/">
      <!-- Integer value -->
      <intA>0</intA>
      <!-- Integer value -->
      <intB>0</intB>
    </Add>
  </soap:Body>
</soap:Envelope>`,
    parameters: {
      intA: 'xsd:int',
      intB: 'xsd:int',
    },
  },
  execute: async (input: any, config: any, context: any): Promise<any> => {
    try {
      const { wsdl, method, soapVersion, includeComments, format } = input.data;

      // Create a SOAP client
      const client = new SoapClient({
        wsdl,
        soapVersion: soapVersion as any,
      });

      // Get the method parameters
      const parameters = await client.getMethodParams(method);
      if (!parameters || Object.keys(parameters).length === 0) {
        return {
          error: true,
          message: `Method ${method} not found in WSDL or has no parameters`,
        };
      }

      // Create a template object
      const templateObj: any = {
        'soap:Envelope': {
          '@_xmlns:soap': soapVersion === '1.2' 
            ? 'http://www.w3.org/2003/05/soap-envelope/' 
            : 'http://schemas.xmlsoap.org/soap/envelope/',
          '@_xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
          '@_xmlns:xsd': 'http://www.w3.org/2001/XMLSchema',
          'soap:Body': {
            [method]: {
              '@_xmlns': 'http://tempuri.org/', // This is a placeholder, would be extracted from WSDL in a real implementation
            },
          },
        },
      };

      // Add parameters to the template
      const methodObj = templateObj['soap:Envelope']['soap:Body'][method];
      for (const [param, type] of Object.entries(parameters)) {
        // Add parameter with default value based on type
        let defaultValue: any = '';
        let comment = '';

        if (typeof type === 'string') {
          if (type.includes('int') || type.includes('decimal') || type.includes('float') || type.includes('double')) {
            defaultValue = 0;
            comment = 'Numeric value';
          } else if (type.includes('boolean')) {
            defaultValue = false;
            comment = 'Boolean value (true/false)';
          } else if (type.includes('date')) {
            defaultValue = '2023-01-01';
            comment = 'Date value (YYYY-MM-DD)';
          } else if (type.includes('time')) {
            defaultValue = '12:00:00';
            comment = 'Time value (HH:MM:SS)';
          } else if (type.includes('dateTime')) {
            defaultValue = '2023-01-01T12:00:00';
            comment = 'DateTime value (YYYY-MM-DDThh:mm:ss)';
          } else {
            defaultValue = '';
            comment = 'String value';
          }
        } else if (typeof type === 'object') {
          // Complex type
          defaultValue = {};
          comment = 'Complex type';
        }

        if (includeComments) {
          methodObj[`#comment_${param}`] = ` ${comment} `;
        }
        methodObj[param] = defaultValue;
      }

      // Convert the template object to XML
      const template = xmlUtils.jsonToXmlFast(templateObj, {
        ignoreAttributes: false,
        format: format,
        indentBy: '  ',
      });

      return {
        template,
        parameters,
      };
    } catch (error) {
      console.error('Error generating SOAP template:', error);
      return {
        error: true,
        message: `Failed to generate SOAP template: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  },
};
