// Jira Cloud data models

export interface JiraAuth {
    instanceUrl: string;
    email: string;
    apiToken: string;
}

export interface JiraProject {
    id: string;
    key: string;
    name: string;
    self: string;
    projectTypeKey: string;
    simplified: boolean;
    style: string;
    isPrivate: boolean;
}

export interface JiraIssueType {
    id: string;
    name: string;
    description: string;
    iconUrl: string;
    subtask: boolean;
    avatarId: number;
}

export interface JiraUser {
    accountId: string;
    accountType: string;
    displayName: string;
    emailAddress?: string;
    active: boolean;
    self: string;
}

export interface JiraPriority {
    id: string;
    name: string;
    description: string;
    iconUrl: string;
    self: string;
}

export interface JiraIssue {
    id: string;
    key: string;
    self: string;
    fields: {
        summary: string;
        description?: {
            content: Array<{
                content: Array<{
                    text: string;
                    type: string;
                }>;
                type: string;
            }>;
            type: string;
            version: number;
        };
        assignee?: JiraUser;
        priority?: JiraPriority;
        issuetype: JiraIssueType;
        project: JiraProject;
        created: string;
        updated: string;
        status: {
            id: string;
            name: string;
            description: string;
            statusCategory: {
                id: number;
                key: string;
                name: string;
                colorName: string;
            };
        };
        [key: string]: any;
    };
}

export interface JiraComment {
    id: string;
    self: string;
    body: {
        content: Array<{
            content: Array<{
                text: string;
                type: string;
            }>;
            type: string;
        }>;
        type: string;
        version: number;
    };
    author: JiraUser;
    created: string;
    updated: string;
}

export interface JiraAttachment {
    id: string;
    self: string;
    filename: string;
    author: JiraUser;
    created: string;
    size: number;
    mimeType: string;
    content: string;
}

export interface JiraIssueLink {
    id: string;
    self: string;
    type: {
        id: string;
        name: string;
        inward: string;
        outward: string;
        self: string;
    };
    inwardIssue: {
        id: string;
        key: string;
        self: string;
    };
    outwardIssue: {
        id: string;
        key: string;
        self: string;
    };
}

export interface JiraIssueLinkType {
    id: string;
    name: string;
    inward: string;
    outward: string;
    self: string;
}

export interface JiraSearchResult {
    expand: string;
    startAt: number;
    maxResults: number;
    total: number;
    issues: JiraIssue[];
}

export interface JiraCreateIssueResponse {
    id: string;
    key: string;
    self: string;
}

export interface JiraCreateIssueRequest {
    projectId: string;
    issueTypeId: string;
    summary: string;
    description?: string;
    assignee?: string;
    priority?: string;
    parentKey?: string;
    [key: string]: any;
}

export interface JiraUpdateIssueRequest {
    summary?: string;
    description?: string;
    assignee?: string;
    priority?: string;
    [key: string]: any;
}
