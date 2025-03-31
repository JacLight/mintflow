import injectAction from '../src/index';

describe('Inject Plugin', () => {
    it('should inject a string value', async () => {
        const input = { name: 'testString', type: 'string', value: 'Hello, World!' };
        const result = await injectAction.actions[0].execute(input, {});
        expect(result).toEqual({ testString: 'Hello, World!' });
    });

    it('should inject a boolean value', async () => {
        const input = { name: 'testBoolean', type: 'boolean', value: 'true' };
        const result = await injectAction.actions[0].execute(input, {});
        expect(result).toEqual({ testBoolean: true });
    });

    it('should inject a number value', async () => {
        const input = { name: 'testNumber', type: 'number', value: '42' };
        const result = await injectAction.actions[0].execute(input, {});
        expect(result).toEqual({ testNumber: 42 });
    });

    it('should inject an object value', async () => {
        const input = { name: 'testObject', type: 'object', value: '{"key": "value"}' };
        const result = await injectAction.actions[0].execute(input, {});
        expect(result).toEqual({ testObject: { key: 'value' } });
    });

    it('should handle invalid JSON for object type', async () => {
        const input = { name: 'testObject', type: 'object', value: '{"key": "value"' };
        const result = await injectAction.actions[0].execute(input, {});
        expect(result).toEqual({ error: "Expected ',' or '}' after property value in JSON at position 15" });
    });
});
