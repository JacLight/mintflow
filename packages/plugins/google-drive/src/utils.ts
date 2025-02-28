import axios from 'axios';
import FormData from 'form-data';
import mime from 'mime-types';
import querystring from 'querystring';
import {
    UploadFileParams,
    CreateFolderParams,
    ListFilesParams,
    SearchFilesParams,
    GetFileParams,
    DeleteFileParams,
    TrashFileParams,
    MoveFileParams,
    CopyFileParams,
    CreateTextFileParams,
    ReadFileParams,
    AddPermissionParams,
    DeletePermissionParams,
    SetPublicAccessParams,
    SaveFileAsPdfParams,
    GoogleDriveFile,
    GoogleDriveFolder,
    GoogleDriveFileList,
    GoogleDrivePermission
} from './models.js';

/**
 * Upload a file to Google Drive
 */
export const uploadFile = async (params: UploadFileParams): Promise<GoogleDriveFile> => {
    const { token, fileName, file, fileExtension, parentFolder, includeTeamDrives = false } = params;

    const mimeType = fileExtension ? mime.lookup(fileExtension) || 'application/octet-stream' : 'application/octet-stream';

    const meta = {
        name: fileName,
        mimeType: mimeType,
        ...(parentFolder ? { parents: [parentFolder] } : {})
    };

    const metaBuffer = Buffer.from(JSON.stringify(meta), 'utf-8');
    const fileBuffer = Buffer.from(file, 'base64');

    const form = new FormData();
    form.append('Metadata', metaBuffer, { contentType: 'application/json' });
    form.append('Media', fileBuffer);

    const response = await axios({
        method: 'POST',
        url: 'https://www.googleapis.com/upload/drive/v3/files',
        params: {
            uploadType: 'multipart',
            supportsAllDrives: String(includeTeamDrives)
        },
        headers: {
            'Authorization': `Bearer ${token}`,
            ...form.getHeaders()
        },
        data: form
    });

    return response.data;
};

/**
 * Create a new folder in Google Drive
 */
export const createFolder = async (params: CreateFolderParams): Promise<GoogleDriveFolder> => {
    const { token, folderName, parentFolder, includeTeamDrives = false } = params;

    const response = await axios({
        method: 'POST',
        url: 'https://www.googleapis.com/drive/v3/files',
        params: {
            supportsAllDrives: String(includeTeamDrives)
        },
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        data: {
            name: folderName,
            mimeType: 'application/vnd.google-apps.folder',
            ...(parentFolder ? { parents: [parentFolder] } : {})
        }
    });

    return response.data;
};

/**
 * List files in a folder
 */
