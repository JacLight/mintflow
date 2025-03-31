import { stringify } from 'csv-stringify/sync';
import { flatten } from 'safe-flat';

/**
 * Converts a JSON array to CSV format
 * 
 * @param jsonArray - The JSON array to convert
 * @param delimiter - The delimiter to use in the CSV
 * @returns A CSV string
 */
export function jsonToCsv(
    jsonArray: any[],
    delimiter: string = ','
): string {
    if (!Array.isArray(jsonArray)) {
        throw new Error('The input should be a JSON array');
    }

    try {
        // Flatten nested objects
        const flattened = jsonArray.map((item) => flatten(item) as Record<string, string>);

        // Convert to CSV
        const csvString = stringify(flattened, {
            header: true,
            delimiter: delimiter
        });

        return csvString;
    } catch (error: any) {
        const errorMessage = error.message || 'Unknown error';
        throw new Error(`Failed to convert JSON to CSV: ${errorMessage}`);
    }
}
