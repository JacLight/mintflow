import { SoapClient, SoapToRestBridge, AuthType, SoapVersion, RestToSoapMapping, xmlUtils } from '../src/common/index.js';
import { callMethod } from '../src/actions/call-method.js';
import { soapToRest } from '../src/actions/soap-to-rest.js';
import { parseWsdl } from '../src/actions/parse-wsdl.js';
import { generateTemplate } from '../src/actions/generate-template.js';
import soapPlugin from '../src/index.js';
import nock from 'nock';
import '@types/jest';

// Mock WSDL content
const mockWsdlContent = `<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="http://schemas.xmlsoap.org/wsdl/" 
  xmlns:soap="http://schemas.xmlsoap.org/wsdl/soap/" 
  xmlns:tns="http://tempuri.org/" 
  xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
  name="Calculator" 
  targetNamespace="http://tempuri.org/">
  <types>
    <xsd:schema targetNamespace="http://tempuri.org/">
      <xsd:element name="Add">
        <xsd:complexType>
          <xsd:sequence>
            <xsd:element name="intA" type="xsd:int"/>
            <xsd:element name="intB" type="xsd:int"/>
          </xsd:sequence>
        </xsd:complexType>
      </xsd:element>
      <xsd:element name="AddResponse">
        <xsd:complexType>
          <xsd:sequence>
            <xsd:element name="AddResult" type="xsd:int"/>
          </xsd:sequence>
        </xsd:complexType>
      </xsd:element>
      <xsd:element name="Subtract">
        <xsd:complexType>
          <xsd:sequence>
            <xsd:element name="intA" type="xsd:int"/>
            <xsd:element name="intB" type="xsd:int"/>
          </xsd:sequence>
        </xsd:complexType>
      </xsd:element>
      <xsd:element name="SubtractResponse">
        <xsd:complexType>
          <xsd:sequence>
            <xsd:element name="SubtractResult" type="xsd:int"/>
          </xsd:sequence>
        </xsd:complexType>
      </xsd:element>
    </xsd:schema>
  </types>
  <message name="AddSoapIn">
    <part name="parameters" element="tns:Add"/>
  </message>
  <message name="AddSoapOut">
    <part name="parameters" element="tns:AddResponse"/>
  </message>
  <message name="SubtractSoapIn">
    <part name="parameters" element="tns:Subtract"/>
  </message>
  <message name="SubtractSoapOut">
    <part name="parameters" element="tns:SubtractResponse"/>
  </message>
  <portType name="CalculatorSoap">
    <operation name="Add">
      <input message="tns:AddSoapIn"/>
      <output message="tns:AddSoapOut"/>
    </operation>
    <operation name="Subtract">
      <input message="tns:SubtractSoapIn"/>
      <output message="tns:SubtractSoapOut"/>
    </operation>
  </portType>
  <binding name="CalculatorSoap" type="tns:CalculatorSoap">
    <soap:binding transport="http://schemas.xmlsoap.org/soap/http"/>
    <operation name="Add">
      <soap:operation soapAction="http://tempuri.org/Add" style="document"/>
      <input>
        <soap:body use="literal"/>
      </input>
      <output>
        <soap:body use="literal"/>
      </output>
    </operation>
    <operation name="Subtract">
      <soap:operation soapAction="http://tempuri.org/Subtract" style="document"/>
      <input>
        <soap:body use="literal"/>
      </input>
      <output>
        <soap:body use="literal"/>
      </output>
    </operation>
  </binding>
  <service name="Calculator">
    <port name="CalculatorSoap" binding="tns:CalculatorSoap">
      <soap:address location="http://www.dneonline.com/calculator.asmx"/>
    </port>
  </service>
</definitions>`;

// Mock SOAP responses
const mockAddResponse = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <soap:Body>
    <AddResponse xmlns="http://tempuri.org/">
      <AddResult>30</AddResult>
    </AddResponse>
  </soap:Body>
</soap:Envelope>`;

const mockSubtractResponse = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <soap:Body>
    <SubtractResponse xmlns="http://tempuri.org/">
      <SubtractResult>10</SubtractResult>
    </SubtractResponse>
  </soap:Body>
</soap:Envelope>`;