export const listFiles = async (params: ListFilesParams): Promise<GoogleDriveFileList> => {
    const {
        token,
        folderId,
        includeTrashed = false,
        includeTeamDrives = false,
        orderBy = 'name',
        pageSize = 100,
        pageToken,
        fields = 'files(id,kind,mimeType,name,trashed)'
    } = params;

    let q = `'${folderId}' in parents`;

    if (!includeTrashed) {
        q += ' and trashed=false';
    }

    const queryParams: Record<string, string> = {
        q,
        fields,
        orderBy,
        pageSize: String(pageSize),
        includeItemsFromAllDrives: String(includeTeamDrives),
        supportsAllDrives: String(includeTeamDrives)
    };

    if (pageToken) {
        queryParams.pageToken = pageToken;
    }

    const response = await axios({
        method: 'GET',
        url: `https://www.googleapis.com/drive/v3/files?${querystring.stringify(queryParams)}`,
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    return response.data;
};

/**
 * Search for files and folders
 */
export const searchFiles = async (params: SearchFilesParams): Promise<GoogleDriveFileList> => {
    const {
        token,
        query,
        includeTeamDrives = false,
        orderBy = 'name',
        pageSize = 100,
        pageToken,
        fields = 'files(id,kind,mimeType,name,trashed)'
    } = params;

    const queryParams: Record<string, string> = {
        q: `name contains '${query}' and trashed=false`,
        fields,
        orderBy,
        pageSize: String(pageSize),
        includeItemsFromAllDrives: String(includeTeamDrives),
        supportsAllDrives: String(includeTeamDrives)
    };

    if (pageToken) {
        queryParams.pageToken = pageToken;
    }

    const response = await axios({
        method: 'GET',
        url: `https://www.googleapis.com/drive/v3/files?${querystring.stringify(queryParams)}`,
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    return response.data;
};

/**
 * Get a file by ID
 */
export const getFile = async (params: GetFileParams): Promise<GoogleDriveFile> => {
    const { token, fileId, includeTeamDrives = false, fields = 'id,name,mimeType,webViewLink,size,createdTime,modifiedTime' } = params;

    const response = await axios({
        method: 'GET',
        url: `https://www.googleapis.com/drive/v3/files/${fileId}`,
        params: {
            fields,
            supportsAllDrives: String(includeTeamDrives)
        },
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    return response.data;
};

/**
 * Delete a file permanently
 */
export const deleteFile = async (params: DeleteFileParams): Promise<void> => {
    const { token, fileId, includeTeamDrives = false } = params;

    await axios({
        method: 'DELETE',
        url: `https://www.googleapis.com/drive/v3/files/${fileId}`,
        params: {
            supportsAllDrives: String(includeTeamDrives)
        },
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
};

/**
 * Move a file to trash
 */
export const trashFile = async (params: TrashFileParams): Promise<GoogleDriveFile> => {
    const { token, fileId, includeTeamDrives = false } = params;

    const response = await axios({
        method: 'PATCH',
        url: `https://www.googleapis.com/drive/v3/files/${fileId}`,
        params: {
            supportsAllDrives: String(includeTeamDrives)
        },
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        data: {
            trashed: true
        }
    });

    return response.data;
};

/**
 * Move a file to a different folder
 */
export const moveFile = async (params: MoveFileParams): Promise<GoogleDriveFile> => {
    const { token, fileId, destinationFolderId, includeTeamDrives = false } = params;

    // First, get the file to know its current parents
    const file = await getFile({
        token,
        fileId,
        includeTeamDrives,
        fields: 'id,parents'
    });

    // Then update the file with the new parent
    const response = await axios({
        method: 'PATCH',
        url: `https://www.googleapis.com/drive/v3/files/${fileId}`,
        params: {
            addParents: destinationFolderId,
            removeParents: file.parents?.join(','),
            supportsAllDrives: String(includeTeamDrives)
        },
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    return response.data;
};

/**
 * Copy a file
 */
export const copyFile = async (params: CopyFileParams): Promise<GoogleDriveFile> => {
    const { token, fileId, name, parentFolder, includeTeamDrives = false } = params;

    const data: any = {};
    if (name) data.name = name;
    if (parentFolder) data.parents = [parentFolder];

    const response = await axios({
        method: 'POST',
        url: `https://www.googleapis.com/drive/v3/files/${fileId}/copy`,
        params: {
            supportsAllDrives: String(includeTeamDrives)
        },
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        data
    });

    return response.data;
};

/**
 * Create a new text file
 */
export const createTextFile = async (params: CreateTextFileParams): Promise<GoogleDriveFile> => {
    const { token, fileName, content, parentFolder, includeTeamDrives = false } = params;

    const meta = {
        name: fileName,
        mimeType: 'text/plain',
        ...(parentFolder ? { parents: [parentFolder] } : {})
    };

    const metaBuffer = Buffer.from(JSON.stringify(meta), 'utf-8');
    const contentBuffer = Buffer.from(content, 'utf-8');

    const form = new FormData();
    form.append('Metadata', metaBuffer, { contentType: 'application/json' });
    form.append('Media', contentBuffer);

    const response = await axios({
        method: 'POST',
        url: 'https://www.googleapis.com/upload/drive/v3/files',
        params: {
            uploadType: 'multipart',
            supportsAllDrives: String(includeTeamDrives)
        },
        headers: {
            'Authorization': `Bearer ${token}`,
            ...form.getHeaders()
        },
        data: form
    });

    return response.data;
};

/**
 * Read a file's content
 */
export const readFile = async (params: ReadFileParams): Promise<string> => {
    const { token, fileId, includeTeamDrives = false } = params;

    const response = await axios({
        method: 'GET',
        url: `https://www.googleapis.com/drive/v3/files/${fileId}`,
        params: {
            alt: 'media',
            supportsAllDrives: String(includeTeamDrives)
        },
        headers: {
            'Authorization': `Bearer ${token}`
        },
        responseType: 'arraybuffer'
    });

    return Buffer.from(response.data).toString('utf-8');
};

/**
 * Add a permission to a file
 */
export const addPermission = async (params: AddPermissionParams): Promise<GoogleDrivePermission> => {
    const {
        token,
        fileId,
        type,
        role,
        emailAddress,
        domain,
        allowFileDiscovery = false,
        sendNotificationEmail = false,
        emailMessage = '',
        transferOwnership = false,
        moveToNewOwnersRoot = false,
        includeTeamDrives = false
    } = params;

    const data: any = {
        type,
        role
    };

    if (type === 'user' || type === 'group') {
        if (!emailAddress) {
            throw new Error('Email address is required for user or group permission type');
        }
        data.emailAddress = emailAddress;
    } else if (type === 'domain') {
        if (!domain) {
            throw new Error('Domain is required for domain permission type');
        }
        data.domain = domain;
    }

    if (type === 'domain' || type === 'anyone') {
        data.allowFileDiscovery = allowFileDiscovery;
    }

    const queryParams: Record<string, string> = {
        supportsAllDrives: String(includeTeamDrives),
        sendNotificationEmail: String(sendNotificationEmail)
    };

    if (sendNotificationEmail && emailMessage) {
        queryParams.emailMessage = emailMessage;
    }

    if (role === 'owner') {
        queryParams.transferOwnership = String(transferOwnership);
        queryParams.moveToNewOwnersRoot = String(moveToNewOwnersRoot);
    }

    const response = await axios({
        method: 'POST',
        url: `https://www.googleapis.com/drive/v3/files/${fileId}/permissions`,
        params: queryParams,
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        data
    });

    return response.data;
};

/**
 * Delete a permission from a file
 */
export const deletePermission = async (params: DeletePermissionParams): Promise<void> => {
    const { token, fileId, permissionId, includeTeamDrives = false } = params;

    await axios({
        method: 'DELETE',
        url: `https://www.googleapis.com/drive/v3/files/${fileId}/permissions/${permissionId}`,
        params: {
            supportsAllDrives: String(includeTeamDrives)
        },
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
};

/**
 * Set public access to a file
 */
export const setPublicAccess = async (params: SetPublicAccessParams): Promise<GoogleDrivePermission> => {
    return addPermission({
        token: params.token,
        fileId: params.fileId,
        type: 'anyone',
        role: params.role,
        includeTeamDrives: params.includeTeamDrives
    });
};

/**
 * Save a Google Docs file as PDF
 */
export const saveFileAsPdf = async (params: SaveFileAsPdfParams): Promise<GoogleDriveFile> => {
    const { token, fileId, parentFolder, includeTeamDrives = false } = params;

    // First, get the file to get its name
    const file = await getFile({
        token,
        fileId,
        includeTeamDrives,
        fields: 'id,name'
    });

    // Create a copy with PDF format
    const response = await axios({
        method: 'POST',
        url: `https://www.googleapis.com/drive/v3/files/${fileId}/copy`,
        params: {
            supportsAllDrives: String(includeTeamDrives)
        },
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        data: {
            name: `${file.name}.pdf`,
            mimeType: 'application/pdf',
            ...(parentFolder ? { parents: [parentFolder] } : {})
        }
    });

    return response.data;
};
