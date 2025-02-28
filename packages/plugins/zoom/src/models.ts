// Zoom data models

export interface ZoomMeeting {
    id: number;
    uuid?: string;
    host_id?: string;
    host_email?: string;
    topic: string;
    type: number; // 1: Instant, 2: Scheduled, 3: Recurring with no fixed time, 8: Recurring with fixed time
    status?: string;
    start_time: string;
    duration: number;
    timezone: string;
    agenda?: string;
    created_at?: string;
    join_url?: string;
    start_url?: string;
    password?: string;
    h323_password?: string;
    pstn_password?: string;
    encrypted_password?: string;
    settings: ZoomMeetingSettings;
    pre_schedule?: boolean;
    recurrence?: ZoomRecurrence;
    tracking_fields?: ZoomTrackingField[];
}

export interface ZoomMeetingSettings {
    host_video?: boolean;
    participant_video?: boolean;
    cn_meeting?: boolean;
    in_meeting?: boolean;
    join_before_host?: boolean;
    jbh_time?: number;
    mute_upon_entry?: boolean;
    watermark?: boolean;
    use_pmi?: boolean;
    approval_type?: number;
    registration_type?: number;
    audio?: string;
    auto_recording?: string;
    enforce_login?: boolean;
    enforce_login_domains?: string;
    alternative_hosts?: string;
    close_registration?: boolean;
    show_share_button?: boolean;
    allow_multiple_devices?: boolean;
    registrants_confirmation_email?: boolean;
    waiting_room?: boolean;
    request_permission_to_unmute_participants?: boolean;
    registrants_email_notification?: boolean;
    meeting_authentication?: boolean;
    encryption_type?: string;
    approved_or_denied_countries_or_regions?: {
        enable?: boolean;
        method?: string;
        approved_list?: string[];
        denied_list?: string[];
    };
    breakout_room?: {
        enable?: boolean;
        rooms?: {
            name?: string;
            participants?: string[];
        }[];
    };
    alternative_hosts_email_notification?: boolean;
    device_testing?: boolean;
    focus_mode?: boolean;
    private_meeting?: boolean;
    email_notification?: boolean;
    host_save_video_order?: boolean;
}

export interface ZoomRecurrence {
    type: number; // 1: Daily, 2: Weekly, 3: Monthly
    repeat_interval: number;
    weekly_days?: string; // 1-7 representing days of the week
    monthly_day?: number;
    monthly_week?: number;
    monthly_week_day?: number;
    end_times?: number;
    end_date_time?: string;
}

export interface ZoomTrackingField {
    field: string;
    value?: string;
    visible?: boolean;
}

export interface ZoomMeetingRegistrant {
    id?: string;
    email: string;
    first_name: string;
    last_name?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
    phone?: string;
    industry?: string;
    org?: string;
    job_title?: string;
    purchasing_time_frame?: string;
    role_in_purchase_process?: string;
    no_of_employees?: string;
    comments?: string;
    custom_questions?: ZoomCustomQuestion[];
    status?: string;
    create_time?: string;
    join_url?: string;
    participant_pin_code?: number;
}

export interface ZoomCustomQuestion {
    title: string;
    value: string;
}

export interface ZoomUser {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    type: number;
    status: string;
    pmi: number;
    timezone: string;
    verified: number;
    created_at: string;
    last_login_time: string;
    language: string;
    phone_number: string;
    use_pmi: boolean;
    personal_meeting_url: string;
    pic_url: string;
    cms_user_id: string;
    account_id: string;
    host_key: string;
    group_ids: string[];
    im_group_ids: string[];
    dept: string;
    job_title: string;
    company: string;
    location: string;
    role_name: string;
    custom_attributes: {
        key: string;
        value: string;
        name: string;
    }[];
}

export interface ZoomCreateMeetingParams {
    token: string;
    topic: string;
    type?: number;
    start_time?: string;
    duration?: number;
    timezone?: string;
    password?: string;
    agenda?: string;
    settings?: Partial<ZoomMeetingSettings>;
    recurrence?: ZoomRecurrence;
    tracking_fields?: ZoomTrackingField[];
    pre_schedule?: boolean;
}

export interface ZoomGetMeetingParams {
    token: string;
    meetingId: string | number;
}

export interface ZoomUpdateMeetingParams {
    token: string;
    meetingId: string | number;
    topic?: string;
    type?: number;
    start_time?: string;
    duration?: number;
    timezone?: string;
    password?: string;
    agenda?: string;
    settings?: Partial<ZoomMeetingSettings>;
    recurrence?: ZoomRecurrence;
    tracking_fields?: ZoomTrackingField[];
}

export interface ZoomDeleteMeetingParams {
    token: string;
    meetingId: string | number;
    occurrenceId?: string;
    scheduleForReminder?: boolean;
    cancelMeetingReminder?: boolean;
}

export interface ZoomListMeetingsParams {
    token: string;
    userId?: string;
    type?: string;
    pageSize?: number;
    nextPageToken?: string;
    pageNumber?: number;
}

export interface ZoomCreateMeetingRegistrantParams {
    token: string;
    meetingId: string | number;
    email: string;
    first_name: string;
    last_name?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
    phone?: string;
    industry?: string;
    org?: string;
    job_title?: string;
    purchasing_time_frame?: string;
    role_in_purchase_process?: string;
    no_of_employees?: string;
    comments?: string;
    custom_questions?: ZoomCustomQuestion[];
}

export interface ZoomListMeetingRegistrantsParams {
    token: string;
    meetingId: string | number;
    status?: string;
    pageSize?: number;
    pageNumber?: number;
    nextPageToken?: string;
}

export interface ZoomGetUserParams {
    token: string;
    userId?: string;
}

export interface ZoomListUsersParams {
    token: string;
    status?: string;
    pageSize?: number;
    pageNumber?: number;
    nextPageToken?: string;
}
