// Zendesk data models

export interface ZendeskAuth {
    email: string;
    token: string;
    subdomain: string;
}

export interface ZendeskView {
    id: number;
    title: string;
    description: string | null;
    active: boolean;
    updated_at: string;
    created_at: string;
    position: number;
    execution: {
        group_by: string | null;
        group_order: string;
        sort_by: string;
        sort_order: string;
        group: {
            id: string;
            value: string;
            order: string;
        }[];
        columns: {
            id: string;
            title: string;
        }[];
        fields: {
            id: string;
            title: string;
        }[];
        custom_fields: {
            id: string;
            title: string;
        }[];
    };
    conditions: {
        all: {
            field: string;
            operator: string;
            value: string | string[];
        }[];
        any: {
            field: string;
            operator: string;
            value: string | string[];
        }[];
    };
    restriction: {
        type: string;
        id: number;
    } | null;
    raw_title: string;
    url: string;
}

export interface ZendeskTicket {
    id: number;
    url: string;
    external_id: string | null;
    type: string | null;
    subject: string;
    raw_subject: string;
    description: string;
    priority: string | null;
    status: ZendeskTicketStatus;
    recipient: string | null;
    requester_id: number;
    submitter_id: number;
    assignee_id: number | null;
    organization_id: number | null;
    group_id: number | null;
    collaborator_ids: number[];
    follower_ids: number[];
    email_cc_ids: number[];
    forum_topic_id: number | null;
    problem_id: number | null;
    has_incidents: boolean;
    is_public: boolean;
    due_at: string | null;
    tags: string[];
    custom_fields: {
        id: number;
        value: any;
    }[];
    satisfaction_rating: {
        score: string;
        id: number;
        comment: string;
    } | null;
    sharing_agreement_ids: number[];
    via: {
        channel: string;
        source: {
            from: any;
            to: any;
            rel: string | null;
        };
    };
    created_at: string;
    updated_at: string;
    custom_status_id: number | null;
    brand_id: number | null;
    allow_channelback: boolean;
    allow_attachments: boolean;
    from_messaging_channel: boolean;
    ticket_form_id: number | null;
    fields: {
        id: number;
        value: any;
    }[];
    followup_ids: number[];
    comment?: {
        body: string;
        public?: boolean;
        author_id?: number;
    };
}

export interface ZendeskUser {
    id: number;
    url: string;
    name: string;
    email: string;
    created_at: string;
    updated_at: string;
    time_zone: string;
    iana_time_zone: string;
    phone: string | null;
    shared_phone_number: boolean;
    photo: {
        url: string;
        id: number;
        file_name: string;
        content_url: string;
        mapped_content_url: string;
        content_type: string;
        size: number;
        width: number;
        height: number;
        inline: boolean;
    } | null;
    locale_id: number;
    locale: string;
    organization_id: number | null;
    role: string;
    verified: boolean;
    external_id: string | null;
    tags: string[];
    alias: string | null;
    active: boolean;
    shared: boolean;
    shared_agent: boolean;
    last_login_at: string | null;
    two_factor_auth_enabled: boolean | null;
    signature: string | null;
    details: string | null;
    notes: string | null;
    role_type: number | null;
    custom_role_id: number | null;
    moderator: boolean;
    ticket_restriction: string | null;
    only_private_comments: boolean;
    restricted_agent: boolean;
    suspended: boolean;
    default_group_id: number | null;
    report_csv: boolean;
    user_fields: Record<string, any>;
}

export interface ZendeskGroup {
    id: number;
    url: string;
    name: string;
    description: string | null;
    default: boolean;
    deleted: boolean;
    created_at: string;
    updated_at: string;
}

export interface ZendeskOrganization {
    id: number;
    url: string;
    name: string;
    shared_tickets: boolean;
    shared_comments: boolean;
    external_id: string | null;
    created_at: string;
    updated_at: string;
    domain_names: string[];
    details: string | null;
    notes: string | null;
    group_id: number | null;
    tags: string[];
    organization_fields: Record<string, any>;
}

export enum ZendeskTicketStatus {
    NEW = 'new',
    OPEN = 'open',
    PENDING = 'pending',
    HOLD = 'hold',
    SOLVED = 'solved',
    CLOSED = 'closed'
}

export enum ZendeskTicketPriority {
    URGENT = 'urgent',
    HIGH = 'high',
    NORMAL = 'normal',
    LOW = 'low'
}

export enum ZendeskTicketType {
    PROBLEM = 'problem',
    INCIDENT = 'incident',
    QUESTION = 'question',
    TASK = 'task'
}

export interface ZendeskWebhookPayload {
    id: number;
    title: string;
    url: string;
    created_at: string;
    updated_at: string;
    [key: string]: any;
}
