import { batch } from '../src/actions/batch.ts';

describe('Array Actions Batch', () => {
    test('should sort and batch by count', async () => {
        const input: any = {
            array: [5, 3, 8, 1, 2, 7, 4, 6],
            groupBy: 'count',
            threshold: 3,
            sortBy: '',
            sortDirection: 'asc'
        };
        const result = await batch.execute(input, {});
        expect(result).toEqual([[1, 2, 3], [4, 5, 6], [7, 8]]);
    });

    test('should sort and batch by interval', async () => {
        const input: any = {
            array: [
                { timestamp: 1, value: 'a' },
                { timestamp: 3, value: 'b' },
                { timestamp: 5, value: 'c' },
                { timestamp: 7, value: 'd' },
                { timestamp: 9, value: 'e' }
            ],
            groupBy: 'interval',
            threshold: 2,
            sortBy: 'timestamp',
            sortDirection: 'asc'
        };
        const result = await batch.execute(input, {});
        expect(result).toEqual([
            [{ timestamp: 1, value: 'a' }],
            [{ timestamp: 3, value: 'b' }],
            [{ timestamp: 5, value: 'c' }],
            [{ timestamp: 7, value: 'd' }],
            [{ timestamp: 9, value: 'e' }]
        ]);
    });

    test('should sort and batch by group', async () => {
        const input: any = {
            array: [
                { student: 'Alice', course: 'Math' },
                { student: 'Bob', course: 'Science' },
                { student: 'Alice', course: 'Science' },
                { student: 'Bob', course: 'Math' },
                { student: 'Charlie', course: 'Math' }
            ],
            groupBy: 'student',
            threshold: 0,
            sortBy: '',
            sortDirection: 'asc'
        };
        const result = await batch.execute(input, {});
        expect(result).toEqual([
            [
                { student: 'Alice', course: 'Math' },
                { student: 'Alice', course: 'Science' }
            ],
            [
                { student: 'Bob', course: 'Science' },
                { student: 'Bob', course: 'Math' }
            ],
            [
                { student: 'Charlie', course: 'Math' }
            ]
        ]);
    });

    test('should sort and batch by count with sorting', async () => {
        const input: any = {
            array: [5, 3, 8, 1, 2, 7, 4, 6],
            groupBy: 'count',
            threshold: 4,
            sortBy: '',
            sortDirection: 'desc'
        };
        const result = await batch.execute(input, {});
        expect(result).toEqual([[8, 7, 6, 5], [4, 3, 2, 1]]);
    });
});
