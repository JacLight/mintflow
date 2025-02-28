import { SoapClient } from '../common/index.js';
import * as soap from 'soap';

/**
 * Parse a WSDL file and extract information about services, ports, and operations
 */
export const parseWsdl = {
  name: 'parse_wsdl',
  displayName: 'Parse WSDL',
  description: 'Parse a WSDL file and extract information about services, ports, and operations',
  icon: '',
  runner: 'node',
  inputSchema: {
    type: 'object',
    required: ['wsdl'],
    properties: {
      wsdl: {
        type: 'string',
        title: 'WSDL URL',
        description: 'The URL of the WSDL specification',
      },
      includeTypes: {
        type: 'boolean',
        title: 'Include Types',
        description: 'Whether to include type definitions in the output',
        default: false,
      },
    },
  },
  outputSchema: {
    type: 'object',
    properties: {
      services: {
        type: 'object',
        title: 'Services',
        description: 'The services defined in the WSDL',
      },
      operations: {
        type: 'array',
        title: 'Operations',
        description: 'The operations defined in the WSDL',
        items: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              title: 'Name',
              description: 'The name of the operation',
            },
            service: {
              type: 'string',
              title: 'Service',
              description: 'The service the operation belongs to',
            },
            port: {
              type: 'string',
              title: 'Port',
              description: 'The port the operation belongs to',
            },
            input: {
              type: 'object',
              title: 'Input',
              description: 'The input parameters for the operation',
            },
            output: {
              type: 'object',
              title: 'Output',
              description: 'The output parameters for the operation',
            },
          },
        },
      },
      types: {
        type: 'object',
        title: 'Types',
        description: 'The type definitions in the WSDL',
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
    includeTypes: false,
  },
  exampleOutput: {
    services: {
      Calculator: {
        CalculatorSoap: {
          Add: {
            input: {
              intA: 'xsd:int',
              intB: 'xsd:int',
            },
            output: {
              AddResult: 'xsd:int',
            },
          },
          Subtract: {
            input: {
              intA: 'xsd:int',
              intB: 'xsd:int',
            },
            output: {
              SubtractResult: 'xsd:int',
            },
          },
        },
      },
    },
    operations: [
      {
        name: 'Add',
        service: 'Calculator',
        port: 'CalculatorSoap',
        input: {
          intA: 'xsd:int',
          intB: 'xsd:int',
        },
        output: {
          AddResult: 'xsd:int',
        },
      },
      {
        name: 'Subtract',
        service: 'Calculator',
        port: 'CalculatorSoap',
        input: {
          intA: 'xsd:int',
          intB: 'xsd:int',
        },
        output: {
          SubtractResult: 'xsd:int',
        },
      },
    ],
  },
  execute: async (input: any, config: any, context: any): Promise<any> => {
    try {
      const { wsdl, includeTypes } = input.data;

      // Create a SOAP client
      const client = await soap.createClientAsync(wsdl);
      
      // Get the WSDL description
      const description = client.describe();
      
      // Extract operations
      const operations: any[] = [];
      const services = Object.keys(description);
      
      for (const service of services) {
        const ports = Object.keys(description[service]);
        
        for (const port of ports) {
          const methods = Object.keys(description[service][port]);
          
          for (const method of methods) {
            operations.push({
              name: method,
              service,
              port,
              input: description[service][port][method].input,
              output: description[service][port][method].output,
            });
          }
        }
      }
      
      // Get type definitions if requested
      let types = null;
      if (includeTypes) {
        // This is a simplified approach - in a real implementation,
        // you would parse the WSDL XML to extract the type definitions
        types = client.wsdl?.definitions?.schemas;
      }
      
      return {
        services: description,
        operations,
        ...(includeTypes ? { types } : {}),
      };
    } catch (error) {
      console.error('Error parsing WSDL:', error);
      return {
        error: true,
        message: `Failed to parse WSDL: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  },
};
