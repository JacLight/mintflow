import reduce from '../src/actions/reduce';

describe('reduce action', () => {
    it('should sum array of numbers', async () => {
        const input = { array: [{ a: 1 }, { a: 2 }, { a: 3 }], accumulator: '0', field: 'a', operation: 'sum' };
        const result = await reduce.execute(input, {});
        expect(result).toEqual(6);
    });

    it('should multiply array of numbers', async () => {
        const input = { array: [{ a: 1 }, { a: 2 }, { a: 3 }], accumulator: '1', field: 'a', operation: 'product' };
        const result = await reduce.execute(input, {});
        expect(result).toEqual(6);
    });

    it('should average array of numbers', async () => {
        const input = { array: [{ a: 1 }, { a: 2 }, { a: 3 }], accumulator: '0', field: 'a', operation: 'average' };
        const result = await reduce.execute(input, {});
        expect(result).toEqual(2);
    });

    it('should concatenate array of strings', async () => {
        const input = { array: [{ a: 'a' }, { a: 'b' }, { a: 'c' }], accumulator: '', field: 'a', operation: 'concat', separator: ', ' };
        const result = await reduce.execute(input, {});
        expect(result).toEqual('a, b, c');
    });

    it('should apply custom operation', async () => {
        const input = { array: [{ a: 1 }, { a: 2 }, { a: 3 }], accumulator: '0', field: 'a', operation: 'custom', customOperation: 'acc + current.a' };
        const result = await reduce.execute(input, {});
        expect(result).toEqual(6);
    });

    it('should handle empty array', async () => {
        const input = { array: [], accumulator: '0', field: 'a', operation: 'sum' };
        const result = await reduce.execute(input, {});
        expect(result).toEqual(0);
    });

    it('should handle array with one element', async () => {
        const input = { array: [{ a: 1 }], accumulator: '0', field: 'a', operation: 'sum' };
        const result = await reduce.execute(input, {});
        expect(result).toEqual(1);
    });
});
