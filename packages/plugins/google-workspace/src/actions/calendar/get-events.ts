import { commonSchema, googleApiUrls, googleWorkspaceUtils } from '../../common.js';
import axios from 'axios';

export const getEvents = {
    name: 'get_calendar_events',
    displayName: 'Get Calendar Events',
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
                description: 'ID of the calendar to get events from'
            },
            maxResults: {
                type: 'number',
                description: 'Maximum number of events to return'
            },
            timeMin: {
                type: 'string',
                description: 'Start time of the events to return (ISO format)'
            },
            timeMax: {
                type: 'string',
                description: 'End time of the events to return (ISO format)'
            },
            singleEvents: {
                type: 'boolean',
                description: 'Whether to expand recurring events into instances'
            },
            orderBy: {
                type: 'string',
                enum: ['startTime', 'updated'],
                description: 'Order of the events returned'
            },
            q: {
                type: 'string',
                description: 'Free text search terms to find events that match'
            }
        },
        required: ['auth', 'calendarId']
    },
    outputSchema: {
        type: 'object',
        properties: {
            items: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        status: { type: 'string' },
                        htmlLink: { type: 'string' },
                        summary: { type: 'string' },
                        description: { type: 'string' },
                        location: { type: 'string' },
                        start: { type: 'object' },
                        end: { type: 'object' },
                        attendees: { type: 'array' }
                    }
                }
            }
        }
    },
    exampleInput: {
        auth: {
            access_token: 'ya29.a0AfB_byC...'
        },
        calendarId: 'primary',
        maxResults: 10,
        timeMin: '2023-12-01T00:00:00Z',
        timeMax: '2023-12-31T23:59:59Z',
        singleEvents: true,
        orderBy: 'startTime'
    },
    exampleOutput: {
        items: [
            {
                id: '123456789',
                status: 'confirmed',
                htmlLink: 'https://www.google.com/calendar/event?eid=123456789',
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
                    { email: 'colleague1@example.com', responseStatus: 'accepted' },
                    { email: 'colleague2@example.com', responseStatus: 'tentative' }
                ]
            }
        ]
    },
    execute: async (input: any, context: any) => {
        try {
            const { 
                auth, 
                calendarId, 
                maxResults, 
                timeMin, 
                timeMax, 
                singleEvents, 
                orderBy,
                q
            } = input;

            if (!googleWorkspaceUtils.validateToken(auth.access_token)) {
                throw new Error('Invalid or missing access token');
            }

            // Build query parameters
            const queryParams = new URLSearchParams();
            
            if (maxResults) queryParams.append('maxResults', maxResults.toString());
            if (timeMin) queryParams.append('timeMin', googleWorkspaceUtils.formatDate(timeMin));
            if (timeMax) queryParams.append('timeMax', googleWorkspaceUtils.formatDate(timeMax));
            if (singleEvents !== undefined) queryParams.append('singleEvents', singleEvents.toString());
            if (orderBy) queryParams.append('orderBy', orderBy);
            if (q) queryParams.append('q', q);

            // Make API request
            const response = await axios.get(
                `${googleApiUrls.calendar}/calendars/${calendarId}/events?${queryParams.toString()}`,
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
