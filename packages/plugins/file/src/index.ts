import { readFile, fileOutputFormats } from './actions/read-file.js';
import { createFile } from './actions/create-file.js';
import { changeFileEncoding } from './actions/change-file-encoding.js';
import { checkFileType } from './actions/check-file-type.js';
import { encodings } from './encodings.js';
import { mimeTypes } from './mime-types.js';

const filePlugin = {
    name: "File",
    icon: "File",
    description: "Read, create, and manipulate files with various encodings and formats",
    groups: ["file"],
    tags: ["file", "document", "storage", "media", "content"],
    version: '1.0.0',
    id: "file",
    runner: "node",
    inputSchema: {
        type: "object",
        properties: {
            file: {
                type: "object",
                description: "File to process"
            },
            content: {
                type: "string",
                description: "Content to write to a file"
            }
        }
    },
    outputSchema: {
        type: "object",
        properties: {
            text: {
                type: "string",
                description: "Text content of the file"
            },
            base64: {
                type: "string",
                description: "Base64 encoded content of the file"
            },
            url: {
                type: "string",
                description: "URL of the created file"
            },
            mimeType: {
                type: "string",
                description: "MIME type of the file"
            }
        }
    },
    exampleInput: {
        file: {
            name: "example.txt",
            data: Buffer.from("Hello, world!"),
            extension: "txt"
        }
    },
    exampleOutput: {
        text: "Hello, world!",
        fileName: "example.txt"
    },
    documentation: "https://mintflow.com/plugins/file",
    method: "exec",
    actions: [
        {
            name: 'read_file',
            execute: async (input: any, config: any): Promise<any> => {
                try {
                    const file = input.data?.file;
                    const outputFormat = config.data?.outputFormat || fileOutputFormats.TEXT;

                    if (!file || !file.data) {
                        return { error: 'File is required' };
                    }

                    const result = await readFile(file, outputFormat);
                    return result;
                } catch (error: any) {
                    console.error('Error reading file:', error);
                    return { error: error.message || 'Failed to read file' };
                }
            }
        },
        {
            name: 'create_file',
            execute: async (input: any, config: any, context: any): Promise<any> => {
                try {
                    const content = input.data?.content || '';
                    const fileName = config.data?.fileName;
                    const encoding = config.data?.encoding || 'utf8';

                    if (!fileName) {
                        return { error: 'File name is required' };
                    }

                    const result = await createFile(content, fileName, encoding as BufferEncoding, context.files);
                    return result;
                } catch (error: any) {
                    console.error('Error creating file:', error);
                    return { error: error.message || 'Failed to create file' };
                }
            }
        },
        {
            name: 'change_file_encoding',
            execute: async (input: any, config: any, context: any): Promise<any> => {
                try {
                    const inputFile = input.data?.file;
                    const inputEncoding = config.data?.inputEncoding || 'utf8';
                    const outputFileName = config.data?.outputFileName;
                    const outputEncoding = config.data?.outputEncoding || 'utf8';

                    if (!inputFile || !inputFile.data) {
                        return { error: 'Input file is required' };
                    }

                    if (!outputFileName) {
                        return { error: 'Output file name is required' };
                    }

                    const fileUrl = await changeFileEncoding(
                        inputFile,
                        inputEncoding as BufferEncoding,
                        outputFileName,
                        outputEncoding as BufferEncoding,
                        context.files
                    );

                    return {
                        url: fileUrl,
                        fileName: outputFileName,
                        encoding: outputEncoding
                    };
                } catch (error: any) {
                    console.error('Error changing file encoding:', error);
                    return { error: error.message || 'Failed to change file encoding' };
                }
            }
        },
        {
            name: 'check_file_type',
            execute: async (input: any, config: any): Promise<any> => {
                try {
                    const file = input.data?.file;
                    const mimeType = config.data?.mimeType;

                    if (!file || !file.data) {
                        return { error: 'File is required' };
                    }

                    if (!mimeType) {
                        return { error: 'MIME type is required' };
                    }

                    const result = await checkFileType(file, mimeType);
                    return result;
                } catch (error: any) {
                    console.error('Error checking file type:', error);
                    return { error: error.message || 'Failed to check file type' };
                }
            }
        }
    ]
};

// Export the encodings and mimeTypes for use in the UI
export { encodings, mimeTypes, fileOutputFormats };

export default filePlugin;
