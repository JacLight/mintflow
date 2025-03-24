# MintFlow SOAP Plugin

The SOAP plugin provides integration with SOAP web services, allowing you to call SOAP methods, parse WSDL files, generate SOAP templates, and even create REST-like interfaces for SOAP services.

## Features

- **Call SOAP Methods**: Execute operations defined in WSDL files
- **SOAP to REST Bridge**: Create REST-like endpoints that map to SOAP operations
- **Parse WSDL**: Extract information about services, ports, and operations from WSDL files
- **Generate SOAP Templates**: Create template SOAP messages for specific operations
- **Multiple Authentication Methods**: Support for WS-Security, Basic Auth, Custom Headers, and Certificate-based authentication
- **SOAP 1.1 and 1.2 Support**: Compatible with both SOAP versions

## Authentication

The SOAP plugin supports multiple authentication methods:

- **None**: No authentication
- **WS Security**: Username and password using WS-Security standards
- **Basic Auth**: HTTP Basic Authentication
- **Custom Header**: Add a custom SOAP header
- **Certificate**: Client certificate authentication

## Actions

### Call SOAP Method

Call a SOAP method from a WSDL specification.

**Input:**
- `wsdl`: The URL of the WSDL specification
- `method`: The SOAP method to call
- `parameters`: The parameters to pass to the SOAP method
- `authType`: The type of authentication to use
- `username`: The username for authentication (if applicable)
- `password`: The password for authentication (if applicable)
- `customHeader`: The custom SOAP header to add to the request (if applicable)
- `certificate`: The certificate for authentication (if applicable)
- `privateKey`: The private key for authentication (if applicable)
- `soapVersion`: The SOAP version to use (1.1 or 1.2)
- `returnRaw`: Whether to return the raw SOAP request and response
- `endpoint`: Override the endpoint URL (optional)

**Output:**
- `result`: The result of the SOAP method call
- `request`: The raw SOAP request (if returnRaw is true)
- `response`: The raw SOAP response (if returnRaw is true)

### SOAP to REST

Configure a REST endpoint that maps to a SOAP operation.

**Input:**
- `wsdl`: The URL of the WSDL specification
- `mappings`: The mappings between REST endpoints and SOAP operations
  - `httpMethod`: The HTTP method for the REST endpoint
  - `path`: The path for the REST endpoint (e.g., /weather/:city)
  - `soapMethod`: The SOAP method to call
  - `parameterMapping`: The mapping between SOAP parameters and REST request values
  - `responseMapping`: The mapping between SOAP response values and REST response values
- Authentication parameters (same as Call SOAP Method)
- Test request parameters:
  - `method`: The HTTP method for the test request
  - `path`: The path for the test request
  - `queryParams`: The query parameters for the test request
  - `body`: The body for the test request

**Output:**
- `bridge`: The SOAP to REST bridge configuration
- `testResult`: The result of the test request

### Parse WSDL

Parse a WSDL file and extract information about services, ports, and operations.

**Input:**
- `wsdl`: The URL of the WSDL specification
- `includeTypes`: Whether to include type definitions in the output

**Output:**
- `services`: The services defined in the WSDL
- `operations`: The operations defined in the WSDL
- `types`: The type definitions in the WSDL (if includeTypes is true)

### Generate SOAP Template

Generate a template SOAP message for a specific operation.

**Input:**
- `wsdl`: The URL of the WSDL specification
- `method`: The SOAP method to generate a template for
- `soapVersion`: The SOAP version to use (1.1 or 1.2)
- `includeComments`: Whether to include comments in the template
- `format`: Whether to format the template

**Output:**
- `template`: The generated SOAP template
- `parameters`: The parameters for the SOAP method

## Examples

### Calling a SOAP Method

```javascript
// Call the Add method of a calculator SOAP service
const result = await soap.call_method({
  wsdl: 'http://www.dneonline.com/calculator.asmx?WSDL',
  method: 'Add',
  parameters: {
    intA: 10,
    intB: 20,
  },
  authType: 'None',
  soapVersion: '1.1',
  returnRaw: false,
});

// Result: { AddResult: 30 }
```

### Creating a SOAP to REST Bridge

```javascript
// Create a REST-like endpoint for a calculator SOAP service
const bridge = await soap.soap_to_rest({
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
  authType: 'None',
  soapVersion: '1.1',
  method: 'GET',
  path: '/add/10/20',
});

// Test Result: { status: 200, data: { result: 30 } }
```

## Dependencies

This plugin uses the following libraries:
- `soap`: For SOAP client functionality
- `fast-xml-parser`: For XML processing
- `xml2js`: For XML processing
- `axios`: For HTTP requests
