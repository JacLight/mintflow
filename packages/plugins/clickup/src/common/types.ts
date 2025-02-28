export interface ClickupUser {
    id: number;
    username: string;
    email?: string;
    color: string;
    profilePicture: string | null;
    initials?: string;
}

export interface ClickupWorkspace {
    id: string;
    name: string;
    color: string;
    avatar: string;
    members: {
        user: ClickupUser;
        invited_by?: Record<string, unknown>;
    }[];
}

export interface ClickupSpace {
    id: string;
    name: string;
    private: boolean;
    statuses: ClickupStatus[];
    multiple_assignees: boolean;
    features: {
        due_dates: {
            enabled: boolean;
            start_date: boolean;
            remap_due_dates: boolean;
            remap_closed_due_date: boolean;
        };
        time_tracking: {
            enabled: boolean;
        };
        tags: {
            enabled: boolean;
        };
        time_estimates: {
            enabled: boolean;
        };
        checklists: {
            enabled: boolean;
        };
        custom_fields: {
            enabled: boolean;
        };
        remap_dependencies: {
            enabled: boolean;
        };
        dependency_warning: {
            enabled: boolean;
        };
        portfolios: {
            enabled: boolean;
        };
    };
}

export interface ClickupStatus {
    id: string;
    status: string;
    color: string;
    orderindex: number;
    type: string;
}

export interface ClickupFolder {
    id: string;
    name: string;
    orderindex: number;
    override_statuses: boolean;
    hidden: boolean;
    space: {
        id: string;
    };
    task_count: string;
    lists: ClickupList[];
    statuses?: ClickupStatus[];
}

export interface ClickupList {
    id: string;
    name: string;
    orderindex: number;
    status: {
        status: string;
        color: string;
        hide_label: boolean;
    };
    priority: {
        priority: string;
        color: string;
    };
    assignee: ClickupUser | null;
    task_count: number;
    due_date: string | null;
    start_date: string | null;
    folder: {
        id: string;
        name: string;
        hidden: boolean;
        access: boolean;
    };
    space: {
        id: string;
        name: string;
        access: boolean;
    };
    statuses: ClickupStatus[];
}

export interface ClickupTask {
    id: string;
    custom_id?: string;
    name: string;
    text_content?: string;
    description?: string;
    status: {
        status: string;
        color: string;
        orderindex: number;
        type: string;
    };
    orderindex: string;
    date_created: string;
    date_updated: string;
    date_closed?: string;
    creator: {
        id: number;
        username: string;
        color: string;
        profilePicture: string;
    };
    assignees: ClickupUser[];
    checklists?: any[];
    tags: {
        name: string;
        tag_fg: string;
        tag_bg: string;
        creator?: number;
    }[];
    parent?: string;
    priority?: {
        id: string;
        priority: string;
        color: string;
        orderindex: string;
    };
    due_date?: string;
    start_date?: string;
    time_estimate?: number;
    time_spent?: number;
    custom_fields?: {
        id: string;
        name: string;
        type: string;
        type_config: Record<string, unknown>;
        date_created: string;
        hide_from_guests: boolean;
        value: any;
        required: boolean;
    }[];
    list: {
        id: string;
    };
    folder: {
        id: string;
    };
    space: {
        id: string;
    };
    url: string;
}

export interface ClickupComment {
    id: string;
    comment: {
        text: string;
    }[];
    comment_text: string;
    user: ClickupUser;
    resolved: boolean;
    assignee?: ClickupUser;
    assigned_by?: ClickupUser;
    reactions?: any[];
    date: string;
}

export interface ClickupCustomField {
    id: string;
    name: string;
    type: string;
    type_config: Record<string, unknown>;
    date_created: string;
    hide_from_guests: boolean;
    required: boolean;
}

export interface ClickupTaskTemplate {
    id: string;
    name: string;
    content: string;
    status: string;
    assignees: number[];
    tags: string[];
    due_date: number | null;
    due_date_time: boolean;
    start_date: number | null;
    start_date_time: boolean;
    notify_all: boolean;
    parent: string | null;
    links_to: string | null;
    check_required_custom_fields: boolean;
    custom_fields: any[];
    priority: string | null;
    time_estimate: number | null;
}

export interface ClickupApiResponse<T> {
    data?: T;
    error?: string;
}
