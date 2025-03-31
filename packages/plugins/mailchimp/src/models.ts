// Mailchimp data models

export interface MailchimpAuth {
    access_token: string;
    refresh_token?: string;
}

export interface MailchimpList {
    id: string;
    name: string;
    stats: {
        member_count: number;
        unsubscribe_count: number;
        cleaned_count: number;
        member_count_since_send: number;
        unsubscribe_count_since_send: number;
        cleaned_count_since_send: number;
        campaign_count: number;
        campaign_last_sent: string;
        merge_field_count: number;
        avg_sub_rate: number;
        avg_unsub_rate: number;
        target_sub_rate: number;
        open_rate: number;
        click_rate: number;
        last_sub_date: string;
        last_unsub_date: string;
    };
    web_id: number;
    date_created: string;
    list_rating: number;
    email_type_option: boolean;
    subscribe_url_short: string;
    subscribe_url_long: string;
    beamer_address: string;
    visibility: string;
    double_optin: boolean;
    has_welcome: boolean;
    marketing_permissions: boolean;
    modules: string[];
    contact: {
        company: string;
        address1: string;
        address2: string;
        city: string;
        state: string;
        zip: string;
        country: string;
        phone: string;
    };
    campaign_defaults: {
        from_name: string;
        from_email: string;
        subject: string;
        language: string;
    };
    permission_reminder: string;
    use_archive_bar: boolean;
    notify_on_subscribe: string;
    notify_on_unsubscribe: string;
}

export interface MailchimpMember {
    id: string;
    email_address: string;
    unique_email_id: string;
    email_type: string;
    status: string;
    merge_fields: Record<string, any>;
    interests: Record<string, boolean>;
    stats: {
        avg_open_rate: number;
        avg_click_rate: number;
    };
    ip_signup: string;
    timestamp_signup: string;
    ip_opt: string;
    timestamp_opt: string;
    member_rating: number;
    last_changed: string;
    language: string;
    vip: boolean;
    email_client: string;
    location: {
        latitude: number;
        longitude: number;
        gmtoff: number;
        dstoff: number;
        country_code: string;
        timezone: string;
    };
    tags_count: number;
    tags: MailchimpTag[];
    list_id: string;
}

export interface MailchimpTag {
    id: number;
    name: string;
}

export interface MailchimpNote {
    id: number;
    created_at: string;
    created_by: string;
    updated_at: string;
    note: string;
    list_id: string;
    email_id: string;
}

export interface MailchimpWebhookEvent {
    subscribe?: boolean;
    unsubscribe?: boolean;
    profile?: boolean;
    cleaned?: boolean;
    upemail?: boolean;
    campaign?: boolean;
}

export enum MailchimpMemberStatus {
    SUBSCRIBED = 'subscribed',
    UNSUBSCRIBED = 'unsubscribed',
    CLEANED = 'cleaned',
    PENDING = 'pending',
    TRANSACTIONAL = 'transactional'
}

export enum MailchimpEmailType {
    HTML = 'html',
    TEXT = 'text'
}

export interface MailchimpWebhookRequest<T> {
    type: string;
    fired_at: string;
    data: T;
}

export interface MailchimpSubscribeWebhookData {
    id: string;
    list_id: string;
    email: string;
    email_type: MailchimpEmailType;
    ip_opt: string;
    ip_signup: string;
    merges: Record<string, string>;
}

export interface MailchimpUnsubscribeWebhookData {
    id: string;
    list_id: string;
    email: string;
    email_type: MailchimpEmailType;
    merges: Record<string, string>;
    reason: string;
}
