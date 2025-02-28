import { commonSchema, googleApiUrls, googleWorkspaceUtils } from '../../common.js';
import axios from 'axios';

export const deleteEvent = {
    name: 'delete_calendar_event',
    displayName: 'Delete Calendar Event',
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
                description: 'ID of the event to delete'
            },
            sendNotifications: {
                type: 'string',
                enum: ['all', 'externalOnly', 'none'],
                description: 'Whether to send notifications about the deletion of the event'
            }
        },
        required: ['auth', 'calendarId', 'eventId']
    },
    outputSchema: {
        type: 'object',
        properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
        }
    },
    exampleInput: {
        auth: {
            access_token: 'ya29.a0AfB_byC...'
        },
        calendarId: 'primary',
        eventId: '123456789',
        sendNotifications: 'all'
    },
    exampleOutput: {
        success: true,
        message: 'Event deleted successfully'
    },
    execute: async (input: any, context: any) => {
        try {
            const { 
                auth, 
                calendarId, 
                eventId,
                sendNotifications 
            } = input;

            if (!googleWorkspaceUtils.validateToken(auth.access_token)) {
                throw new Error('Invalid or missing access token');
            }

            // Make API request
            try {
                await axios.delete(
                    `${googleApiUrls.calendar}/calendars/${calendarId}/events/${eventId}?sendUpdates=${sendNotifications || 'none'}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${auth.access_token}`
                        }
                    }
                );
            } catch (err) {
                if (axios.isAxiosError(err) && err.response) {
                    // For DELETE requests, the response might not contain JSON
                    if (err.response.status === 404) {
                        throw new Error(`Event not found: ${eventId}`);
                    } else {
                        throw new Error(`Failed to delete event: ${err.response.statusText}`);
                    }
                }
                throw err;
            }

            // DELETE requests typically return no content (204)
            return {
                success: true,
                message: 'Event deleted successfully'
            };
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to delete event';
            return {
                success: false,
                message: errorMessage,
                error: googleWorkspaceUtils.handleApiError(error)
            };
        }
    }
};
