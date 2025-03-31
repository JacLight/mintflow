import map from '../src/actions/map';

describe('map action', () => {
    it('should map array of objects with new fields', async () => {
        const input = { array: [{ a: 1 }, { a: 2 }, { a: 3 }], mappings: [{ newField: 'b', pattern: '{{a * 2}}' }] };
        const result = await map.execute(input, {});
        expect(result).toEqual([{ b: 2 }, { b: 4 }, { b: 6 }]);
    });

    it('should map array of objects with multiple new fields', async () => {
        const input = { array: [{ a: 1 }, { a: 2 }, { a: 3 }], mappings: [{ newField: 'b', pattern: '{{a * 2}}' }, { newField: 'c', pattern: '{{a + 1}}' }] };
        const result = await map.execute(input, {});
        expect(result).toEqual([{ b: 2, c: 2 }, { b: 4, c: 3 }, { b: 6, c: 4 }]);
    });

    it('should handle empty array', async () => {
        const input = { array: [], mappings: [{ newField: 'b', pattern: '{{a * 2}}' }] };
        const result = await map.execute(input, {});
        expect(result).toEqual([]);
    });

    it('should handle array with one element', async () => {
        const input = { array: [{ a: 1 }], mappings: [{ newField: 'b', pattern: '{{a * 2}}' }] };
        const result = await map.execute(input, {});
        expect(result).toEqual([{ b: 2 }]);
    });

    it('should limit the number of mapped items', async () => {
        const input = { array: [{ a: 1 }, { a: 2 }, { a: 3 }], max: 2, mappings: [{ newField: 'b', pattern: '{{a * 2}}' }] };
        const result = await map.execute(input, {});
        expect(result).toEqual([{ b: 2 }, { b: 4 }]);
    });

    it('should handle invalid pattern', async () => {
        const input = { array: [{ a: 1 }, { a: 2 }, { a: 3 }], mappings: [{ newField: 'b', pattern: '{{invalid}}' }] };
        const result = await map.execute(input, {});
        expect(result).toEqual([{ b: undefined }, { b: undefined }, { b: undefined }]);
    });
    it('should handle single expression (full pattern) as a typed number', async () => {
        const input = {
            array: [{ a: 2 }, { a: 5 }],
            // Each item => newField 'b' => result of "a * 2"
            mappings: [{ newField: 'b', pattern: '{{a * 2}}' }]
        };
        const result = await map.execute(input, {});
        // Expect typed numbers, not strings
        expect(result).toEqual([
            { b: 4 },
            { b: 10 }
        ]);
    });

    it('should handle partial expansions returning a string', async () => {
        const input = {
            array: [
                { grade: 'A', score: 100 },
                { grade: 'B', score: 95 }
            ],
            mappings: [
                {
                    newField: 'summarya',
                    pattern: 'My grade is {{grade}} with score {{score}}'
                },
                {
                    newField: 'summaryb',
                    pattern: '{{grade}} {{score}}'
                }
            ]
        };
        const result = await map.execute(input, {});
        expect(result).toEqual([
            { summarya: 'My grade is A with score 100', summaryb: 'A 100' },
            { summarya: 'My grade is B with score 95', summaryb: 'B 95' }
        ]);
    });
});
