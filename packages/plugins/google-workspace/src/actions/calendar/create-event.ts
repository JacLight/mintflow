import { commonSchema, googleApiUrls, googleWorkspaceUtils } from '../../common.js';
import axios from 'axios';

export const createEvent = {
    name: 'create_calendar_event',
    displayName: 'Create Calendar Event',
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
                description: 'ID of the calendar to create the event in'
            },
            summary: {
                type: 'string',
                description: 'Title of the event'
            },
            description: {
                type: 'string',
                description: 'Description of the event'
            },
            location: {
                type: 'string',
                description: 'Location of the event'
            },
            startDateTime: {
                type: 'string',
                description: 'Start date and time of the event (ISO format)'
            },
            endDateTime: {
                type: 'string',
                description: 'End date and time of the event (ISO format)'
            },
            colorId: {
                type: 'string',
                description: 'Color ID for the event'
            },
            attendees: {
                type: 'array',
                items: { type: 'string' },
                description: 'Email addresses of attendees'
            },
            guestsCanModify: {
                type: 'boolean',
                description: 'Whether guests can modify the event'
            },
            guestsCanInviteOthers: {
                type: 'boolean',
                description: 'Whether guests can invite others'
            },
            guestsCanSeeOtherGuests: {
                type: 'boolean',
                description: 'Whether guests can see other guests'
            },
            sendNotifications: {
                type: 'string',
                enum: ['all', 'externalOnly', 'none'],
                description: 'Whether to send notifications about the creation of the event'
            }
        },
        required: ['auth', 'calendarId', 'summary', 'startDateTime', 'endDateTime']
    },
    outputSchema: {
        type: 'object',
        properties: {
            id: { type: 'string' },
            htmlLink: { type: 'string' },
            status: { type: 'string' },
            summary: { type: 'string' },
            description: { type: 'string' },
            location: { type: 'string' },
            start: { type: 'object' },
            end: { type: 'object' },
            attendees: { type: 'array' }
        }
    },
    exampleInput: {
        auth: {
            access_token: 'ya29.a0AfB_byC...'
        },
        calendarId: 'primary',
        summary: 'Team Meeting',
        description: 'Weekly team sync-up',
        location: 'Conference Room A',
        startDateTime: '2023-12-01T10:00:00Z',
        endDateTime: '2023-12-01T11:00:00Z',
        attendees: ['colleague1@example.com', 'colleague2@example.com'],
        sendNotifications: 'all'
    },
    exampleOutput: {
        id: '123456789',
        htmlLink: 'https://www.google.com/calendar/event?eid=123456789',
        status: 'confirmed',
        summary: 'Team Meeting',
        description: 'Weekly team sync-up',
        location: 'Conference Room A',
        start: {
            dateTime: '2023-12-01T10:00:00Z'
        },
        end: {
            dateTime: '2023-12-01T11:00:00Z'
        },
        attendees: [
            { email: 'colleague1@example.com', responseStatus: 'needsAction' },
            { email: 'colleague2@example.com', responseStatus: 'needsAction' }
        ]
    },
    execute: async (input: any, context: any) => {
        try {
            const { 
                auth, 
                calendarId, 
                summary, 
                description, 
                location, 
                startDateTime, 
                endDateTime, 
                colorId, 
                attendees, 
                guestsCanModify, 
                guestsCanInviteOthers, 
                guestsCanSeeOtherGuests, 
                sendNotifications 
            } = input;

            if (!googleWorkspaceUtils.validateToken(auth.access_token)) {
                throw new Error('Invalid or missing access token');
            }

            // Format attendees
            const attendeesArray = attendees ? attendees.map((email: string) => ({ email })) : [];

            // Prepare event data
            const eventData = {
                summary,
                description: description || '',
                location: location || '',
                colorId,
                start: {
                    dateTime: googleWorkspaceUtils.formatDate(startDateTime)
                },
                end: {
                    dateTime: googleWorkspaceUtils.formatDate(endDateTime)
                },
                attendees: attendeesArray,
                guestsCanModify,
                guestsCanInviteOthers,
                guestsCanSeeOtherGuests
            };

            // Make API request
            const response = await axios.post(
                `${googleApiUrls.calendar}/calendars/${calendarId}/events?sendUpdates=${sendNotifications || 'none'}`,
                eventData,
                {
                    headers: {
                        'Authorization': `Bearer ${auth.access_token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const data = response.data;
            return data;
        } catch (error) {
            return googleWorkspaceUtils.handleApiError(error);
        }
    }
};
