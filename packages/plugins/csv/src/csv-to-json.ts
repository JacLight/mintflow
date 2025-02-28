import { parse } from 'csv-parse/sync';

/**
 * Converts CSV text to JSON
 * 
 * @param csvText - The CSV text to convert
 * @param hasHeaders - Whether the CSV has headers
 * @param delimiter - The delimiter used in the CSV
 * @returns An array of objects or arrays representing the CSV data
 */
export function csvToJson(
    csvText: string,
    hasHeaders: boolean = false,
    delimiter: string = ','
): any[] {
    if (typeof csvText !== 'string') {
        throw new Error('The input should be a string');
    }

    try {
        const records = parse(csvText, {
            delimiter: delimiter,
            columns: hasHeaders ? true : false,
            skip_empty_lines: true,
            trim: true
        });

        return records;
    } catch (error: any) {
        const errorMessage = error.message || 'Unknown error';
        throw new Error(`Failed to parse CSV: ${errorMessage}`);
    }
}
