import { concat } from '../src/actions/concat.js';

describe('concat action', () => {
    it('should concatenate array of strings with no separator', async () => {
        const input = { data: { texts: ['Hello', 'World'] } };
        const result = await concat.execute(input, {});
        expect(result).toEqual('HelloWorld');
    });

    it('should concatenate array of strings with a space separator', async () => {
        const input = { data: { texts: ['Hello', 'World'], separator: ' ' } };
        const result = await concat.execute(input, {});
        expect(result).toEqual('Hello World');
    });

    it('should concatenate array of strings with a custom separator', async () => {
        const input = { data: { texts: ['Hello', 'World'], separator: '-' } };
        const result = await concat.execute(input, {});
        expect(result).toEqual('Hello-World');
    });

    it('should handle empty array', async () => {
        const input = { data: { texts: [] } };
        const result = await concat.execute(input, {});
        expect(result).toEqual('');
    });

    it('should handle array with one element', async () => {
        const input = { data: { texts: ['Hello'] } };
        const result = await concat.execute(input, {});
        expect(result).toEqual('Hello');
    });

    it('should handle non-array input', async () => {
        const input = { data: { texts: 'Not an array' } };
        const result = await concat.execute(input, {});
        expect(result).toHaveProperty('error');
    });

    it('should handle undefined input', async () => {
        const input = { data: {} };
        const result = await concat.execute(input, {});
        expect(result).toEqual('');
    });
});