describe('SOAP Plugin', () => {
  beforeAll(() => {
    // Mock HTTP requests
    nock('http://www.dneonline.com')
      .get('/calculator.asmx?WSDL')
      .reply(200, mockWsdlContent)
      .persist();
    
    nock('http://www.dneonline.com')
      .post('/calculator.asmx')
      .reply(function(uri, requestBody) {
        // Check if the request is for Add or Subtract
        if (requestBody.includes('<Add>')) {
          return [200, mockAddResponse];
        } else if (requestBody.includes('<Subtract>')) {
          return [200, mockSubtractResponse];
        } else {
          return [400, 'Invalid request'];
        }
      })
      .persist();
  });

  afterAll(() => {
    nock.cleanAll();
  });

  describe('Plugin Structure', () => {
    it('should have the correct name and description', () => {
      expect(soapPlugin.name).toBe('soap');
      expect(soapPlugin.displayName).toBe('SOAP');
      expect(soapPlugin.description).toContain('Simple Object Access Protocol');
    });

    it('should have the correct actions', () => {
      expect(soapPlugin.actions).toContain(callMethod);
      expect(soapPlugin.actions).toContain(soapToRest);
      expect(soapPlugin.actions).toContain(parseWsdl);
      expect(soapPlugin.actions).toContain(generateTemplate);
    });

    it('should have authentication configuration', () => {
      expect(soapPlugin.auth).toBeDefined();
      expect(soapPlugin.auth.type).toBe('custom');
      expect(soapPlugin.auth.properties.type.enum).toContain(AuthType.NONE);
      expect(soapPlugin.auth.properties.type.enum).toContain(AuthType.WS_SECURITY);
      expect(soapPlugin.auth.properties.type.enum).toContain(AuthType.BASIC_AUTH);
      expect(soapPlugin.auth.properties.type.enum).toContain(AuthType.CUSTOM_HEADER);
      expect(soapPlugin.auth.properties.type.enum).toContain(AuthType.CERTIFICATE);
    });

    it('should validate authentication correctly', async () => {
      // Test with valid WS Security auth
      const validWsAuth = {
        auth: {
          type: AuthType.WS_SECURITY,
          username: 'testuser',
          password: 'testpass'
        }
      };
      const validWsResult = await soapPlugin.auth.validate(validWsAuth);
      expect(validWsResult.valid).toBe(true);

      // Test with invalid WS Security auth (missing password)
      const invalidWsAuth = {
        auth: {
          type: AuthType.WS_SECURITY,
          username: 'testuser'
        }
      };
      const invalidWsResult = await soapPlugin.auth.validate(invalidWsAuth);
      expect(invalidWsResult.valid).toBe(false);
      expect(invalidWsResult.error).toContain('required');

      // Test with valid Basic Auth
      const validBasicAuth = {
        auth: {
          type: AuthType.BASIC_AUTH,
          username: 'testuser',
          password: 'testpass'
        }
      };
      const validBasicResult = await soapPlugin.auth.validate(validBasicAuth);
      expect(validBasicResult.valid).toBe(true);

      // Test with valid Custom Header auth
      const validHeaderAuth = {
        auth: {
          type: AuthType.CUSTOM_HEADER,
          customHeader: '<CustomHeader>value</CustomHeader>'
        }
      };
      const validHeaderResult = await soapPlugin.auth.validate(validHeaderAuth);
      expect(validHeaderResult.valid).toBe(true);

      // Test with invalid Custom Header auth (missing header)
      const invalidHeaderAuth = {
        auth: {
          type: AuthType.CUSTOM_HEADER
        }
      };
      const invalidHeaderResult = await soapPlugin.auth.validate(invalidHeaderAuth);
      expect(invalidHeaderResult.valid).toBe(false);
      expect(invalidHeaderResult.error).toContain('required');

      // Test with valid Certificate auth
      const validCertAuth = {
        auth: {
          type: AuthType.CERTIFICATE,
          certificate: '-----BEGIN CERTIFICATE-----\nMIIC...',
          privateKey: '-----BEGIN PRIVATE KEY-----\nMIIE...'
        }
      };
      const validCertResult = await soapPlugin.auth.validate(validCertAuth);
      expect(validCertResult.valid).toBe(true);

      // Test with None auth
      const noneAuth = {
        auth: {
          type: AuthType.NONE
        }
      };
      const noneResult = await soapPlugin.auth.validate(noneAuth);
      expect(noneResult.valid).toBe(true);
    });
  });

  describe('SoapClient', () => {
    it('should create a client with the correct options', () => {
      const client = new SoapClient({
        wsdl: 'http://www.dneonline.com/calculator.asmx?WSDL',
        soapVersion: SoapVersion.SOAP_1_1,
      });
      
      expect(client).toBeDefined();
    });

    it('should initialize the client correctly', async () => {
      const client = new SoapClient({
        wsdl: 'http://www.dneonline.com/calculator.asmx?WSDL',
        soapVersion: SoapVersion.SOAP_1_1,
      });
      
      const soapClient = await client.initialize();
      expect(soapClient).toBeDefined();
      expect(typeof soapClient.describe).toBe('function');
    });

    it('should get methods from the WSDL', async () => {
      const client = new SoapClient({
        wsdl: 'http://www.dneonline.com/calculator.asmx?WSDL',
      });
      
      const methods = await client.getMethods();
      expect(methods).toContain('Add');
      expect(methods).toContain('Subtract');
    });

    it('should get method parameters from the WSDL', async () => {
      const client = new SoapClient({
        wsdl: 'http://www.dneonline.com/calculator.asmx?WSDL',
      });
      
      const params = await client.getMethodParams('Add');
      expect(params).toHaveProperty('intA');
      expect(params).toHaveProperty('intB');
    });

    it('should call a SOAP method successfully', async () => {
      const client = new SoapClient({
        wsdl: 'http://www.dneonline.com/calculator.asmx?WSDL',
      });
      
      const result = await client.callMethod('Add', { intA: 10, intB: 20 });
      expect(result).toHaveProperty('AddResult');
      expect(result.AddResult).toBe(30);
    });

    it('should return raw request and response when returnRaw is true', async () => {
      const client = new SoapClient({
        wsdl: 'http://www.dneonline.com/calculator.asmx?WSDL',
      });
      
      const result = await client.callMethod('Add', { intA: 10, intB: 20 }, true);
      expect(result).toHaveProperty('request');
      expect(result).toHaveProperty('response');
      expect(result).toHaveProperty('result');
      expect(result.result).toHaveProperty('AddResult');
      expect(result.result.AddResult).toBe(30);
    });
  });

  describe('SoapToRestBridge', () => {
    let soapClient: SoapClient;
    let bridge: SoapToRestBridge;
    
    beforeEach(async () => {
      soapClient = new SoapClient({
        wsdl: 'http://www.dneonline.com/calculator.asmx?WSDL',
      });
      
      const mappings: RestToSoapMapping[] = [
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
        {
          httpMethod: 'GET',
          path: '/subtract/:a/:b',
          soapMethod: 'Subtract',
          parameterMapping: {
            intA: 'request.params.a',
            intB: 'request.params.b',
          },
          responseMapping: {
            result: 'SubtractResult',
          },
        },
        {
          httpMethod: 'POST',
          path: '/calculate',
          soapMethod: 'Add',
          parameterMapping: {
            intA: 'request.body.a',
            intB: 'request.body.b',
          },
        },
      ];
      
      bridge = new SoapToRestBridge(soapClient, mappings);
    });
    
    it('should find the correct mapping for a REST request', () => {
      const mapping = bridge.findMapping('GET', '/add/10/20');
      expect(mapping).toBeDefined();
      expect(mapping?.soapMethod).toBe('Add');
      
      const subtractMapping = bridge.findMapping('GET', '/subtract/30/20');
      expect(subtractMapping).toBeDefined();
      expect(subtractMapping?.soapMethod).toBe('Subtract');
      
      const postMapping = bridge.findMapping('POST', '/calculate');
      expect(postMapping).toBeDefined();
      expect(postMapping?.soapMethod).toBe('Add');
      
      const nonExistentMapping = bridge.findMapping('GET', '/multiply/10/20');
      expect(nonExistentMapping).toBeUndefined();
    });
    
    it('should extract path parameters correctly', () => {
      const mapping = bridge.findMapping('GET', '/add/10/20');
      if (!mapping) {
        fail('Mapping not found');
        return;
      }
      
      const params = bridge.extractPathParams(mapping, '/add/10/20');
      expect(params).toEqual({ a: '10', b: '20' });
    });
    
    it('should map REST request to SOAP parameters correctly', () => {
      const mapping = bridge.findMapping('GET', '/add/10/20');
      if (!mapping) {
        fail('Mapping not found');
        return;
      }
      
      const pathParams = { a: '10', b: '20' };
      const queryParams = { extra: 'value' };
      const body = {};
      
      const soapParams = bridge.mapRestToSoap(mapping, pathParams, queryParams, body);
      expect(soapParams).toEqual({ intA: '10', intB: '20' });
    });
    
    it('should map SOAP response to REST response correctly', () => {
      const mapping = bridge.findMapping('GET', '/add/10/20');
      if (!mapping) {
        fail('Mapping not found');
        return;
      }
      
      const soapResponse = { AddResult: 30 };
      const restResponse = bridge.mapSoapToRest(mapping, soapResponse);
      expect(restResponse).toEqual({ result: 30 });
    });
    
    it('should handle a REST request successfully', async () => {
      const response = await bridge.handleRequest('GET', '/add/10/20', {}, {});
      expect(response).toHaveProperty('status', 200);
      expect(response).toHaveProperty('data');
      expect(response.data).toEqual({ result: 30 });
    });
    
    it('should handle a REST request with query parameters', async () => {
      // This mapping doesn't use query params, but we're testing that they don't interfere
      const response = await bridge.handleRequest('GET', '/add/10/20', { extra: 'value' }, {});
      expect(response).toHaveProperty('status', 200);
      expect(response.data).toEqual({ result: 30 });
    });
    
    it('should handle a REST request with body parameters', async () => {
      const response = await bridge.handleRequest('POST', '/calculate', {}, { a: 10, b: 20 });
      expect(response).toHaveProperty('status', 200);
      // This mapping doesn't have a responseMapping, so it returns the raw SOAP response
      expect(response.data).toHaveProperty('AddResult', 30);
    });
    
    it('should return an error for a non-existent mapping', async () => {
      const response = await bridge.handleRequest('GET', '/multiply/10/20', {}, {});
      expect(response).toHaveProperty('error', true);
      expect(response).toHaveProperty('status', 404);
      expect(response.message).toContain('No mapping found');
    });
  });

  describe('XML Utilities', () => {
    it('should parse XML to JSON using fast-xml-parser', () => {
      const xml = `<root><item id="1">value</item></root>`;
      const result = xmlUtils.parseXmlFast(xml);
      expect(result).toHaveProperty('root');
      expect(result.root).toHaveProperty('item');
      expect(result.root.item).toHaveProperty('@_id', '1');
      expect(result.root.item['#text']).toBe('value');
    });
    
    it('should convert JSON to XML using fast-xml-parser', () => {
      const json = {
        root: {
          item: {
            '@_id': '1',
            '#text': 'value'
          }
        }
      };
      const result = xmlUtils.jsonToXmlFast(json);
      expect(result).toContain('<root>');
      expect(result).toContain('<item id="1">value</item>');
      expect(result).toContain('</root>');
    });
    
    it('should parse XML to JSON using xml2js', async () => {
      const xml = `<root><item id="1">value</item></root>`;
      const result = await xmlUtils.parseXml(xml);
      expect(result).toHaveProperty('root');
      expect(result.root).toHaveProperty('item');
      expect(result.root.item[0]).toHaveProperty('$');
      expect(result.root.item[0].$.id).toBe('1');
      expect(result.root.item[0]._).toBe('value');
    });
    
    it('should convert JSON to XML using xml2js', () => {
      const json = {
        root: {
          item: [{
            $: { id: '1' },
            _: 'value'
          }]
        }
      };
      const result = xmlUtils.jsonToXml(json);
      expect(result).toContain('<root>');
      expect(result).toContain('<item id="1">value</item>');
      expect(result).toContain('</root>');
    });
  });

  describe('Call Method Action', () => {
    it('should have the correct schema', () => {
      expect(callMethod.name).toBe('call_method');
      expect(callMethod.inputSchema.required).toContain('wsdl');
      expect(callMethod.inputSchema.required).toContain('method');
      expect(callMethod.inputSchema.properties.parameters).toBeDefined();
      expect(callMethod.inputSchema.properties.authType).toBeDefined();
      expect(callMethod.outputSchema.properties.result).toBeDefined();
    });
    
    it('should execute successfully', async () => {
      const input = {
        data: {
          wsdl: 'http://www.dneonline.com/calculator.asmx?WSDL',
          method: 'Add',
          parameters: { intA: 10, intB: 20 },
          authType: AuthType.NONE,
          soapVersion: SoapVersion.SOAP_1_1,
          returnRaw: false,
        }
      };
      
      const result = await callMethod.execute(input, {}, {});
      expect(result).toHaveProperty('AddResult');
      expect(result.AddResult).toBe(30);
    });
    
    it('should handle errors gracefully', async () => {
      const input = {
        data: {
          wsdl: 'http://www.dneonline.com/calculator.asmx?WSDL',
          method: 'NonExistentMethod',
          parameters: {},
          authType: AuthType.NONE,
        }
      };
      
      const result = await callMethod.execute(input, {}, {});
      expect(result).toHaveProperty('error', true);
      expect(result).toHaveProperty('message');
      expect(result.message).toContain('not found');
    });
  });

  describe('SOAP to REST Action', () => {
    it('should have the correct schema', () => {
      expect(soapToRest.name).toBe('soap_to_rest');
      expect(soapToRest.inputSchema.required).toContain('wsdl');
      expect(soapToRest.inputSchema.required).toContain('mappings');
      expect(soapToRest.inputSchema.properties.mappings.items.properties.httpMethod).toBeDefined();
      expect(soapToRest.inputSchema.properties.mappings.items.properties.path).toBeDefined();
      expect(soapToRest.inputSchema.properties.mappings.items.properties.soapMethod).toBeDefined();
      expect(soapToRest.outputSchema.properties.bridge).toBeDefined();
      expect(soapToRest.outputSchema.properties.testResult).toBeDefined();
    });
    
    it('should execute successfully', async () => {
      const input = {
        data: {
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
        }
      };
      
      const result = await soapToRest.execute(input, {}, {});
      expect(result).toHaveProperty('bridge');
      expect(result).toHaveProperty('testResult');
      expect(result.testResult).toHaveProperty('status', 200);
      expect(result.testResult.data).toEqual({ result: 30 });
    });
  });

  describe('Parse WSDL Action', () => {
    it('should have the correct schema', () => {
      expect(parseWsdl.name).toBe('parse_wsdl');
      expect(parseWsdl.inputSchema.required).toContain('wsdl');
      expect(parseWsdl.inputSchema.properties.includeTypes).toBeDefined();
      expect(parseWsdl.outputSchema.properties.services).toBeDefined();
      expect(parseWsdl.outputSchema.properties.operations).toBeDefined();
    });
    
    it('should execute successfully', async () => {
      const input = {
        data: {
          wsdl: 'http://www.dneonline.com/calculator.asmx?WSDL',
          includeTypes: false,
        }
      };
      
      const result = await parseWsdl.execute(input, {}, {});
      expect(result).toHaveProperty('services');
      expect(result).toHaveProperty('operations');
      expect(result.operations.length).toBeGreaterThan(0);
      expect(result.operations[0]).toHaveProperty('name');
      expect(result.operations[0]).toHaveProperty('input');
      expect(result.operations[0]).toHaveProperty('output');
    });
  });

  describe('Generate Template Action', () => {
    it('should have the correct schema', () => {
      expect(generateTemplate.name).toBe('generate_template');
      expect(generateTemplate.inputSchema.required).toContain('wsdl');
      expect(generateTemplate.inputSchema.required).toContain('method');
      expect(generateTemplate.inputSchema.properties.soapVersion).toBeDefined();
      expect(generateTemplate.inputSchema.properties.includeComments).toBeDefined();
      expect(generateTemplate.outputSchema.properties.template).toBeDefined();
      expect(generateTemplate.outputSchema.properties.parameters).toBeDefined();
    });
    
    it('should execute successfully', async () => {
      const input = {
        data: {
          wsdl: 'http://www.dneonline.com/calculator.asmx?WSDL',
          method: 'Add',
          soapVersion: '1.1',
          includeComments: true,
          format: true,
        }
      };
      
      const result = await generateTemplate.execute(input, {}, {});
      expect(result).toHaveProperty('template');
      expect(result).toHaveProperty('parameters');
      expect(result.template).toContain('<soap:Envelope');
      expect(result.template).toContain('<Add');
      expect(result.template).toContain('intA');
      expect(result.template).toContain('intB');
    });
  });
});
