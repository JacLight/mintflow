// Dropbox API models and types

export interface DropboxAuth {
    access_token: string;
}

export interface DropboxFile {
    name: string;
    id: string;
    client_modified: string;
    server_modified: string;
    rev: string;
    size: number;
    path_lower: string;
    path_display: string;
    is_downloadable: boolean;
    content_hash?: string;
}

export interface DropboxFolder {
    name: string;
    id: string;
    path_lower: string;
    path_display: string;
}

export interface DropboxEntry {
    ".tag": "file" | "folder" | "deleted";
    name: string;
    id: string;
    path_lower: string;
    path_display: string;
    [key: string]: any;
}

export interface DropboxListFolderResult {
    entries: DropboxEntry[];
    cursor: string;
    has_more: boolean;
}

export interface DropboxSearchResult {
    matches: Array<{
        metadata: {
            ".tag": "file" | "folder";
            name: string;
            id: string;
            path_lower: string;
            path_display: string;
            [key: string]: any;
        };
    }>;
    more: boolean;
    start: number;
}

export interface DropboxFileMetadata {
    name: string;
    id: string;
    client_modified: string;
    server_modified: string;
    rev: string;
    size: number;
    path_lower: string;
    path_display: string;
    is_downloadable: boolean;
    content_hash?: string;
}

export interface DropboxFolderMetadata {
    name: string;
    id: string;
    path_lower: string;
    path_display: string;
}

export interface DropboxSharedLinkMetadata {
    url: string;
    name: string;
    link_permissions: {
        can_revoke: boolean;
        resolved_visibility: {
            ".tag": string;
        };
        requested_visibility: {
            ".tag": string;
        };
    };
    client_modified?: string;
    server_modified?: string;
    rev?: string;
    size?: number;
    id?: string;
    [key: string]: any;
}

// Parameter interfaces for actions

export interface UploadFileParams {
    token: string;
    path: string;
    file: string; // base64 encoded file content
    autorename?: boolean;
    mute?: boolean;
    strict_conflict?: boolean;
}

export interface ListFolderParams {
    token: string;
    path: string;
    recursive?: boolean;
    limit?: number;
}

export interface SearchParams {
    token: string;
    query: string;
    path?: string;
    max_results?: number;
    file_status?: "active" | "deleted";
    filename_only?: boolean;
}

export interface CreateFolderParams {
    token: string;
    path: string;
    autorename?: boolean;
}

export interface DeleteFileParams {
    token: string;
    path: string;
}

export interface DeleteFolderParams {
    token: string;
    path: string;
}

export interface MoveFileParams {
    token: string;
    from_path: string;
    to_path: string;
    autorename?: boolean;
    allow_ownership_transfer?: boolean;
}

export interface MoveFolderParams {
    token: string;
    from_path: string;
    to_path: string;
    autorename?: boolean;
    allow_ownership_transfer?: boolean;
}

export interface CopyFileParams {
    token: string;
    from_path: string;
    to_path: string;
    autorename?: boolean;
}

export interface CopyFolderParams {
    token: string;
    from_path: string;
    to_path: string;
    autorename?: boolean;
}

export interface GetFileLinkParams {
    token: string;
    path: string;
    short_url?: boolean;
}

export interface CreateTextFileParams {
    token: string;
    path: string;
    content: string;
    autorename?: boolean;
    mute?: boolean;
    strict_conflict?: boolean;
}
