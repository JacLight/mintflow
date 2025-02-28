/**
 * Creates a file with the specified content and encoding
 * 
 * @param content - The content to write to the file
 * @param fileName - The name of the file to create
 * @param encoding - The encoding to use for the file content
 * @param files - The files object from the context
 * @returns The URL of the created file
 */
export async function createFile(
    content: string,
    fileName: string,
    encoding: BufferEncoding = 'utf8',
    files: any
): Promise<{ fileName: string; url: string }> {
    try {
        // Create a buffer from the content with the specified encoding
        const buffer = Buffer.from(content, encoding);

        // Write the file using the files API
        const fileUrl = await files.write({
            fileName: fileName,
            data: buffer,
        });

        return {
            fileName: fileName,
            url: fileUrl
        };
    } catch (error: any) {
        throw new Error(`Failed to create file: ${error.message}`);
    }
}
