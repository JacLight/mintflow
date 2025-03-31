import aggregate from '../src/actions/aggregate';

describe('aggregate action', () => {
    it('should aggregate array of objects by sum', async () => {
        const input = { array: [{ a: 1, b: 2 }, { a: 1, b: 3 }, { a: 2, b: 4 }], groupBy: ['a'], aggregations: [{ field: 'b', operation: 'sum', alias: 'total' }] };
        const result = await aggregate.execute(input, {});
        expect(result).toEqual([{ a: 1, total: 5 }, { a: 2, total: 4 }]);
    });

    it('should aggregate array of objects by average', async () => {
        const input = { array: [{ a: 1, b: 2 }, { a: 1, b: 3 }, { a: 2, b: 4 }], groupBy: ['a'], aggregations: [{ field: 'b', operation: 'average', alias: 'avg' }] };
        const result = await aggregate.execute(input, {});
        expect(result).toEqual([{ a: 1, avg: 2.5 }, { a: 2, avg: 4 }]);
    });

    it('should aggregate array of objects by count', async () => {
        const input = { array: [{ a: 1, b: 2 }, { a: 1, b: 3 }, { a: 2, b: 4 }], groupBy: ['a'], aggregations: [{ field: 'b', operation: 'count', alias: 'count' }] };
        const result = await aggregate.execute(input, {});
        expect(result).toEqual([{ a: 1, count: 2 }, { a: 2, count: 1 }]);
    });

    it('should aggregate array of objects by min', async () => {
        const input = { array: [{ a: 1, b: 2 }, { a: 1, b: 3 }, { a: 2, b: 4 }], groupBy: ['a'], aggregations: [{ field: 'b', operation: 'min', alias: 'min' }] };
        const result = await aggregate.execute(input, {});
        expect(result).toEqual([{ a: 1, min: 2 }, { a: 2, min: 4 }]);
    });

    it('should aggregate array of objects by max', async () => {
        const input = { array: [{ a: 1, b: 2 }, { a: 1, b: 3 }, { a: 2, b: 4 }], groupBy: ['a'], aggregations: [{ field: 'b', operation: 'max', alias: 'max' }] };
        const result = await aggregate.execute(input, {});
        expect(result).toEqual([{ a: 1, max: 3 }, { a: 2, max: 4 }]);
    });

    it('should handle empty array', async () => {
        const input = { array: [], groupBy: ['a'], aggregations: [{ field: 'b', operation: 'sum', alias: 'total' }] };
        const result = await aggregate.execute(input, {});
        expect(result).toEqual([]);
    });

    it('should handle array with one element', async () => {
        const input = { array: [{ a: 1, b: 2 }], groupBy: ['a'], aggregations: [{ field: 'b', operation: 'sum', alias: 'total' }] };
        const result = await aggregate.execute(input, {});
        expect(result).toEqual([{ a: 1, total: 2 }]);
    });

    it('should apply custom aggregation operation', async () => {
        const input = { array: [{ a: 1, b: 2 }, { a: 1, b: 3 }, { a: 2, b: 4 }], groupBy: ['a'], aggregations: [{ field: 'b', operation: 'custom', customOperation: 'group.reduce((acc, item) => acc + item.b, 0)', alias: 'custom' }] };
        const result = await aggregate.execute(input, {});
        expect(result).toEqual([{ a: 1, custom: 5 }, { a: 2, custom: 4 }]);
    });

    it('should apply custom aggregation operation with return ', async () => {
        const input = { array: [{ a: 1, b: 2 }, { a: 1, b: 3 }, { a: 2, b: 4 }], groupBy: ['a'], aggregations: [{ field: 'b', operation: 'custom', customOperation: 'return group.reduce((acc, item) => acc + item.b, 0)', alias: 'custom' }] };
        const result = await aggregate.execute(input, {});
        expect(result).toEqual([{ a: 1, custom: 5 }, { a: 2, custom: 4 }]);
    });

    it('should pivot data', async () => {
        const input = { array: [{ a: 1, b: 2, year: 2020 }, { a: 1, b: 3, year: 2021 }, { a: 2, b: 4, year: 2020 }], groupBy: ['a'], aggregations: [{ field: 'b', operation: 'sum', alias: 'total' }], pivot: { pivotField: 'year', valueField: 'total' } };
        const result = await aggregate.execute(input, {});
        expect(result).toEqual([{ year: 2020, total: 6 }, { year: 2021, total: 3 }]);
    });
});
