import * as soap from 'soap';
import axios from 'axios';
import { XMLParser, XMLBuilder } from 'fast-xml-parser';
import * as xml2js from 'xml2js';

// Authentication types
export enum AuthType {
  NONE = 'None',
  WS_SECURITY = 'WS',
  BASIC_AUTH = 'Basic',
  CUSTOM_HEADER = 'Header',
  CERTIFICATE = 'Certificate',
}

// SOAP versions
export enum SoapVersion {
  SOAP_1_1 = '1.1',
  SOAP_1_2 = '1.2',
}

// Interface for authentication
export interface SoapAuth {
  type: AuthType;
  username?: string;
  password?: string;
  customHeader?: string;
  certificate?: string;
  privateKey?: string;
}

// Interface for SOAP client options
export interface SoapClientOptions {
  wsdl: string;
  auth?: SoapAuth;
  soapVersion?: SoapVersion;
  timeout?: number;
  forceSoap12Headers?: boolean;
  disableCache?: boolean;
  httpClient?: any;
  endpoint?: string;
}

// SOAP client class
export class SoapClient {
  private client: soap.Client | null = null;
  private options: SoapClientOptions;
  private wsdlCache: Record<string, any> = {};

  constructor(options: SoapClientOptions) {
    this.options = {
      ...options,
      soapVersion: options.soapVersion || SoapVersion.SOAP_1_1,
      timeout: options.timeout || 30000,
      forceSoap12Headers: options.forceSoap12Headers || false,
      disableCache: options.disableCache || false,
    };
  }

