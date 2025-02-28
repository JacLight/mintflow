import { SoapClient, SoapToRestBridge, RestToSoapMapping, AuthType, SoapVersion } from '../common/index.js';

/**
 * Configure a REST endpoint that maps to a SOAP operation
 */
export const soapToRest = {
  name: 'soap_to_rest',
  displayName: 'SOAP to REST',
  description: 'Configure a REST endpoint that maps to a SOAP operation',
  icon: '',
  runner: 'node',
  inputSchema: {
    type: 'object',
    required: ['wsdl', 'mappings'],
    properties: {
      wsdl: {
        type: 'string',
        title: 'WSDL URL',
        description: 'The URL of the WSDL specification',
      },
      mappings: {
        type: 'array',
        title: 'Mappings',
        description: 'The mappings between REST endpoints and SOAP operations',
        items: {
          type: 'object',
          required: ['httpMethod', 'path', 'soapMethod', 'parameterMapping'],
          properties: {
            httpMethod: {
              type: 'string',
              title: 'HTTP Method',
              description: 'The HTTP method for the REST endpoint',
              enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
            },
            path: {
              type: 'string',
              title: 'Path',
              description: 'The path for the REST endpoint (e.g., /weather/:city)',
            },
            soapMethod: {
              type: 'string',
              title: 'SOAP Method',
              description: 'The SOAP method to call',
            },
            parameterMapping: {
              type: 'object',
              title: 'Parameter Mapping',
              description: 'The mapping between SOAP parameters and REST request values',
              additionalProperties: {
                type: 'string',
              },
            },
            responseMapping: {
              type: 'object',
              title: 'Response Mapping',
              description: 'The mapping between SOAP response values and REST response values',
              additionalProperties: {
                type: 'string',
              },
            },
          },
        },
      },
      authType: {
        type: 'string',
        title: 'Authentication Type',
        description: 'The type of authentication to use',
        enum: [
          AuthType.NONE,
          AuthType.WS_SECURITY,
          AuthType.BASIC_AUTH,
          AuthType.CUSTOM_HEADER,
          AuthType.CERTIFICATE,
        ],
        default: AuthType.NONE,
      },
      username: {
        type: 'string',
        title: 'Username',
        description: 'The username for authentication',
      },
      password: {
        type: 'string',
        title: 'Password',
        description: 'The password for authentication',
      },
      customHeader: {
        type: 'string',
        title: 'Custom Header',
        description: 'The custom SOAP header to add to the request',
      },
      certificate: {
        type: 'string',
        title: 'Certificate',
        description: 'The certificate for authentication',
      },
      privateKey: {
        type: 'string',
        title: 'Private Key',
        description: 'The private key for authentication',
      },
      soapVersion: {
        type: 'string',
        title: 'SOAP Version',
        description: 'The SOAP version to use',
        enum: [SoapVersion.SOAP_1_1, SoapVersion.SOAP_1_2],
        default: SoapVersion.SOAP_1_1,
      },
      endpoint: {
        type: 'string',
        title: 'Endpoint',
        description: 'Override the endpoint URL (optional)',
      },
      method: {
        type: 'string',
        title: 'Method',
        description: 'The HTTP method for the test request',
        enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        default: 'GET',
      },
      path: {
        type: 'string',
        title: 'Path',
        description: 'The path for the test request',
      },
      queryParams: {
        type: 'object',
        title: 'Query Parameters',
        description: 'The query parameters for the test request',
        additionalProperties: {
          type: 'string',
        },
      },
      body: {
        type: 'object',
        title: 'Body',
        description: 'The body for the test request',
        additionalProperties: true,
      },
    },
  },
  outputSchema: {
    type: 'object',
    properties: {
      bridge: {
        type: 'object',
        title: 'Bridge',
        description: 'The SOAP to REST bridge configuration',
      },
      testResult: {
        type: 'object',
        title: 'Test Result',
        description: 'The result of the test request',
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
    mappings: [
      {
        httpMethod: 'GET',
        path: '/add/:a/:b',
        soapMethod: 'Add',
        parameterMapping: {
          intA: 'request.params.a',
          intB: 'request.params.b',
        },
        responseMapping: {
          result: 'AddResult',
        },
      },
    ],
    authType: AuthType.NONE,
    soapVersion: SoapVersion.SOAP_1_1,
    method: 'GET',
    path: '/add/10/20',
  },
  exampleOutput: {
    bridge: {
      mappings: [
        {
          httpMethod: 'GET',
          path: '/add/:a/:b',
          soapMethod: 'Add',
          parameterMapping: {
            intA: 'request.params.a',
            intB: 'request.params.b',
          },
          responseMapping: {
            result: 'AddResult',
          },
        },
      ],
    },
    testResult: {
      status: 200,
      data: {
        result: 30,
      },
    },
  },
  execute: async (input: any, config: any, context: any): Promise<any> => {
    try {
      const {
        wsdl,
        mappings,
        authType,
        username,
        password,
        customHeader,
        certificate,
        privateKey,
        soapVersion,
        endpoint,
        method,
        path,
        queryParams,
        body,
      } = input.data;

      // Create a SOAP client
      const client = new SoapClient({
        wsdl,
        auth: {
          type: authType,
          username,
          password,
          customHeader,
          certificate,
          privateKey,
        },
        soapVersion,
        endpoint,
      });

      // Create a SOAP to REST bridge
      const bridge = new SoapToRestBridge(client, mappings);

      // Test the bridge if a test request is provided
      let testResult = null;
      if (method && path) {
        testResult = await bridge.handleRequest(method, path, queryParams || {}, body || {});
      }

      return {
        bridge: {
          mappings,
        },
        testResult,
      };
    } catch (error) {
      console.error('Error configuring SOAP to REST bridge:', error);
      return {
        error: true,
        message: `Failed to configure SOAP to REST bridge: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  },
};
