import axios from 'axios';
import {
    GetUserParams,
    ListEventsParams,
    GetEventParams,
    ListScheduledEventsParams,
    GetScheduledEventParams,
    ListInviteesParams,
    GetInviteeParams,
    CancelInviteeParams,
    ListWebhooksParams,
    CreateWebhookParams,
    DeleteWebhookParams,
    CalendlyUser,
    CalendlyEvent,
    CalendlyScheduledEvent,
    CalendlyInvitee,
    CalendlyWebhook
} from './models.js';

const BASE_URL = 'https://api.calendly.com';

/**
 * Extract UUID from a Calendly URI
 */
export const extractUuidFromUri = (uri: string): string => {
    return uri.split('/').pop() || '';
};

/**
 * Get the current user
 */
export const getUser = async (params: GetUserParams): Promise<CalendlyUser> => {
    const { token } = params;

    const response = await axios({
        method: 'GET',
        url: `${BASE_URL}/users/me`,
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    return response.data.resource;
};

/**
 * List event types
 */
export const listEvents = async (params: ListEventsParams): Promise<{ collection: CalendlyEvent[], pagination: any }> => {
    const { token, organization = false, count, page_token } = params;

    // First, get the user to determine the URI
    const user = await getUser({ token });

    const queryParams: Record<string, string> = {};

    if (count) {
        queryParams.count = String(count);
    }

    if (page_token) {
        queryParams.page_token = page_token;
    }

    // Determine the user or organization URI
    const uri = organization ? user.current_organization : user.uri;

    const response = await axios({
        method: 'GET',
        url: `${BASE_URL}/event_types`,
        params: {
            ...queryParams,
            user: uri
        },
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    return {
        collection: response.data.collection,
        pagination: response.data.pagination
    };
};

/**
 * Get a specific event type
 */
export const getEvent = async (params: GetEventParams): Promise<CalendlyEvent> => {
    const { token, eventUuid } = params;

    const response = await axios({
        method: 'GET',
        url: `${BASE_URL}/event_types/${eventUuid}`,
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    return response.data.resource;
};

/**
 * List scheduled events
 */
export const listScheduledEvents = async (params: ListScheduledEventsParams): Promise<{ collection: CalendlyScheduledEvent[], pagination: any }> => {
    const { token, organization = false, count, page_token, min_start_time, max_start_time, status } = params;

    // First, get the user to determine the URI
    const user = await getUser({ token });

    const queryParams: Record<string, string> = {};

    if (count) {
        queryParams.count = String(count);
    }

    if (page_token) {
        queryParams.page_token = page_token;
    }

    if (min_start_time) {
        queryParams.min_start_time = min_start_time;
    }

    if (max_start_time) {
        queryParams.max_start_time = max_start_time;
    }

    if (status) {
        queryParams.status = status;
    }

    // Determine the user or organization URI
    const uri = organization ? user.current_organization : user.uri;

    const response = await axios({
        method: 'GET',
        url: `${BASE_URL}/scheduled_events`,
        params: {
            ...queryParams,
            user: uri
        },
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    return {
        collection: response.data.collection,
        pagination: response.data.pagination
    };
};

/**
 * Get a specific scheduled event
 */
export const getScheduledEvent = async (params: GetScheduledEventParams): Promise<CalendlyScheduledEvent> => {
    const { token, scheduledEventUuid } = params;

    const response = await axios({
        method: 'GET',
        url: `${BASE_URL}/scheduled_events/${scheduledEventUuid}`,
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    return response.data.resource;
};

/**
 * List invitees for a scheduled event
 */
export const listInvitees = async (params: ListInviteesParams): Promise<{ collection: CalendlyInvitee[], pagination: any }> => {
    const { token, scheduledEventUuid, count, page_token, email, status } = params;

    const queryParams: Record<string, string> = {};

    if (count) {
        queryParams.count = String(count);
    }

    if (page_token) {
        queryParams.page_token = page_token;
    }

    if (email) {
        queryParams.email = email;
    }

    if (status) {
        queryParams.status = status;
    }

    const response = await axios({
        method: 'GET',
        url: `${BASE_URL}/scheduled_events/${scheduledEventUuid}/invitees`,
        params: queryParams,
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    return {
        collection: response.data.collection,
        pagination: response.data.pagination
    };
};

/**
 * Get a specific invitee
 */
export const getInvitee = async (params: GetInviteeParams): Promise<CalendlyInvitee> => {
    const { token, inviteeUuid } = params;

    const response = await axios({
        method: 'GET',
        url: `${BASE_URL}/invitees/${inviteeUuid}`,
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    return response.data.resource;
};

/**
 * Cancel an invitee
 */
export const cancelInvitee = async (params: CancelInviteeParams): Promise<void> => {
    const { token, inviteeUuid, reason } = params;

    await axios({
        method: 'POST',
        url: `${BASE_URL}/invitees/${inviteeUuid}/cancellation`,
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        data: reason ? { reason } : {}
    });
};

/**
 * List webhooks
 */
export const listWebhooks = async (params: ListWebhooksParams): Promise<{ collection: CalendlyWebhook[], pagination: any }> => {
    const { token, organization = false, scope, count, page_token } = params;

    // First, get the user to determine the URI
    const user = await getUser({ token });

    const queryParams: Record<string, string> = {};

    if (count) {
        queryParams.count = String(count);
    }

    if (page_token) {
        queryParams.page_token = page_token;
    }

    if (scope) {
        queryParams.scope = scope;
    }

    // Determine the user or organization URI
    const uri = organization ? user.current_organization : user.uri;

    const response = await axios({
        method: 'GET',
        url: `${BASE_URL}/webhook_subscriptions`,
        params: {
            ...queryParams,
            organization: organization ? uri : undefined,
            user: !organization ? uri : undefined
        },
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    return {
        collection: response.data.collection,
        pagination: response.data.pagination
    };
};

/**
 * Create a webhook
 */
export const createWebhook = async (params: CreateWebhookParams): Promise<CalendlyWebhook> => {
    const { token, url, events, scope, organization = false } = params;

    // First, get the user to determine the URI
    const user = await getUser({ token });

    // Determine the user or organization URI
    const uri = organization ? user.current_organization : user.uri;

    const response = await axios({
        method: 'POST',
        url: `${BASE_URL}/webhook_subscriptions`,
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        data: {
            url,
            events,
            scope,
            organization: organization ? uri : undefined,
            user: !organization ? uri : undefined
        }
    });

    return response.data.resource;
};

/**
 * Delete a webhook
 */
export const deleteWebhook = async (params: DeleteWebhookParams): Promise<void> => {
    const { token, webhookUuid } = params;

    await axios({
        method: 'DELETE',
        url: `${BASE_URL}/webhook_subscriptions/${webhookUuid}`,
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
};
