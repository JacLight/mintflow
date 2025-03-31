import sort from '../src/actions/sort';

describe('sort action', () => {
    it('should sort array of numbers in ascending order', async () => {
        const input = { array: [3, 1, 2], field1: '', direction1: 'asc' };
        const result = await sort.execute(input, {});
        expect(result).toEqual([1, 2, 3]);
    });

    it('should sort array of numbers in descending order', async () => {
        const input = { array: [3, 1, 2], field1: '', direction1: 'desc' };
        const result = await sort.execute(input, {});
        expect(result).toEqual([3, 2, 1]);
    });

    it('should sort array of objects by field in ascending order', async () => {
        const input = { array: [{ a: 3 }, { a: 1 }, { a: 2 }], field1: 'a', direction1: 'asc' };
        const result = await sort.execute(input, {});
        expect(result).toEqual([{ a: 1 }, { a: 2 }, { a: 3 }]);
    });

    it('should sort array of objects by field in descending order', async () => {
        const input = { array: [{ a: 3 }, { a: 1 }, { a: 2 }], field1: 'a', direction1: 'desc' };
        const result = await sort.execute(input, {});
        expect(result).toEqual([{ a: 3 }, { a: 2 }, { a: 1 }]);
    });

    it('should handle empty array', async () => {
        const input = { array: [], field1: '', direction1: 'asc' };
        const result = await sort.execute(input, {});
        expect(result).toEqual([]);
    });

    it('should handle array with one element', async () => {
        const input = { array: [1], field1: '', direction1: 'asc' };
        const result = await sort.execute(input, {});
        expect(result).toEqual([1]);
    });

    it('should sort array by multiple fields', async () => {
        const input = { array: [{ a: 2, b: 1 }, { a: 1, b: 2 }, { a: 1, b: 1 }], field1: 'a', direction1: 'asc', field2: 'b', direction2: 'desc' };
        const result = await sort.execute(input, {});
        expect(result).toEqual([{ a: 1, b: 2 }, { a: 1, b: 1 }, { a: 2, b: 1 }]);
    });
});
