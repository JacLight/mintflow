// Intercom data models

export interface IntercomAuth {
    accessToken: string;
    region: string;
}

export interface IntercomAdmin {
    id: string;
    type: 'admin';
    name?: string;
    email?: string;
}

export interface IntercomContact {
    id: string;
    type: 'contact';
    role: 'user' | 'lead';
    name?: string;
    email?: string;
    phone?: string;
    avatar?: {
        type: 'avatar';
        image_url?: string;
    };
    location_data?: {
        city_name?: string;
        continent_code?: string;
        country_code?: string;
        country_name?: string;
        latitude?: number;
        longitude?: number;
        postal_code?: string;
        region_name?: string;
        timezone?: string;
    };
    created_at?: number;
    updated_at?: number;
    signed_up_at?: number;
    last_seen_at?: number;
    last_replied_at?: number;
    last_contacted_at?: number;
    last_email_opened_at?: number;
    last_email_clicked_at?: number;
    browser?: string;
    browser_version?: string;
    browser_language?: string;
    os?: string;
    android_app_name?: string;
    android_app_version?: string;
    android_device?: string;
    android_os_version?: string;
    android_sdk_version?: string;
    android_last_seen_at?: number;
    ios_app_name?: string;
    ios_app_version?: string;
    ios_device?: string;
    ios_os_version?: string;
    ios_sdk_version?: string;
    ios_last_seen_at?: number;
    custom_attributes?: Record<string, any>;
    tags?: {
        type: 'tag';
        id: string;
        name: string;
    }[];
    notes?: {
        type: 'note';
        id: string;
        body: string;
        author: IntercomAdmin;
        created_at: number;
    }[];
    companies?: {
        type: 'company';
        id: string;
        name: string;
    }[];
    social_profiles?: {
        type: 'social_profile';
        name: string;
        url: string;
    }[];
    segments?: {
        type: 'segment';
        id: string;
    }[];
    unsubscribed_from_emails?: boolean;
    marked_email_as_spam?: boolean;
    has_hard_bounced?: boolean;
}

export interface IntercomUser extends IntercomContact {
    role: 'user';
}

export interface IntercomLead extends IntercomContact {
    role: 'lead';
}

export interface IntercomCompany {
    id: string;
    type: 'company';
    name?: string;
    company_id?: string;
    created_at?: number;
    updated_at?: number;
    monthly_spend?: number;
    session_count?: number;
    user_count?: number;
    size?: number;
    website?: string;
    industry?: string;
    plan?: {
        type: 'plan';
        id: string;
        name: string;
    };
    custom_attributes?: Record<string, any>;
    tags?: {
        type: 'tag';
        id: string;
        name: string;
    }[];
    segments?: {
        type: 'segment';
        id: string;
    }[];
}

export interface IntercomTag {
    id: string;
    type: 'tag';
    name: string;
}

export interface IntercomConversation {
    type: 'conversation';
    id: string;
    created_at: number;
    updated_at: number;
    waiting_since?: number;
    snoozed_until?: number;
    source: {
        type: string;
        id?: string;
        delivered_as?: string;
        subject?: string;
        body?: string;
        author?: {
            type: string;
            id: string;
            name?: string;
            email?: string;
        };
        attachments?: {
            type: string;
            name: string;
            url: string;
            content_type: string;
            filesize: number;
            width?: number;
            height?: number;
        }[];
        url?: string;
        to?: {
            type: string;
            id?: string;
            email?: string;
        };
        from?: {
            type: string;
            id?: string;
            email?: string;
        };
    };
    contacts: {
        type: 'contact';
        id: string;
    }[];
    teammates: {
        type: 'admin';
        id: string;
    }[];
    assignee: {
        type: 'admin' | 'team';
        id: string;
    };
    conversation_rating?: {
        rating: number;
        remark?: string;
        created_at: number;
        contact: {
            type: 'contact';
            id: string;
        };
        teammate: {
            type: 'admin';
            id: string;
        };
    };
    open: boolean;
    state: 'open' | 'closed' | 'snoozed';
    read: boolean;
    priority: 'priority' | 'not_priority';
    conversation_parts: {
        type: 'conversation_part';
        id: string;
        part_type: string;
        body?: string;
        created_at: number;
        updated_at: number;
        notified_at: number;
        assigned_to?: {
            type: 'admin' | 'team';
            id: string;
        };
        author: {
            type: string;
            id: string;
            name?: string;
            email?: string;
        };
        attachments?: {
            type: string;
            name: string;
            url: string;
            content_type: string;
            filesize: number;
            width?: number;
            height?: number;
        }[];
        external_id?: string;
        redacted: boolean;
    }[];
    conversation_message: {
        type: 'conversation_message';
        id: string;
        subject?: string;
        body?: string;
        author: {
            type: string;
            id: string;
            name?: string;
            email?: string;
        };
        attachments?: {
            type: string;
            name: string;
            url: string;
            content_type: string;
            filesize: number;
            width?: number;
            height?: number;
        }[];
        url?: string;
    };
    tags?: {
        type: 'tag';
        id: string;
        name: string;
    }[];
    custom_attributes?: Record<string, any>;
    links?: {
        conversation_web?: string;
    };
}

export interface IntercomArticle {
    id: string;
    type: 'article';
    title: string;
    description?: string;
    body: string;
    author_id: string;
    state: 'published' | 'draft';
    created_at: number;
    updated_at: number;
    url?: string;
    parent_id?: string;
    parent_type?: string;
    translated_content?: Record<string, {
        title: string;
        description?: string;
        body: string;
    }>;
}

export interface IntercomTicket {
    id: string;
    type: 'ticket';
    title: string;
    admin_assignee_id?: string;
    team_assignee_id?: string;
    contact_id: string;
    created_at: number;
    updated_at: number;
    state: 'in_progress' | 'waiting_on_customer' | 'waiting_on_us' | 'resolved';
    priority: 'urgent' | 'high' | 'normal' | 'low';
    custom_attributes?: Record<string, any>;
    tags?: {
        type: 'tag';
        id: string;
        name: string;
    }[];
    conversation_parts?: {
        type: 'conversation_part';
        id: string;
        part_type: string;
        body?: string;
        created_at: number;
        updated_at: number;
        author: {
            type: string;
            id: string;
            name?: string;
            email?: string;
        };
    }[];
}

export interface IntercomMessage {
    message_type: 'email' | 'inapp';
    subject?: string;
    template?: 'personal' | 'plain';
    body: string;
    from: {
        type: 'admin';
        id: string;
    };
    to: {
        type: 'user' | 'lead';
        id: string;
    };
    create_conversation_without_contact_reply?: boolean;
}

export interface IntercomWebhookPayload {
    type: string;
    app_id: string;
    id: string;
    topic: string;
    data: {
        type: string;
        item: Record<string, any>;
    };
}
