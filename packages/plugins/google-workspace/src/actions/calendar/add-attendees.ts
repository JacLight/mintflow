import { commonSchema, googleApiUrls, googleWorkspaceUtils } from '../../common.js';
import axios from 'axios';

export const addAttendees = {
    name: 'add_calendar_attendees',
    displayName: 'Add Attendees to Event',
    ...commonSchema,
    inputSchema: {
        type: 'object',
        properties: {
            auth: {
                type: 'object',
                properties: {
                    access_token: { type: 'string' }
                },
                required: ['access_token']
            },
            calendarId: {
                type: 'string',
                description: 'ID of the calendar containing the event'
            },
            eventId: {
                type: 'string',
                description: 'ID of the event to add attendees to'
            },
            attendees: {
                type: 'array',
                items: { type: 'string' },
                description: 'Email addresses of attendees to add'
            },
            sendNotifications: {
                type: 'string',
                enum: ['all', 'externalOnly', 'none'],
                description: 'Whether to send notifications to the added attendees'
            }
        },
        required: ['auth', 'calendarId', 'eventId', 'attendees']
    },
    outputSchema: {
        type: 'object',
        properties: {
            id: { type: 'string' },
            htmlLink: { type: 'string' },
            status: { type: 'string' },
            summary: { type: 'string' },
            attendees: { type: 'array' }
        }
    },
    exampleInput: {
        auth: {
            access_token: 'ya29.a0AfB_byC...'
        },
        calendarId: 'primary',
        eventId: '123456789',
        attendees: ['newattendee@example.com', 'anotherattendee@example.com'],
        sendNotifications: 'all'
    },
    exampleOutput: {
        id: '123456789',
        htmlLink: 'https://www.google.com/calendar/event?eid=123456789',
        status: 'confirmed',
        summary: 'Team Meeting',
        attendees: [
            { email: 'colleague1@example.com', responseStatus: 'accepted' },
            { email: 'colleague2@example.com', responseStatus: 'tentative' },
            { email: 'newattendee@example.com', responseStatus: 'needsAction' },
            { email: 'anotherattendee@example.com', responseStatus: 'needsAction' }
        ]
    },
    execute: async (input: any, context: any) => {
        try {
            const { 
                auth, 
                calendarId, 
                eventId,
                attendees,
                sendNotifications 
            } = input;

            if (!googleWorkspaceUtils.validateToken(auth.access_token)) {
                throw new Error('Invalid or missing access token');
            }

            if (!attendees || !Array.isArray(attendees) || attendees.length === 0) {
                throw new Error('At least one attendee email is required');
            }

            // First, get the current event to retrieve existing attendees
            const getResponse = await axios.get(
                `${googleApiUrls.calendar}/calendars/${calendarId}/events/${eventId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${auth.access_token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const eventData = getResponse.data;
            
            // Prepare the list of attendees (existing + new)
            const existingAttendees = eventData.attendees || [];
            const existingEmails = existingAttendees.map((a: { email: string }) => a.email.toLowerCase());
            
            // Add new attendees that don't already exist
            const newAttendees = attendees
                .filter((email: string) => !existingEmails.includes(email.toLowerCase()))
                .map((email: string) => ({ email }));
            
            const updatedAttendees = [...existingAttendees, ...newAttendees];
            
            // Update the event with the new attendees
            const updateResponse = await axios.patch(
                `${googleApiUrls.calendar}/calendars/${calendarId}/events/${eventId}?sendUpdates=${sendNotifications || 'none'}`,
                {
                    attendees: updatedAttendees
                },
                {
                    headers: {
                        'Authorization': `Bearer ${auth.access_token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return updateResponse.data;
        } catch (error: unknown) {
            return googleWorkspaceUtils.handleApiError(error);
        }
    }
};
