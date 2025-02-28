/**
 * Changes the encoding of a file
 * 
 * @param inputFile - The file to change the encoding of
 * @param inputEncoding - The current encoding of the file
 * @param outputFileName - The name of the output file
 * @param outputEncoding - The encoding to convert to
 * @param files - The files object from the context
 * @returns The URL of the created file with the new encoding
 */
export async function changeFileEncoding(
    inputFile: { data: Buffer },
    inputEncoding: BufferEncoding,
    outputFileName: string,
    outputEncoding: BufferEncoding,
    files: any
): Promise<string> {
    try {
        // First decode the input buffer using the source encoding
        const decodedString = inputFile.data.toString(inputEncoding);

        // Then encode to the target encoding
        const encodedBuffer = Buffer.from(decodedString, outputEncoding);

        // Write the file with the new encoding
        return await files.write({
            fileName: outputFileName,
            data: encodedBuffer,
        });
    } catch (error: any) {
        throw new Error(`Failed to change file encoding: ${error.message}`);
    }
}
