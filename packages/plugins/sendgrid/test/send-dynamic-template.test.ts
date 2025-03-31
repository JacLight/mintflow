import { sendDynamicTemplate } from '../src/actions/send-dynamic-template.js';

describe('send_dynamic_template action', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should have the correct properties', () => {
        expect(sendDynamicTemplate.name).toBe('send_dynamic_template');
        expect(sendDynamicTemplate.displayName).toBe('Send Dynamic Template');
        expect(sendDynamicTemplate.description).toBe('Send an email using a dynamic template');
        expect(sendDynamicTemplate.inputSchema).toBeDefined();
        expect(sendDynamicTemplate.outputSchema).toBeDefined();
    });

    it('should have the correct input schema properties', () => {
        const schema = sendDynamicTemplate.inputSchema;
        expect(schema.properties).toBeDefined();
        
        // Check required fields
        expect(schema.required).toBeDefined();
        expect(schema.required).toContain('to');
        expect(schema.required).toContain('from');
        expect(schema.required).toContain('template_id');
        expect(schema.required).toContain('template_data');
    });

    it('should have a valid execute function', () => {
        expect(typeof sendDynamicTemplate.execute).toBe('function');
    });
});
