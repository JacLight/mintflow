// Calendly API models and types

export interface CalendlyAuth {
    token: string;
}

export interface CalendlyUser {
    uri: string;
    email: string;
    name: string;
    current_organization: string;
}

export interface CalendlyEvent {
    uri: string;
    name: string;
    description: string | null;
    duration: number;
    kind: string;
    slug: string;
    color: string;
    active: boolean;
    created_at: string;
    updated_at: string;
    scheduling_url: string;
    secret: boolean;
    pooling_type: string | null;
    type: string;
    internal_note: string | null;
}

export interface CalendlyScheduledEvent {
    uri: string;
    name: string;
    status: string;
    start_time: string;
    end_time: string;
    event_type: string;
    location: {
        type: string;
        location: string;
    };
    invitees_counter: {
        total: number;
        active: number;
        limit: number;
    };
    created_at: string;
    updated_at: string;
    event_memberships: Array<{
        user: string;
    }>;
    event_guests: Array<{
        email: string;
        created_at: string;
        updated_at: string;
    }>;
}

export interface CalendlyInvitee {
    uri: string;
    email: string;
    name: string;
    status: string;
    questions_and_answers: Array<{
        question: string;
        answer: string;
    }>;
    timezone: string;
    event: string;
    created_at: string;
    updated_at: string;
    tracking: {
        utm_campaign: string | null;
        utm_source: string | null;
        utm_medium: string | null;
        utm_content: string | null;
        utm_term: string | null;
        salesforce_uuid: string | null;
    };
    text_reminder_number: string | null;
    cancel_url: string;
    reschedule_url: string;
    first_name: string | null;
    last_name: string | null;
    rescheduled: boolean;
    old_invitee: string | null;
    new_invitee: string | null;
    no_show: boolean | null;
    payment: {
        external_id: string;
        provider: string;
        amount: number;
        currency: string;
        terms: string;
        successful: boolean;
    } | null;
}

export interface CalendlyWebhook {
    uri: string;
    callback_url: string;
    created_at: string;
    updated_at: string;
    retry_started_at: string | null;
    state: string;
    events: string[];
    scope: string;
    organization: string;
    user: string;
    creator: string;
}

export interface CalendlyWebhookEvent {
    created_at: string;
    created_by: string;
    payload: {
        cancel_url: string;
        created_at: string;
        email: string;
        event: string;
        first_name: string | null;
        last_name: string | null;
        name: string;
        new_invitee: string | null;
        no_show: boolean | null;
        old_invitee: string | null;
        payment: {
            external_id: string;
            provider: string;
            amount: number;
            currency: string;
            terms: string;
            successful: boolean;
        } | null;
        questions_and_answers: Array<{
            question: string;
            answer: string;
        }>;
        reconfirmation: any | null;
        reschedule_url: string;
        rescheduled: boolean;
        routing_form_submission: any | null;
        status: string;
        text_reminder_number: string | null;
        timezone: string;
        updated_at: string;
        uri: string;
    };
}

// Parameter interfaces for actions

export interface GetUserParams {
    token: string;
}

export interface ListEventsParams {
    token: string;
    organization?: boolean;
    count?: number;
    page_token?: string;
}

export interface GetEventParams {
    token: string;
    eventUuid: string;
}

export interface ListScheduledEventsParams {
    token: string;
    organization?: boolean;
    count?: number;
    page_token?: string;
    min_start_time?: string;
    max_start_time?: string;
    status?: 'active' | 'canceled';
}

export interface GetScheduledEventParams {
    token: string;
    scheduledEventUuid: string;
}

export interface ListInviteesParams {
    token: string;
    scheduledEventUuid: string;
    count?: number;
    page_token?: string;
    email?: string;
    status?: 'active' | 'canceled';
}

export interface GetInviteeParams {
    token: string;
    inviteeUuid: string;
}

export interface CancelInviteeParams {
    token: string;
    inviteeUuid: string;
    reason?: string;
}

export interface ListWebhooksParams {
    token: string;
    organization?: boolean;
    scope?: 'user' | 'organization';
    count?: number;
    page_token?: string;
}

export interface CreateWebhookParams {
    token: string;
    url: string;
    events: string[];
    scope: 'user' | 'organization';
    organization?: boolean;
}

export interface DeleteWebhookParams {
    token: string;
    webhookUuid: string;
}
