import mime from 'mime-types';

/**
 * Output format options for file reading
 */
export const fileOutputFormats = {
    TEXT: 'text',
    BASE64: 'base64',
};

/**
 * Reads a file and returns its contents in the specified format
 * 
 * @param file - The file to read
 * @param outputFormat - The format to return the file contents in (text or base64)
 * @returns The file contents in the specified format
 */
export async function readFile(
    file: { data: Buffer; extension?: string; name?: string },
    outputFormat: string = fileOutputFormats.TEXT
): Promise<any> {
    try {
        switch (outputFormat) {
            case fileOutputFormats.BASE64: {
                const mimeType = file.extension
                    ? mime.lookup(file.extension) || 'application/octet-stream'
                    : 'application/octet-stream';

                return {
                    base64WithMimeType: `data:${mimeType};base64,${file.data.toString('base64')}`,
                    base64: file.data.toString('base64'),
                    fileName: file.name,
                    mimeType
                };
            }
            case fileOutputFormats.TEXT:
                return {
                    text: file.data.toString('utf-8'),
                    fileName: file.name
                };
            default:
                throw new Error(`Invalid output format: ${outputFormat}`);
        }
    } catch (error: any) {
        throw new Error(`Failed to read file: ${error.message}`);
    }
}
