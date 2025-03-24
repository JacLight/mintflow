import { SoapClient, AuthType, SoapVersion } from '../common/index.js';

/**
 * Call a SOAP method from a WSDL specification
 */
export const callMethod = {
  name: 'call_method',
  displayName: 'Call SOAP Method',
  description: 'Call a SOAP method from a WSDL specification',
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
        description: 'The SOAP method to call',
      },
      parameters: {
        type: 'object',
        title: 'Parameters',
        description: 'The parameters to pass to the SOAP method',
        additionalProperties: true,
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
      returnRaw: {
        type: 'boolean',
        title: 'Return Raw',
        description: 'Whether to return the raw SOAP request and response',
        default: false,
      },
      endpoint: {
        type: 'string',
        title: 'Endpoint',
        description: 'Override the endpoint URL (optional)',
      },
    },
  },
  outputSchema: {
    type: 'object',
    properties: {
      result: {
        type: 'object',
        title: 'Result',
        description: 'The result of the SOAP method call',
      },
      request: {
        type: 'string',
        title: 'Request',
        description: 'The raw SOAP request',
      },
      response: {
        type: 'string',
        title: 'Response',
        description: 'The raw SOAP response',
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
    parameters: {
      intA: 10,
      intB: 20,
    },
    authType: AuthType.NONE,
    soapVersion: SoapVersion.SOAP_1_1,
    returnRaw: false,
  },
  exampleOutput: {
    result: {
      AddResult: 30,
    },
  },
  execute: async (input: any, config: any, context: any): Promise<any> => {
    try {
      const {
        wsdl,
        method,
        parameters,
        authType,
        username,
        password,
        customHeader,
        certificate,
        privateKey,
        soapVersion,
        returnRaw,
        endpoint,
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

      // Call the SOAP method
      const result = await client.callMethod(method, parameters || {}, returnRaw);

      return result;
    } catch (error) {
      console.error('Error calling SOAP method:', error);
      return {
        error: true,
        message: `Failed to call SOAP method: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  },
};
