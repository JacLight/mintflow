import { commonSchema } from '../common.js';

type Item = { [key: string]: any };

interface InputType {
    array: any[];
    groupBy: 'count' | 'interval' | string;
    threshold: number;
    sortBy?: string; // e.g. 'timestamp' or 'student'
    sortDirection?: 'asc' | 'desc';
}

/** Splits array into sub-arrays of size `count`. */
function batchByCount(arr: any[], count: number): any[] {
    const chunks: any[] = [];
    for (let i = 0; i < arr.length; i += count) {
        chunks.push(arr.slice(i, i + count));
    }
    return chunks;
}

/** Groups array items by a property name.
 *  e.g. groupBy='student' => 
 *    [
 *      [{ student: 'Alice' }, { student: 'Alice' }],
 *      [{ student: 'Bob' }, { student: 'Bob' }],
 *    ]
 */
function batchByProperty(arr: any[], property: string): any[] {
    const groups: Record<string, any[]> = {};
    for (const item of arr) {
        const key = item[property];
        if (!groups[key]) groups[key] = [];
        groups[key].push(item);
    }
    // Return just the arrays
    return Object.values(groups);
}
/**
 * Batches an array by "interval": starts a new group whenever the difference
 * in the sorting field between consecutive items is >= threshold.
 *
 * Assumes the array is already sorted by the relevant field (e.g. "timestamp").
 */
function batchByInterval(array: Item[], threshold: number, field: string): Item[][] {
    if (!array.length) return [];

    const result: Item[][] = [];
    let currentBatch: Item[] = [array[0]];

    for (let i = 1; i < array.length; i++) {
        // Safely compute the numeric difference. If items lack the field, default to big difference => new batch.
        const prevVal = (typeof array[i - 1] === 'object') ? array[i - 1][field] : array[i - 1];
        const currVal = (typeof array[i] === 'object') ? array[i][field] : array[i];
        const diff = (typeof prevVal === 'number' && typeof currVal === 'number')
            ? currVal - prevVal
            : Number.MAX_SAFE_INTEGER;

        // If the difference is >= threshold, we start a new sub-array
        if (diff >= threshold) {
            result.push(currentBatch);
            currentBatch = [array[i]];
        } else {
            currentBatch.push(array[i]);
        }
    }
    // Push the final batch
    result.push(currentBatch);
    return result;
}

export const batch = {
    name: 'batch',
    ...commonSchema,
    inputSchema: {
        type: 'object',
        properties: {
            array: {
                type: 'array',
                description: 'Array of items to sort and batch',
            },
            groupBy: {
                type: 'string',
                enum: ['count', 'interval', /* ... or other grouping strategies */],
            },
            threshold: {
                type: 'number',
                // example of a rule that changes the description if groupBy === 'interval'
                rules: [
                    {
                        operation: 'equal',
                        valueA: '{{groupBy}}',
                        valueB: 'interval',
                        action: 'set-property',
                        property: [{ key: 'description', value: 'Seconds' }]
                    }
                ],
            },
            sortBy: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                group: 'sortA',
            },
            sortDirection: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                group: 'sortA',
                enum: ['asc', 'desc'],
            },
        }
    },
    description: 'Sorts an array (by a field or raw value) and then batches it by count, interval, or a property.',
    execute: async (input: InputType, config: any): Promise<any> => {
        // 1) COPY the array so we don't mutate the original
        let arr = [...(input.array || [])];

        // 2) SORT the array if we have a sort direction
        //    - if array elements are objects and sortBy is given, sort by that field
        //    - otherwise sort by raw values
        if (input.sortDirection) {
            const ascending = input.sortDirection === 'asc';
            const hasField = input.sortBy && typeof arr[0] === 'object';

            if (hasField) {
                // Sort by 'input.sortBy' property
                arr.sort((a, b) => {
                    const aVal = a[input.sortBy!];
                    const bVal = b[input.sortBy!];
                    return ascending ? aVal - bVal : bVal - aVal;
                });
            } else {
                // Sort by raw values
                arr.sort((a, b) => (ascending ? a - b : b - a));
            }
        }

        // 3) BATCH according to `groupBy`
        let result: any[] = [];
        switch (input.groupBy) {
            case 'count':
                result = batchByCount(arr, input.threshold);
                break;

            case 'interval':
                // If you expect to sort by a field (e.g. 'timestamp'), ensure 'sortBy' is set
                // and the array is already sorted as above. Then split on threshold differences.
                result = batchByInterval(arr, input.threshold, input.sortBy || '');
                break;

            default:
                // Fallback: group by the property name
                // e.g. groupBy='student' => group objects by item['student']
                if (input.groupBy) {
                    result = batchByProperty(arr, input.groupBy);
                } else {
                    // If groupBy is empty or not recognized, just return the array in an array
                    result = [arr];
                }
                break;
        }

        return result;
    },
};

export default batch;
