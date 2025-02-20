import filter from '../src/actions/filter';

describe('filter action', () => {
    it('should filter array of objects with "and" join', async () => {
        const input = { array: [{ a: 1, b: 2 }, { a: 2, b: 3 }, { a: 3, b: 4 }], join: 'and', filters: [{ field: 'a', operation: 'gt', value: '1' }, { field: 'b', operation: 'lt', value: '4' }] };
        const result = await filter.execute(input, {});
        expect(result).toEqual([{ a: 2, b: 3 }]);
    });

    it('should filter array of objects with "or" join', async () => {
        const input = { array: [{ a: 1, b: 2 }, { a: 2, b: 3 }, { a: 3, b: 4 }], join: 'or', filters: [{ field: 'a', operation: 'gt', value: '1' }, { field: 'b', operation: 'lt', value: '4' }] };
        const result = await filter.execute(input, {});
        expect(result).toEqual([{ a: 1, b: 2 }, { a: 2, b: 3 }, { a: 3, b: 4 }]);
    });

    it('should handle empty array', async () => {
        const input = { array: [], join: 'and', filters: [{ field: 'a', operation: 'gt', value: '1' }] };
        const result = await filter.execute(input, {});
        expect(result).toEqual([]);
    });

    it('should handle array with one element', async () => {
        const input = { array: [{ a: 1, b: 2 }], join: 'and', filters: [{ field: 'a', operation: 'gt', value: '1' }] };
        const result = await filter.execute(input, {});
        expect(result).toEqual([]);
    });

    it('should limit the number of filtered items', async () => {
        const input = { array: [{ a: 1, b: 2 }, { a: 2, b: 3 }, { a: 3, b: 4 }], join: 'or', max: 2, filters: [{ field: 'a', operation: 'gt', value: '1' }] };
        const result = await filter.execute(input, {});
        expect(result).toEqual([{ a: 2, b: 3 }, { a: 3, b: 4 }]);
    });

    it('should handle invalid operation', async () => {
        const input = { array: [{ a: 1, b: 2 }, { a: 2, b: 3 }, { a: 3, b: 4 }], join: 'and', filters: [{ field: 'a', operation: 'invalid', value: '1' }] };
        await expect(filter.execute(input, {})).rejects.toThrow();
    });
});
