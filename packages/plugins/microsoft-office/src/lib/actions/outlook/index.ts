import { initGraphClient, handleGraphError } from '../../common/index.js';
import {
    OutlookListEventsParams,
    OutlookGetEventParams,
    OutlookCreateEventParams,
    OutlookUpdateEventParams,
    OutlookDeleteEventParams,
    OutlookEvent
} from '../../models/outlook.js';

/**
 * List calendar events
 */
export const listEvents = async (params: OutlookListEventsParams): Promise<OutlookEvent[]> => {
    try {
        const { token, startDateTime, endDateTime } = params;
        const client = initGraphClient(token);

        // Build query parameters
        let queryParams = '';
        if (startDateTime && endDateTime) {
            queryParams = `?startDateTime=${startDateTime}&endDateTime=${endDateTime}`;
        }

        // Get calendar events
        const response = await client.api(`/me/calendar/events${queryParams}`)
            .select('id,subject,bodyPreview,start,end,location,organizer,attendees,isAllDay')
            .get();

        return response.value.map((event: any) => ({
            id: event.id,
            subject: event.subject,
            bodyPreview: event.bodyPreview,
            start: event.start,
            end: event.end,
            location: event.location.displayName,
            organizer: event.organizer.emailAddress,
            attendees: event.attendees.map((attendee: any) => attendee.emailAddress),
            isAllDay: event.isAllDay
        }));
    } catch (error) {
        throw handleGraphError(error);
    }
};

/**
 * Get a calendar event by ID
 */
export const getEvent = async (params: OutlookGetEventParams): Promise<OutlookEvent> => {
    try {
        const { token, eventId } = params;
        const client = initGraphClient(token);

        // Get calendar event
        const event = await client.api(`/me/calendar/events/${eventId}`)
            .select('id,subject,bodyPreview,start,end,location,organizer,attendees,isAllDay')
            .get();

        return {
            id: event.id,
            subject: event.subject,
            bodyPreview: event.bodyPreview,
            start: event.start,
            end: event.end,
            location: event.location.displayName,
            organizer: event.organizer.emailAddress,
            attendees: event.attendees.map((attendee: any) => attendee.emailAddress),
            isAllDay: event.isAllDay
        };
    } catch (error) {
        throw handleGraphError(error);
    }
};

/**
 * Create a calendar event
 */
export const createEvent = async (params: OutlookCreateEventParams): Promise<OutlookEvent> => {
    try {
        const { token, subject, body, start, end, location, attendees, isAllDay } = params;
        const client = initGraphClient(token);

        // Create event object
        const eventData = {
            subject,
            body: {
                contentType: 'HTML',
                content: body
            },
            start: {
                dateTime: start,
                timeZone: 'UTC'
            },
            end: {
                dateTime: end,
                timeZone: 'UTC'
            },
            location: {
                displayName: location
            },
            attendees: attendees?.map(email => ({
                emailAddress: {
                    address: email
                },
                type: 'required'
            })) || [],
            isAllDay: isAllDay || false
        };

        // Create calendar event
        const event = await client.api('/me/calendar/events')
            .post(eventData);

        return {
            id: event.id,
            subject: event.subject,
            bodyPreview: event.bodyPreview,
            start: event.start,
            end: event.end,
            location: event.location.displayName,
            organizer: event.organizer.emailAddress,
            attendees: event.attendees.map((attendee: any) => attendee.emailAddress),
            isAllDay: event.isAllDay
        };
    } catch (error) {
        throw handleGraphError(error);
    }
};

/**
 * Update a calendar event
 */
export const updateEvent = async (params: OutlookUpdateEventParams): Promise<OutlookEvent> => {
    try {
        const { token, eventId, subject, body, start, end, location, attendees, isAllDay } = params;
        const client = initGraphClient(token);

        // Create update object with only the fields that are provided
        const updateData: any = {};

        if (subject) updateData.subject = subject;
        if (body) {
            updateData.body = {
                contentType: 'HTML',
                content: body
            };
        }
        if (start) {
            updateData.start = {
                dateTime: start,
                timeZone: 'UTC'
            };
        }
        if (end) {
            updateData.end = {
                dateTime: end,
                timeZone: 'UTC'
            };
        }
        if (location) {
            updateData.location = {
                displayName: location
            };
        }
        if (attendees) {
            updateData.attendees = attendees.map(email => ({
                emailAddress: {
                    address: email
                },
                type: 'required'
            }));
        }
        if (isAllDay !== undefined) {
            updateData.isAllDay = isAllDay;
        }

        // Update calendar event
        const event = await client.api(`/me/calendar/events/${eventId}`)
            .update(updateData);

        return {
            id: event.id,
            subject: event.subject,
            bodyPreview: event.bodyPreview,
            start: event.start,
            end: event.end,
            location: event.location.displayName,
            organizer: event.organizer.emailAddress,
            attendees: event.attendees.map((attendee: any) => attendee.emailAddress),
            isAllDay: event.isAllDay
        };
    } catch (error) {
        throw handleGraphError(error);
    }
};

/**
 * Delete a calendar event
 */
export const deleteEvent = async (params: OutlookDeleteEventParams): Promise<void> => {
    try {
        const { token, eventId } = params;
        const client = initGraphClient(token);

        // Delete calendar event
        await client.api(`/me/calendar/events/${eventId}`)
            .delete();
    } catch (error) {
        throw handleGraphError(error);
    }
};
