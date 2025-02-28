import mime from 'mime-types';

/**
 * Checks the MIME type of a file and determines if it matches a specified type
 * 
 * @param file - The file to check
 * @param mimeTypes - The MIME types to check against
 * @returns Object containing the detected MIME type and whether it matches any of the specified types
 */
export async function checkFileType(
    file: { data: Buffer; extension?: string; name?: string },
    mimeTypes: string | string[]
): Promise<{ mimeType: string; isMatch: boolean }> {
    try {
        // Determine the MIME type of the file
        const fileType = file.extension
            ? mime.lookup(file.extension) || 'application/octet-stream'
            : 'application/octet-stream';

        // Convert mimeTypes to array if it's a string
        const mimeTypesArray = Array.isArray(mimeTypes) ? mimeTypes : [mimeTypes];

        // Check if the file's MIME type matches any of the specified MIME types
        const isMatch = Boolean(fileType && mimeTypesArray.includes(fileType));

        return {
            mimeType: fileType || 'unknown',
            isMatch,
        };
    } catch (error: any) {
        throw new Error(`Failed to check file type: ${error.message}`);
    }
}
