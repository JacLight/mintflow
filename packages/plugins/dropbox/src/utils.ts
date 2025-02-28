import axios from 'axios';
import {
    UploadFileParams,
    ListFolderParams,
    SearchParams,
    CreateFolderParams,
    DeleteFileParams,
    DeleteFolderParams,
    MoveFileParams,
    MoveFolderParams,
    CopyFileParams,
    CopyFolderParams,
    GetFileLinkParams,
    CreateTextFileParams,
    DropboxListFolderResult,
    DropboxSearchResult,
    DropboxFileMetadata,
    DropboxFolderMetadata,
    DropboxSharedLinkMetadata
} from './models.js';

/**
 * Upload a file to Dropbox
 */
export const uploadFile = async (params: UploadFileParams): Promise<DropboxFileMetadata> => {
    const { token, path, file, autorename = false, mute = false, strict_conflict = false } = params;

    const apiParams = {
        path,
        mode: 'add',
        autorename,
        mute,
        strict_conflict
    };

    // For information about Dropbox JSON encoding, see https://www.dropbox.com/developers/reference/json-encoding
    const dropboxApiArg = JSON.stringify(apiParams).replace(/[\u007f-\uffff]/g,
        (c) => '\\u' + ('000' + c.charCodeAt(0).toString(16)).slice(-4));

    const fileBuffer = Buffer.from(file, 'base64');

    const response = await axios({
        method: 'POST',
        url: 'https://content.dropboxapi.com/2/files/upload',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Dropbox-API-Arg': dropboxApiArg,
            'Content-Type': 'application/octet-stream'
        },
        data: fileBuffer
    });

    return response.data;
};

/**
 * List contents of a folder
 */
export const listFolder = async (params: ListFolderParams): Promise<DropboxListFolderResult> => {
    const { token, path, recursive = false, limit = 2000 } = params;

    const response = await axios({
        method: 'POST',
        url: 'https://api.dropboxapi.com/2/files/list_folder',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        data: {
            path,
            recursive,
            limit
        }
    });

    return response.data;
};

/**
 * Search for files and folders
 */
export const search = async (params: SearchParams): Promise<DropboxSearchResult> => {
    const { token, query, path = '', max_results = 100, file_status = 'active', filename_only = false } = params;

    const response = await axios({
        method: 'POST',
        url: 'https://api.dropboxapi.com/2/files/search_v2',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        data: {
            query,
            options: {
                path,
                max_results,
                file_status,
                filename_only
            }
        }
    });

    return response.data;
};

/**
 * Create a new folder
 */
export const createFolder = async (params: CreateFolderParams): Promise<DropboxFolderMetadata> => {
    const { token, path, autorename = false } = params;

    const response = await axios({
        method: 'POST',
        url: 'https://api.dropboxapi.com/2/files/create_folder_v2',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        data: {
            path,
            autorename
        }
    });

    return response.data.metadata;
};

/**
 * Delete a file
 */
export const deleteFile = async (params: DeleteFileParams): Promise<DropboxFileMetadata> => {
    const { token, path } = params;

    const response = await axios({
        method: 'POST',
        url: 'https://api.dropboxapi.com/2/files/delete_v2',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        data: {
            path
        }
    });

    return response.data.metadata;
};

/**
 * Delete a folder
 */
export const deleteFolder = async (params: DeleteFolderParams): Promise<DropboxFolderMetadata> => {
    const { token, path } = params;

    const response = await axios({
        method: 'POST',
        url: 'https://api.dropboxapi.com/2/files/delete_v2',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        data: {
            path
        }
    });

    return response.data.metadata;
};

/**
 * Move a file
 */
export const moveFile = async (params: MoveFileParams): Promise<DropboxFileMetadata> => {
    const { token, from_path, to_path, autorename = false, allow_ownership_transfer = false } = params;

    const response = await axios({
        method: 'POST',
        url: 'https://api.dropboxapi.com/2/files/move_v2',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        data: {
            from_path,
            to_path,
            autorename,
            allow_ownership_transfer
        }
    });

    return response.data.metadata;
};

/**
 * Move a folder
 */
export const moveFolder = async (params: MoveFolderParams): Promise<DropboxFolderMetadata> => {
    const { token, from_path, to_path, autorename = false, allow_ownership_transfer = false } = params;

    const response = await axios({
        method: 'POST',
        url: 'https://api.dropboxapi.com/2/files/move_v2',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        data: {
            from_path,
            to_path,
            autorename,
            allow_ownership_transfer
        }
    });

    return response.data.metadata;
};

/**
 * Copy a file
 */
export const copyFile = async (params: CopyFileParams): Promise<DropboxFileMetadata> => {
    const { token, from_path, to_path, autorename = false } = params;

    const response = await axios({
        method: 'POST',
        url: 'https://api.dropboxapi.com/2/files/copy_v2',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        data: {
            from_path,
            to_path,
            autorename
        }
    });

    return response.data.metadata;
};

/**
 * Copy a folder
 */
export const copyFolder = async (params: CopyFolderParams): Promise<DropboxFolderMetadata> => {
    const { token, from_path, to_path, autorename = false } = params;

    const response = await axios({
        method: 'POST',
        url: 'https://api.dropboxapi.com/2/files/copy_v2',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        data: {
            from_path,
            to_path,
            autorename
        }
    });

    return response.data.metadata;
};

/**
 * Get a shared link for a file
 */
export const getFileLink = async (params: GetFileLinkParams): Promise<DropboxSharedLinkMetadata> => {
    const { token, path, short_url = false } = params;

    const response = await axios({
        method: 'POST',
        url: 'https://api.dropboxapi.com/2/sharing/create_shared_link_with_settings',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        data: {
            path,
            settings: {
                requested_visibility: { '.tag': 'public' },
                require_password: false,
                audience: { '.tag': 'public' },
                access: { '.tag': 'viewer' }
            }
        }
    });

    return response.data;
};

/**
 * Create a new text file
 */
export const createTextFile = async (params: CreateTextFileParams): Promise<DropboxFileMetadata> => {
    const { token, path, content, autorename = false, mute = false, strict_conflict = false } = params;

    const apiParams = {
        path,
        mode: 'add',
        autorename,
        mute,
        strict_conflict
    };

    // For information about Dropbox JSON encoding, see https://www.dropbox.com/developers/reference/json-encoding
    const dropboxApiArg = JSON.stringify(apiParams).replace(/[\u007f-\uffff]/g,
        (c) => '\\u' + ('000' + c.charCodeAt(0).toString(16)).slice(-4));

    const contentBuffer = Buffer.from(content, 'utf-8');

    const response = await axios({
        method: 'POST',
        url: 'https://content.dropboxapi.com/2/files/upload',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Dropbox-API-Arg': dropboxApiArg,
            'Content-Type': 'application/octet-stream'
        },
        data: contentBuffer
    });

    return response.data;
};
