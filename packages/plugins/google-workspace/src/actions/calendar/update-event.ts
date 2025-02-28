import { commonSchema, googleApiUrls, googleWorkspaceUtils } from '../../common.js';
import axios from 'axios';

export const updateEvent = {
    name: 'update_calendar_event',
    displayName: 'Update Calendar Event',
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
                description: 'ID of the event to update'
            },
            summary: {
                type: 'string',
                description: 'New title of the event'
            },
            description: {
                type: 'string',
                description: 'New description of the event'
            },
            location: {
                type: 'string',
                description: 'New location of the event'
            },
            startDateTime: {
                type: 'string',
                description: 'New start date and time of the event (ISO format)'
            },
            endDateTime: {
                type: 'string',
                description: 'New end date and time of the event (ISO format)'
            },
            colorId: {
                type: 'string',
                description: 'New color ID for the event'
            },
            attendees: {
                type: 'array',
                items: { type: 'string' },
                description: 'New email addresses of attendees'
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
                description: 'Whether to send notifications about the update of the event'
            }
        },
        required: ['auth', 'calendarId', 'eventId']
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
        eventId: '123456789',
        summary: 'Updated Team Meeting',
        description: 'Weekly team sync-up (updated)',
        location: 'Conference Room B',
        startDateTime: '2023-12-01T11:00:00Z',
        endDateTime: '2023-12-01T12:00:00Z',
        attendees: ['colleague1@example.com', 'colleague2@example.com', 'colleague3@example.com'],
        sendNotifications: 'all'
    },
    exampleOutput: {
        id: '123456789',
        htmlLink: 'https://www.google.com/calendar/event?eid=123456789',
        status: 'confirmed',
        summary: 'Updated Team Meeting',
        description: 'Weekly team sync-up (updated)',
        location: 'Conference Room B',
        start: {
            dateTime: '2023-12-01T11:00:00Z'
        },
        end: {
            dateTime: '2023-12-01T12:00:00Z'
        },
        attendees: [
            { email: 'colleague1@example.com', responseStatus: 'accepted' },
            { email: 'colleague2@example.com', responseStatus: 'tentative' },
            { email: 'colleague3@example.com', responseStatus: 'needsAction' }
        ]
    },
    execute: async (input: any, context: any) => {
        try {
            const { 
                auth, 
                calendarId, 
                eventId,
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

            // Prepare event data (only include fields that are provided)
            const eventData: Record<string, any> = {};
            
            if (summary !== undefined) eventData.summary = summary;
            if (description !== undefined) eventData.description = description;
            if (location !== undefined) eventData.location = location;
            if (colorId !== undefined) eventData.colorId = colorId;
            
            if (startDateTime !== undefined) {
                eventData.start = {
                    dateTime: googleWorkspaceUtils.formatDate(startDateTime)
                };
            }
            
            if (endDateTime !== undefined) {
                eventData.end = {
                    dateTime: googleWorkspaceUtils.formatDate(endDateTime)
                };
            }
            
            if (attendees !== undefined) {
                eventData.attendees = attendees.map((email: string) => ({ email }));
            }
            
            if (guestsCanModify !== undefined) eventData.guestsCanModify = guestsCanModify;
            if (guestsCanInviteOthers !== undefined) eventData.guestsCanInviteOthers = guestsCanInviteOthers;
            if (guestsCanSeeOtherGuests !== undefined) eventData.guestsCanSeeOtherGuests = guestsCanSeeOtherGuests;

            // Make API request
            const response = await axios.patch(
                `${googleApiUrls.calendar}/calendars/${calendarId}/events/${eventId}?sendUpdates=${sendNotifications || 'none'}`,
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
