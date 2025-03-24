import { callMethod } from './actions/call-method.js';
import { soapToRest } from './actions/soap-to-rest.js';
import { parseWsdl } from './actions/parse-wsdl.js';
import { generateTemplate } from './actions/generate-template.js';
import { AuthType, SoapVersion } from './common/index.js';

const soapPlugin = {
  name: 'soap',
  displayName: 'SOAP',
  description: 'Simple Object Access Protocol for communication between applications, with SOAP-to-REST capabilities',
  icon: '🧼',
  runner: 'node',
  documentation: 'https://mintflow.com/docs/plugins/soap',
  actions: [
    callMethod,
    soapToRest,
    parseWsdl,
    generateTemplate
  ],
  auth: {
    type: 'custom',
    displayName: 'SOAP Authentication',
    description: `
Configure authentication for SOAP services. Different services may require different authentication methods.

- None: No authentication
- WS Security: Username and password using WS-Security standards
- Basic Auth: HTTP Basic Authentication
- Custom Header: Add a custom SOAP header
- Certificate: Client certificate authentication
`,
    required: false,
    properties: {
      type: {
        type: 'string',
        displayName: 'Authentication Type',
        description: 'The type of authentication to use',
        required: true,
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
        displayName: 'Username',
        description: 'The username for authentication',
        required: false,
      },
      password: {
        type: 'string',
        displayName: 'Password',
        description: 'The password for authentication',
        required: false,
        secret: true,
      },
      customHeader: {
        type: 'string',
        displayName: 'Custom Header',
        description: 'The custom SOAP header to add to the request',
        required: false,
      },
      certificate: {
        type: 'string',
        displayName: 'Certificate',
        description: 'The certificate for authentication',
        required: false,
      },
      privateKey: {
        type: 'string',
        displayName: 'Private Key',
        description: 'The private key for authentication',
        required: false,
        secret: true,
      },
    },
    validate: async ({ auth }: { auth: any }) => {
      const { type, username, password, customHeader, certificate, privateKey } = auth;
      
      // Validate based on authentication type
      switch (type) {
        case AuthType.WS_SECURITY:
        case AuthType.BASIC_AUTH:
          if (!username || !password) {
            return {
              valid: false,
              error: 'Username and password are required for this authentication type',
            };
          }
          break;
        case AuthType.CUSTOM_HEADER:
          if (!customHeader) {
            return {
              valid: false,
              error: 'Custom header is required for this authentication type',
            };
          }
          break;
        case AuthType.CERTIFICATE:
          if (!certificate || !privateKey) {
            return {
              valid: false,
              error: 'Certificate and private key are required for this authentication type',
            };
          }
          break;
      }
      
      return { valid: true };
    },
  },
};

export default soapPlugin;