  // Initialize the SOAP client
  async initialize(): Promise<soap.Client> {
    if (this.client) {
      return this.client;
    }

    try {
      const clientOptions: soap.IOptions = {
        forceSoap12Headers: this.options.soapVersion === SoapVersion.SOAP_1_2 || this.options.forceSoap12Headers,
        disableCache: this.options.disableCache,
        httpClient: this.options.httpClient,
        endpoint: this.options.endpoint,
      };

      this.client = await soap.createClientAsync(this.options.wsdl, clientOptions);

      // Apply authentication if provided
      if (this.options.auth) {
        this.applyAuthentication(this.client, this.options.auth);
      }

      return this.client;
    } catch (error) {
      console.error('Error initializing SOAP client:', error);
      throw new Error(`Failed to initialize SOAP client: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Apply authentication to the SOAP client
  private applyAuthentication(client: soap.Client, auth: SoapAuth): void {
    switch (auth.type) {
      case AuthType.WS_SECURITY:
        if (auth.username && auth.password) {
          client.setSecurity(new soap.WSSecurity(auth.username, auth.password));
        }
        break;
      case AuthType.BASIC_AUTH:
        if (auth.username && auth.password) {
          client.setSecurity(new soap.BasicAuthSecurity(auth.username, auth.password));
        }
        break;
      case AuthType.CUSTOM_HEADER:
        if (auth.customHeader) {
          client.addSoapHeader(auth.customHeader);
        }
        break;
      case AuthType.CERTIFICATE:
        if (auth.certificate && auth.privateKey) {
          client.setSecurity(new soap.ClientSSLSecurity(auth.privateKey, auth.certificate));
        }
        break;
      case AuthType.NONE:
      default:
        // No authentication needed
        break;
    }
  }

  // Get available methods from the WSDL
  async getMethods(): Promise<string[]> {
    const client = await this.initialize();
    const description = client.describe();
    
    // Extract methods from the description
    const services = Object.keys(description);
    if (services.length === 0) {
      return [];
    }
    
    const ports = Object.keys(description[services[0]]);
    if (ports.length === 0) {
      return [];
    }
    
    const methods = Object.keys(description[services[0]][ports[0]]);
    return methods;
  }

  // Get method parameters from the WSDL
  async getMethodParams(methodName: string): Promise<Record<string, any>> {
    const client = await this.initialize();
    const description = client.describe();
    
    // Extract method parameters from the description
    const services = Object.keys(description);
    if (services.length === 0) {
      return {};
    }
    
    const ports = Object.keys(description[services[0]]);
    if (ports.length === 0) {
      return {};
    }
    
    const method = description[services[0]][ports[0]][methodName];
    if (!method || !method.input) {
      return {};
    }
    
    return method.input;
  }

  // Call a SOAP method
  async callMethod(methodName: string, args: Record<string, any>, returnRaw = false): Promise<any> {
    try {
      const client = await this.initialize();
      
      // Get the method function
      const methodFn = client[methodName + 'Async'];
      if (!methodFn) {
        throw new Error(`Method ${methodName} not found in WSDL`);
      }
      
      // Call the method
      const [result] = await methodFn(args);
      
      if (returnRaw) {
        return {
          request: client.lastRequest,
          response: client.lastResponse,
          result,
        };
      }
      
      return result;
    } catch (error) {
      console.error(`Error calling SOAP method ${methodName}:`, error);
      
      // If client is available, include the last request in the error
      const errorResponse: any = {
        error: true,
        message: error instanceof Error ? error.message : String(error),
      };
      
      if (this.client) {
        errorResponse.raw = {
          request: this.client.lastRequest,
          response: (error as any).body || '',
        };
      }
      
      return errorResponse;
    }
  }
}

// SOAP to REST bridge
export class SoapToRestBridge {
  private soapClient: SoapClient;
  private mappings: RestToSoapMapping[];
  
  constructor(soapClient: SoapClient, mappings: RestToSoapMapping[]) {
    this.soapClient = soapClient;
    this.mappings = mappings;
  }
  
  // Find a mapping for a REST request
  findMapping(method: string, path: string): RestToSoapMapping | undefined {
    return this.mappings.find(mapping => {
      // Check if the HTTP method matches
      if (mapping.httpMethod !== method) {
        return false;
      }
      
      // Check if the path matches (including path parameters)
      const pathPattern = new RegExp('^' + mapping.path.replace(/:\w+/g, '([^/]+)') + '$');
      return pathPattern.test(path);
    });
  }
  
  // Extract path parameters from a path
  extractPathParams(mapping: RestToSoapMapping, path: string): Record<string, string> {
    const params: Record<string, string> = {};
    
    // Convert the mapping path to a regex pattern with named capture groups
    const pathParts = mapping.path.split('/');
    const actualParts = path.split('/');
    
    for (let i = 0; i < pathParts.length; i++) {
      const part = pathParts[i];
      if (part.startsWith(':')) {
        const paramName = part.substring(1);
        params[paramName] = actualParts[i];
      }
    }
    
    return params;
  }
  
  // Map REST request to SOAP parameters
  mapRestToSoap(
    mapping: RestToSoapMapping, 
    pathParams: Record<string, string>, 
    queryParams: Record<string, string>, 
    body: any
  ): Record<string, any> {
    const soapParams: Record<string, any> = {};
    
    // Apply parameter mapping
    for (const [soapParam, restPath] of Object.entries(mapping.parameterMapping)) {
      // Evaluate the rest path to get the value
      let value: any = undefined;
      
      if (restPath.startsWith('request.params.')) {
        const paramName = restPath.substring('request.params.'.length);
        value = pathParams[paramName];
      } else if (restPath.startsWith('request.query.')) {
        const parts = restPath.substring('request.query.'.length).split('||');
        const queryName = parts[0].trim();
        value = queryParams[queryName];
        
        // Apply default value if provided and value is undefined
        if (value === undefined && parts.length > 1) {
          const defaultValue = parts[1].trim();
          // Remove quotes if present
          value = defaultValue.startsWith("'") && defaultValue.endsWith("'") 
            ? defaultValue.substring(1, defaultValue.length - 1)
            : defaultValue;
        }
      } else if (restPath.startsWith('request.body.')) {
        const bodyPath = restPath.substring('request.body.'.length).split('.');
        value = bodyPath.reduce((obj, key) => obj && obj[key], body);
      }
      
      if (value !== undefined) {
        soapParams[soapParam] = value;
      }
    }
    
    return soapParams;
  }
  
  // Map SOAP response to REST response
  mapSoapToRest(mapping: RestToSoapMapping, soapResponse: any): any {
    if (!mapping.responseMapping) {
      return soapResponse;
    }
    
    const restResponse: Record<string, any> = {};
    
    // Apply response mapping
    for (const [restField, soapPath] of Object.entries(mapping.responseMapping)) {
      // Evaluate the soap path to get the value
      const pathParts = soapPath.split('.');
      let value = pathParts.reduce((obj, key) => obj && obj[key], soapResponse);
      
      if (value !== undefined) {
        // Set the value in the REST response
        const fieldParts = restField.split('.');
        let current = restResponse;
        
        for (let i = 0; i < fieldParts.length - 1; i++) {
          const part = fieldParts[i];
          if (!current[part]) {
            current[part] = {};
          }
          current = current[part];
        }
        
        current[fieldParts[fieldParts.length - 1]] = value;
      }
    }
    
    return restResponse;
  }
  
  // Handle a REST request
  async handleRequest(
    method: string, 
    path: string, 
    queryParams: Record<string, string>, 
    body: any
  ): Promise<any> {
    // Find a mapping for the request
    const mapping = this.findMapping(method, path);
    if (!mapping) {
      return {
        error: true,
        message: `No mapping found for ${method} ${path}`,
        status: 404,
      };
    }
    
    // Extract path parameters
    const pathParams = this.extractPathParams(mapping, path);
    
    // Map REST request to SOAP parameters
    const soapParams = this.mapRestToSoap(mapping, pathParams, queryParams, body);
    
    // Call the SOAP method
    const soapResponse = await this.soapClient.callMethod(mapping.soapMethod, soapParams);
    
    // Check for errors
    if (soapResponse.error) {
      return {
        error: true,
        message: soapResponse.message,
        status: 500,
        details: soapResponse.raw,
      };
    }
    
    // Map SOAP response to REST response
    const restResponse = this.mapSoapToRest(mapping, soapResponse);
    
    return {
      status: 200,
      data: restResponse,
    };
  }
}

// Interface for REST to SOAP mapping
export interface RestToSoapMapping {
  httpMethod: string;
  path: string;
  soapMethod: string;
  parameterMapping: Record<string, string>;
  responseMapping?: Record<string, string>;
}

// XML utilities
export const xmlUtils = {
  // Parse XML to JSON
  parseXml: async (xml: string, options?: any): Promise<any> => {
    return new Promise((resolve, reject) => {
      xml2js.parseString(xml, options || {}, (err: any, result: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  },
  
  // Convert JSON to XML
  jsonToXml: (json: any, options?: any): string => {
    const builder = new xml2js.Builder(options || {});
    return builder.buildObject(json);
  },
  
  // Parse XML to JSON using fast-xml-parser
  parseXmlFast: (xml: string, options?: any): any => {
    const parser = new XMLParser(options || {
      ignoreAttributes: false,
      parseAttributeValue: true,
      trimValues: true,
    });
    return parser.parse(xml);
  },
  
  // Convert JSON to XML using fast-xml-parser
  jsonToXmlFast: (json: any, options?: any): string => {
    const builder = new XMLBuilder(options || {
      ignoreAttributes: false,
      format: true,
      indentBy: '  ',
    });
    return builder.build(json);
  },
};
