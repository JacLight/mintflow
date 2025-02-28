import {
    uploadFile,
    createFolder,
    listFiles,
    searchFiles,
    getFile,
    deleteFile,
    trashFile,
    moveFile,
    copyFile,
    createTextFile,
    readFile,
    addPermission,
    deletePermission,
    setPublicAccess,
    saveFileAsPdf
} from './utils.js';

const googleDrivePlugin = {
    name: "Google Drive",
    icon: "",
    description: "Cloud storage and file backup",
    id: "google-drive",
    runner: "node",
    inputSchema: {
        type: "object",
        properties: {
            action: {
                type: 'string',
                enum: [
                    'upload_file',
                    'create_folder',
                    'list_files',
                    'search_files',
                    'get_file',
                    'delete_file',
                    'trash_file',
                    'move_file',
                    'copy_file',
                    'create_text_file',
                    'read_file',
                    'add_permission',
                    'delete_permission',
                    'set_public_access',
                    'save_file_as_pdf'
                ],
                description: 'Action to perform on Google Drive',
            },
            token: {
                type: 'string',
                description: 'Google Drive API Token',
            },
            // Upload file parameters
            fileName: {
                type: 'string',
                description: 'Name of the file',
                rules: [
                    { operation: 'notEqual', valueA: 'upload_file', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'create_text_file', valueB: '{{action}}', action: 'hide' },
                ],
            },
            file: {
                type: 'string',
                description: 'Base64 encoded file content',
                rules: [
                    { operation: 'notEqual', valueA: 'upload_file', valueB: '{{action}}', action: 'hide' },
                ],
            },
            fileExtension: {
                type: 'string',
                description: 'File extension (e.g., pdf, txt, jpg)',
                rules: [
                    { operation: 'notEqual', valueA: 'upload_file', valueB: '{{action}}', action: 'hide' },
                ],
            },
            // Create folder parameters
            folderName: {
                type: 'string',
                description: 'Name of the folder',
                rules: [
                    { operation: 'notEqual', valueA: 'create_folder', valueB: '{{action}}', action: 'hide' },
                ],
            },
            // Common parameters
            parentFolder: {
                type: 'string',
                description: 'ID of the parent folder',
                rules: [
                    { operation: 'notEqual', valueA: 'upload_file', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'create_folder', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'copy_file', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'create_text_file', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'save_file_as_pdf', valueB: '{{action}}', action: 'hide' },
                ],
            },
            includeTeamDrives: {
                type: 'boolean',
                description: 'Include team drives in the operation',
                rules: [
                    { operation: 'notEqual', valueA: 'upload_file', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'create_folder', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'list_files', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'search_files', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'get_file', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'delete_file', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'trash_file', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'move_file', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'copy_file', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'create_text_file', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'read_file', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'add_permission', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'delete_permission', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'set_public_access', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'save_file_as_pdf', valueB: '{{action}}', action: 'hide' },
                ],
            },
            // List files parameters
            folderId: {
                type: 'string',
                description: 'ID of the folder to list files from',
                rules: [
                    { operation: 'notEqual', valueA: 'list_files', valueB: '{{action}}', action: 'hide' },
                ],
            },
            includeTrashed: {
                type: 'boolean',
                description: 'Include trashed files in the results',
                rules: [
                    { operation: 'notEqual', valueA: 'list_files', valueB: '{{action}}', action: 'hide' },
                ],
            },
            // Search parameters
            query: {
                type: 'string',
                description: 'Search query',
                rules: [
                    { operation: 'notEqual', valueA: 'search_files', valueB: '{{action}}', action: 'hide' },
                ],
            },
            // File ID parameters
            fileId: {
                type: 'string',
                description: 'ID of the file',
                rules: [
                    { operation: 'notEqual', valueA: 'get_file', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'delete_file', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'trash_file', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'move_file', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'copy_file', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'read_file', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'add_permission', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'delete_permission', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'set_public_access', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'save_file_as_pdf', valueB: '{{action}}', action: 'hide' },
                ],
            },
            // Move file parameters
            destinationFolderId: {
                type: 'string',
                description: 'ID of the destination folder',
                rules: [
                    { operation: 'notEqual', valueA: 'move_file', valueB: '{{action}}', action: 'hide' },
                ],
            },
            // Copy file parameters
            name: {
                type: 'string',
                description: 'New name for the copied file',
                rules: [
                    { operation: 'notEqual', valueA: 'copy_file', valueB: '{{action}}', action: 'hide' },
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
            // Permission parameters
            type: {
                type: 'string',
                enum: ['user', 'group', 'domain', 'anyone'],
                description: 'Type of permission',
                rules: [
                    { operation: 'notEqual', valueA: 'add_permission', valueB: '{{action}}', action: 'hide' },
                ],
            },
            role: {
                type: 'string',
                enum: ['owner', 'organizer', 'fileOrganizer', 'writer', 'commenter', 'reader'],
                description: 'Role for the permission',
                rules: [
                    { operation: 'notEqual', valueA: 'add_permission', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'set_public_access', valueB: '{{action}}', action: 'hide' },
                ],
            },
            emailAddress: {
                type: 'string',
                description: 'Email address for user or group permission',
                rules: [
                    { operation: 'notEqual', valueA: 'add_permission', valueB: '{{action}}', action: 'hide' },
                ],
            },
            domain: {
                type: 'string',
                description: 'Domain for domain permission',
                rules: [
                    { operation: 'notEqual', valueA: 'add_permission', valueB: '{{action}}', action: 'hide' },
                ],
            },
            allowFileDiscovery: {
                type: 'boolean',
                description: 'Allow file discovery for domain or anyone permission',
                rules: [
                    { operation: 'notEqual', valueA: 'add_permission', valueB: '{{action}}', action: 'hide' },
                ],
            },
            sendNotificationEmail: {
                type: 'boolean',
                description: 'Send notification email to the user',
                rules: [
                    { operation: 'notEqual', valueA: 'add_permission', valueB: '{{action}}', action: 'hide' },
                ],
            },
            emailMessage: {
                type: 'string',
                description: 'Message to include in the notification email',
                rules: [
                    { operation: 'notEqual', valueA: 'add_permission', valueB: '{{action}}', action: 'hide' },
                ],
            },
            transferOwnership: {
                type: 'boolean',
                description: 'Transfer ownership to the user',
                rules: [
                    { operation: 'notEqual', valueA: 'add_permission', valueB: '{{action}}', action: 'hide' },
                ],
            },
            moveToNewOwnersRoot: {
                type: 'boolean',
                description: 'Move the file to the new owner\'s root folder',
                rules: [
                    { operation: 'notEqual', valueA: 'add_permission', valueB: '{{action}}', action: 'hide' },
                ],
            },
            permissionId: {
                type: 'string',
                description: 'ID of the permission to delete',
                rules: [
                    { operation: 'notEqual', valueA: 'delete_permission', valueB: '{{action}}', action: 'hide' },
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
        token: 'your-google-drive-api-token',
        fileName: 'example.txt',
        file: 'SGVsbG8gV29ybGQh', // Base64 encoded "Hello World!"
        fileExtension: 'txt',
        parentFolder: 'folder-id',
        includeTeamDrives: false
    },
    exampleOutput: {
        id: 'file-id',
        name: 'example.txt',
        mimeType: 'text/plain',
        kind: 'drive#file',
        webViewLink: 'https://drive.google.com/file/d/file-id/view'
    },
    documentation: "https://developers.google.com/drive/api/v3/reference",
    method: "exec",
    actions: [
        {
            name: 'google-drive',
            execute: async (input: any): Promise<any> => {
                const { action, token } = input;

                if (!action || !token) {
                    throw new Error('Missing required parameters: action, token');
                }

                switch (action) {
                    case 'upload_file': {
                        const { fileName, file, fileExtension, parentFolder, includeTeamDrives } = input;

                        if (!fileName || !file) {
                            throw new Error('Missing required parameters: fileName, file');
                        }

                        return await uploadFile({
                            token,
                            fileName,
                            file,
                            fileExtension,
                            parentFolder,
                            includeTeamDrives
                        });
                    }

                    case 'create_folder': {
                        const { folderName, parentFolder, includeTeamDrives } = input;

                        if (!folderName) {
                            throw new Error('Missing required parameter: folderName');
                        }

                        return await createFolder({
                            token,
                            folderName,
                            parentFolder,
                            includeTeamDrives
                        });
                    }

                    case 'list_files': {
                        const { folderId, includeTrashed, includeTeamDrives } = input;

                        if (!folderId) {
                            throw new Error('Missing required parameter: folderId');
                        }

                        return await listFiles({
                            token,
                            folderId,
                            includeTrashed,
                            includeTeamDrives
                        });
                    }

                    case 'search_files': {
                        const { query, includeTeamDrives } = input;

                        if (!query) {
                            throw new Error('Missing required parameter: query');
                        }

                        return await searchFiles({
                            token,
                            query,
                            includeTeamDrives
                        });
                    }

                    case 'get_file': {
                        const { fileId, includeTeamDrives } = input;

                        if (!fileId) {
                            throw new Error('Missing required parameter: fileId');
                        }

                        return await getFile({
                            token,
                            fileId,
                            includeTeamDrives
                        });
                    }

                    case 'delete_file': {
                        const { fileId, includeTeamDrives } = input;

                        if (!fileId) {
                            throw new Error('Missing required parameter: fileId');
                        }

                        await deleteFile({
                            token,
                            fileId,
                            includeTeamDrives
                        });

                        return { success: true, message: 'File deleted successfully' };
                    }

                    case 'trash_file': {
                        const { fileId, includeTeamDrives } = input;

                        if (!fileId) {
                            throw new Error('Missing required parameter: fileId');
                        }

                        return await trashFile({
                            token,
                            fileId,
                            includeTeamDrives
                        });
                    }

                    case 'move_file': {
                        const { fileId, destinationFolderId, includeTeamDrives } = input;

                        if (!fileId || !destinationFolderId) {
                            throw new Error('Missing required parameters: fileId, destinationFolderId');
                        }

                        return await moveFile({
                            token,
                            fileId,
                            destinationFolderId,
                            includeTeamDrives
                        });
                    }

                    case 'copy_file': {
                        const { fileId, name, parentFolder, includeTeamDrives } = input;

                        if (!fileId) {
                            throw new Error('Missing required parameter: fileId');
                        }

                        return await copyFile({
                            token,
                            fileId,
                            name,
                            parentFolder,
                            includeTeamDrives
                        });
                    }

                    case 'create_text_file': {
                        const { fileName, content, parentFolder, includeTeamDrives } = input;

                        if (!fileName || !content) {
                            throw new Error('Missing required parameters: fileName, content');
                        }

                        return await createTextFile({
                            token,
                            fileName,
                            content,
                            parentFolder,
                            includeTeamDrives
                        });
                    }

                    case 'read_file': {
                        const { fileId, includeTeamDrives } = input;

                        if (!fileId) {
                            throw new Error('Missing required parameter: fileId');
                        }

                        const content = await readFile({
                            token,
                            fileId,
                            includeTeamDrives
                        });

                        return { content };
                    }

                    case 'add_permission': {
                        const {
                            fileId,
                            type,
                            role,
                            emailAddress,
                            domain,
                            allowFileDiscovery,
                            sendNotificationEmail,
                            emailMessage,
                            transferOwnership,
                            moveToNewOwnersRoot,
                            includeTeamDrives
                        } = input;

                        if (!fileId || !type || !role) {
                            throw new Error('Missing required parameters: fileId, type, role');
                        }

                        return await addPermission({
                            token,
                            fileId,
                            type,
                            role,
                            emailAddress,
                            domain,
                            allowFileDiscovery,
                            sendNotificationEmail,
                            emailMessage,
                            transferOwnership,
                            moveToNewOwnersRoot,
                            includeTeamDrives
                        });
                    }

                    case 'delete_permission': {
                        const { fileId, permissionId, includeTeamDrives } = input;

                        if (!fileId || !permissionId) {
                            throw new Error('Missing required parameters: fileId, permissionId');
                        }

                        await deletePermission({
                            token,
                            fileId,
                            permissionId,
                            includeTeamDrives
                        });

                        return { success: true, message: 'Permission deleted successfully' };
                    }

                    case 'set_public_access': {
                        const { fileId, role, includeTeamDrives } = input;

                        if (!fileId || !role) {
                            throw new Error('Missing required parameters: fileId, role');
                        }

                        return await setPublicAccess({
                            token,
                            fileId,
                            role,
                            includeTeamDrives
                        });
                    }

                    case 'save_file_as_pdf': {
                        const { fileId, parentFolder, includeTeamDrives } = input;

                        if (!fileId) {
                            throw new Error('Missing required parameter: fileId');
                        }

                        return await saveFileAsPdf({
                            token,
                            fileId,
                            parentFolder,
                            includeTeamDrives
                        });
                    }

                    default:
                        throw new Error(`Unsupported action: ${action}`);
                }
            }
        }
    ]
};

export default googleDrivePlugin;
