// Google Drive API models and types

export interface GoogleDriveAuth {
    access_token: string;
}

export interface GoogleDriveFile {
    id: string;
    name: string;
    mimeType: string;
    kind: string;
    webViewLink?: string;
    trashed?: boolean;
    parents?: string[];
    createdTime?: string;
    modifiedTime?: string;
    size?: string;
    webContentLink?: string;
    iconLink?: string;
    thumbnailLink?: string;
    shared?: boolean;
    owners?: Array<{
        displayName: string;
        emailAddress: string;
        kind: string;
        me: boolean;
        permissionId: string;
        photoLink: string;
    }>;
}

export interface GoogleDriveFolder {
    id: string;
    name: string;
    mimeType: string;
    kind: string;
    trashed?: boolean;
    parents?: string[];
}

export interface GoogleDriveFileList {
    kind: string;
    incompleteSearch: boolean;
    files: GoogleDriveFile[];
    nextPageToken?: string;
}

export interface GoogleDrivePermission {
    id: string;
    type: string;
    emailAddress?: string;
    role: string;
    allowFileDiscovery?: boolean;
    domain?: string;
    expirationTime?: string;
}

export interface GoogleDrivePermissionList {
    kind: string;
    permissions: GoogleDrivePermission[];
    nextPageToken?: string;
}

// Parameter interfaces for actions

export interface UploadFileParams {
    token: string;
    fileName: string;
    file: string; // base64 encoded file content
    fileExtension?: string;
    parentFolder?: string;
    includeTeamDrives?: boolean;
}

export interface CreateFolderParams {
    token: string;
    folderName: string;
    parentFolder?: string;
    includeTeamDrives?: boolean;
}

export interface ListFilesParams {
    token: string;
    folderId: string;
    includeTrashed?: boolean;
    includeTeamDrives?: boolean;
    orderBy?: string;
    pageSize?: number;
    pageToken?: string;
    fields?: string;
}

export interface SearchFilesParams {
    token: string;
    query: string;
    includeTeamDrives?: boolean;
    orderBy?: string;
    pageSize?: number;
    pageToken?: string;
    fields?: string;
}

export interface GetFileParams {
    token: string;
    fileId: string;
    includeTeamDrives?: boolean;
    fields?: string;
}

export interface DeleteFileParams {
    token: string;
    fileId: string;
    includeTeamDrives?: boolean;
}

export interface TrashFileParams {
    token: string;
    fileId: string;
    includeTeamDrives?: boolean;
}

export interface MoveFileParams {
    token: string;
    fileId: string;
    destinationFolderId: string;
    includeTeamDrives?: boolean;
}

export interface CopyFileParams {
    token: string;
    fileId: string;
    name?: string;
    parentFolder?: string;
    includeTeamDrives?: boolean;
}

export interface CreateTextFileParams {
    token: string;
    fileName: string;
    content: string;
    parentFolder?: string;
    includeTeamDrives?: boolean;
}

export interface ReadFileParams {
    token: string;
    fileId: string;
    includeTeamDrives?: boolean;
}

export interface AddPermissionParams {
    token: string;
    fileId: string;
    type: 'user' | 'group' | 'domain' | 'anyone';
    role: 'owner' | 'organizer' | 'fileOrganizer' | 'writer' | 'commenter' | 'reader';
    emailAddress?: string;
    domain?: string;
    allowFileDiscovery?: boolean;
    sendNotificationEmail?: boolean;
    emailMessage?: string;
    transferOwnership?: boolean;
    moveToNewOwnersRoot?: boolean;
    includeTeamDrives?: boolean;
}

export interface DeletePermissionParams {
    token: string;
    fileId: string;
    permissionId: string;
    includeTeamDrives?: boolean;
}

export interface SetPublicAccessParams {
    token: string;
    fileId: string;
    role: 'reader' | 'writer' | 'commenter';
    includeTeamDrives?: boolean;
}

export interface SaveFileAsPdfParams {
    token: string;
    fileId: string;
    parentFolder?: string;
    includeTeamDrives?: boolean;
}
