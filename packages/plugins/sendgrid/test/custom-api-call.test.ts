import { customApiCall } from '../src/actions/custom-api-call.js';

describe('custom_api_call action', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should have the correct properties', () => {
        expect(customApiCall.name).toBe('custom_api_call');
        expect(customApiCall.displayName).toBe('Custom API Call');
        expect(customApiCall.description).toBe('Make a custom API call to SendGrid');
        expect(customApiCall.inputSchema).toBeDefined();
        expect(customApiCall.outputSchema).toBeDefined();
    });

    it('should have the correct input schema properties', () => {
        const schema = customApiCall.inputSchema;
        expect(schema.properties).toBeDefined();
        
        // Check required fields
        expect(schema.required).toBeDefined();
        expect(schema.required).toContain('method');
        expect(schema.required).toContain('path');
        
        // Check field types
        expect(schema.properties.method).toBeDefined();
        expect(schema.properties.path).toBeDefined();
        expect(schema.properties.queryParams).toBeDefined();
        expect(schema.properties.body).toBeDefined();
    });

    it('should have a valid execute function', () => {
        expect(typeof customApiCall.execute).toBe('function');
    });

    it('should support various HTTP methods', () => {
        const schema = customApiCall.inputSchema;
        expect(schema.properties.method.enum).toBeDefined();
        expect(schema.properties.method.enum).toContain('GET');
        expect(schema.properties.method.enum).toContain('POST');
        expect(schema.properties.method.enum).toContain('PUT');
        expect(schema.properties.method.enum).toContain('PATCH');
        expect(schema.properties.method.enum).toContain('DELETE');
    });
});
