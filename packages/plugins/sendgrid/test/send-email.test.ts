import { sendEmail } from '../src/actions/send-email.js';

describe('send_email action', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should have the correct properties', () => {
        expect(sendEmail.name).toBe('send_email');
        expect(sendEmail.displayName).toBe('Send Email');
        expect(sendEmail.description).toBe('Send a text or HTML email');
        expect(sendEmail.inputSchema).toBeDefined();
        expect(sendEmail.outputSchema).toBeDefined();
    });

    it('should have the correct input schema properties', () => {
        const schema = sendEmail.inputSchema;
        expect(schema.properties).toBeDefined();
        
        // Check required fields
        expect(schema.required).toBeDefined();
        expect(schema.required).toContain('to');
        expect(schema.required).toContain('from');
        expect(schema.required).toContain('subject');
        expect(schema.required).toContain('content_type');
        expect(schema.required).toContain('content');
        
        // Check field types
        expect(schema.properties.to).toBeDefined();
        expect(schema.properties.from).toBeDefined();
        expect(schema.properties.subject).toBeDefined();
        expect(schema.properties.content_type).toBeDefined();
        expect(schema.properties.content).toBeDefined();
    });

    it('should have a valid execute function', () => {
        expect(typeof sendEmail.execute).toBe('function');
    });

    it('should support both text and HTML content types', () => {
        const schema = sendEmail.inputSchema;
        expect(schema.properties.content_type.enum).toBeDefined();
        expect(schema.properties.content_type.enum).toContain('text');
        expect(schema.properties.content_type.enum).toContain('html');
    });

    it('should support optional fields', () => {
        const schema = sendEmail.inputSchema;
        expect(schema.properties.reply_to).toBeDefined();
        expect(schema.properties.from_name).toBeDefined();
    });
});
