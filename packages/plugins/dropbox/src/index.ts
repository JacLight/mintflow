import {
    uploadFile,
    listFolder,
    search,
    createFolder,
    deleteFile,
    deleteFolder,
    moveFile,
    moveFolder,
    copyFile,
    copyFolder,
    getFileLink,
    createTextFile
} from './utils.js';

const dropboxPlugin = {
    name: "Dropbox",
    icon: "",
    description: "Cloud storage and file synchronization",
    groups: ["file"],
    tags: ["file","document","storage","media","content"],
    version: '1.0.0',
    id: "dropbox",
    runner: "node",
    inputSchema: {
        type: "object",
        properties: {
            action: {
                type: 'string',
                enum: [
                    'upload_file',
                    'list_folder',
                    'search',
                    'create_folder',
                    'delete_file',
                    'delete_folder',
                    'move_file',
                    'move_folder',
                    'copy_file',
                    'copy_folder',
                    'get_file_link',
                    'create_text_file'
                ],
                description: 'Action to perform on Dropbox',
            },
            token: {
                type: 'string',
                description: 'Dropbox API Token',
            },
            // Upload file parameters
            path: {
                type: 'string',
                description: 'File or folder path (e.g. /folder1/file.txt)',
                rules: [
                    { operation: 'notEqual', valueA: 'move_file', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'move_folder', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'copy_file', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'copy_folder', valueB: '{{action}}', action: 'hide' },
                ],
            },
            file: {
                type: 'string',
                description: 'Base64 encoded file content',
                rules: [
                    { operation: 'notEqual', valueA: 'upload_file', valueB: '{{action}}', action: 'hide' },
                ],
            },
            autorename: {
                type: 'boolean',
                description: 'Auto rename file if it already exists',
                rules: [
                    { operation: 'notEqual', valueA: 'upload_file', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'create_folder', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'move_file', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'move_folder', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'copy_file', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'copy_folder', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'create_text_file', valueB: '{{action}}', action: 'hide' },
                ],
            },
            mute: {
                type: 'boolean',
                description: 'Mute notifications',
                rules: [
                    { operation: 'notEqual', valueA: 'upload_file', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'create_text_file', valueB: '{{action}}', action: 'hide' },
                ],
            },
            strict_conflict: {
                type: 'boolean',
                description: 'Be more strict about how conflicts are detected',
                rules: [
                    { operation: 'notEqual', valueA: 'upload_file', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'create_text_file', valueB: '{{action}}', action: 'hide' },
                ],
            },
            // List folder parameters
            recursive: {
                type: 'boolean',
                description: 'List folder contents recursively',
                rules: [
                    { operation: 'notEqual', valueA: 'list_folder', valueB: '{{action}}', action: 'hide' },
                ],
            },
            limit: {
                type: 'number',
                description: 'Maximum number of results to return',
                rules: [
                    { operation: 'notEqual', valueA: 'list_folder', valueB: '{{action}}', action: 'hide' },
                ],
            },
            // Search parameters
            query: {
                type: 'string',
                description: 'Search query',
                rules: [
                    { operation: 'notEqual', valueA: 'search', valueB: '{{action}}', action: 'hide' },
                ],
            },
            max_results: {
                type: 'number',
                description: 'Maximum number of search results',
                rules: [
                    { operation: 'notEqual', valueA: 'search', valueB: '{{action}}', action: 'hide' },
                ],
            },
            file_status: {
                type: 'string',
                enum: ['active', 'deleted'],
                description: 'File status to search for',
                rules: [
                    { operation: 'notEqual', valueA: 'search', valueB: '{{action}}', action: 'hide' },
                ],
            },
            filename_only: {
                type: 'boolean',
                description: 'Search in filenames only',
                rules: [
                    { operation: 'notEqual', valueA: 'search', valueB: '{{action}}', action: 'hide' },
                ],
            },
            // Move and copy parameters
            from_path: {
                type: 'string',
                description: 'Source path',
                rules: [
                    { operation: 'notEqual', valueA: 'move_file', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'move_folder', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'copy_file', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'copy_folder', valueB: '{{action}}', action: 'hide' },
                ],
            },
            to_path: {
                type: 'string',
                description: 'Destination path',
                rules: [
                    { operation: 'notEqual', valueA: 'move_file', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'move_folder', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'copy_file', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'copy_folder', valueB: '{{action}}', action: 'hide' },
                ],
            },
            allow_ownership_transfer: {
                type: 'boolean',
                description: 'Allow ownership transfer',
                rules: [
                    { operation: 'notEqual', valueA: 'move_file', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'move_folder', valueB: '{{action}}', action: 'hide' },
                ],
            },
            // Get file link parameters
            short_url: {
                type: 'boolean',
                description: 'Create a short URL',
                rules: [
                    { operation: 'notEqual', valueA: 'get_file_link', valueB: '{{action}}', action: 'hide' },
                ],
            },
            // Create text file parameters
            content: {
                type: 'string',
                description: 'Text content',
                rules: [
                    { operation: 'notEqual', valueA: 'create_text_file', valueB: '{{action}}', action: 'hide' },
                ],
            },
        },
        required: ['action', 'token'],
    },
    outputSchema: {
        type: "object",
    },
    exampleInput: {
        action: 'upload_file',
        token: 'your-dropbox-api-token',
        path: '/example/file.txt',
        file: 'SGVsbG8gV29ybGQh', // Base64 encoded "Hello World!"
        autorename: true,
        mute: false
    },
    exampleOutput: {
        name: 'file.txt',
        id: 'id:abcdefghijklmnopqrstuvwxyz',
        client_modified: '2023-01-01T00:00:00Z',
        server_modified: '2023-01-01T00:00:00Z',
        rev: '0123456789abcdef',
        size: 12,
        path_lower: '/example/file.txt',
        path_display: '/example/file.txt',
        is_downloadable: true
    },
    documentation: "https://www.dropbox.com/developers/documentation/http/documentation",
    method: "exec",
    actions: [
        {
            name: 'dropbox',
            execute: async (input: any): Promise<any> => {
                const { action, token } = input;

                if (!action || !token) {
                    throw new Error('Missing required parameters: action, token');
                }

                switch (action) {
                    case 'upload_file': {
                        const { path, file, autorename, mute, strict_conflict } = input;

                        if (!path || !file) {
                            throw new Error('Missing required parameters: path, file');
                        }

                        return await uploadFile({
                            token,
                            path,
                            file,
                            autorename,
                            mute,
                            strict_conflict
                        });
                    }

                    case 'list_folder': {
                        const { path, recursive, limit } = input;

                        if (!path) {
                            throw new Error('Missing required parameter: path');
                        }

                        return await listFolder({
                            token,
                            path,
                            recursive,
                            limit
                        });
                    }

                    case 'search': {
                        const { query, path, max_results, file_status, filename_only } = input;

                        if (!query) {
                            throw new Error('Missing required parameter: query');
                        }

                        return await search({
                            token,
                            query,
                            path,
                            max_results,
                            file_status,
                            filename_only
                        });
                    }

                    case 'create_folder': {
                        const { path, autorename } = input;

                        if (!path) {
                            throw new Error('Missing required parameter: path');
                        }

                        return await createFolder({
                            token,
                            path,
                            autorename
                        });
                    }

                    case 'delete_file': {
                        const { path } = input;

                        if (!path) {
                            throw new Error('Missing required parameter: path');
                        }

                        return await deleteFile({
                            token,
                            path
                        });
                    }

                    case 'delete_folder': {
                        const { path } = input;

                        if (!path) {
                            throw new Error('Missing required parameter: path');
                        }

                        return await deleteFolder({
                            token,
                            path
                        });
                    }

                    case 'move_file': {
                        const { from_path, to_path, autorename, allow_ownership_transfer } = input;

                        if (!from_path || !to_path) {
                            throw new Error('Missing required parameters: from_path, to_path');
                        }

                        return await moveFile({
                            token,
                            from_path,
                            to_path,
                            autorename,
                            allow_ownership_transfer
                        });
                    }

                    case 'move_folder': {
                        const { from_path, to_path, autorename, allow_ownership_transfer } = input;

                        if (!from_path || !to_path) {
                            throw new Error('Missing required parameters: from_path, to_path');
                        }

                        return await moveFolder({
                            token,
                            from_path,
                            to_path,
                            autorename,
                            allow_ownership_transfer
                        });
                    }

                    case 'copy_file': {
                        const { from_path, to_path, autorename } = input;

                        if (!from_path || !to_path) {
                            throw new Error('Missing required parameters: from_path, to_path');
                        }

                        return await copyFile({
                            token,
                            from_path,
                            to_path,
                            autorename
                        });
                    }

                    case 'copy_folder': {
                        const { from_path, to_path, autorename } = input;

                        if (!from_path || !to_path) {
                            throw new Error('Missing required parameters: from_path, to_path');
                        }

                        return await copyFolder({
                            token,
                            from_path,
                            to_path,
                            autorename
                        });
                    }

                    case 'get_file_link': {
                        const { path, short_url } = input;

                        if (!path) {
                            throw new Error('Missing required parameter: path');
                        }

                        return await getFileLink({
                            token,
                            path,
                            short_url
                        });
                    }

                    case 'create_text_file': {
                        const { path, content, autorename, mute, strict_conflict } = input;

                        if (!path || !content) {
                            throw new Error('Missing required parameters: path, content');
                        }

                        return await createTextFile({
                            token,
                            path,
                            content,
                            autorename,
                            mute,
                            strict_conflict
                        });
                    }

                    default:
                        throw new Error(`Unsupported action: ${action}`);
                }
            }
        }
    ]
};

export default dropboxPlugin;
