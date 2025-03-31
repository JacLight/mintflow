import {
    createMeeting,
    getMeeting,
    updateMeeting,
    deleteMeeting,
    listMeetings,
    createMeetingRegistrant,
    listMeetingRegistrants,
    getUser,
    listUsers
} from './utils.js';

const zoomPlugin = {
    name: "Zoom",
    icon: "",
    description: "Video conferencing, web conferencing, webinars, and screen sharing",
    groups: ["communication"],
    tags: ["communication","messaging","chat","notification","alert"],
    version: '1.0.0',
    id: "zoom",
    runner: "node",
    inputSchema: {
        type: "object",
        properties: {
            action: {
                type: 'string',
                enum: [
                    'create_meeting',
                    'get_meeting',
                    'update_meeting',
                    'delete_meeting',
                    'list_meetings',
                    'create_meeting_registrant',
                    'list_meeting_registrants',
                    'get_user',
                    'list_users'
                ],
                description: 'Action to perform on Zoom',
            },
            token: {
                type: 'string',
                description: 'Zoom API OAuth token',
            },
            // Meeting parameters
            topic: {
                type: 'string',
                description: 'Meeting topic',
                rules: [
                    { operation: 'notEqual', valueA: 'create_meeting', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'update_meeting', valueB: '{{action}}', action: 'hide' },
                ],
            },
            type: {
                type: 'number',
                enum: [1, 2, 3, 8],
                description: 'Meeting type (1: Instant, 2: Scheduled, 3: Recurring with no fixed time, 8: Recurring with fixed time)',
                rules: [
                    { operation: 'notEqual', valueA: 'create_meeting', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'update_meeting', valueB: '{{action}}', action: 'hide' },
                ],
            },
            start_time: {
                type: 'string',
                description: 'Meeting start time in format YYYY-MM-DDThh:mm:ss (e.g., 2023-01-01T10:00:00)',
                rules: [
                    { operation: 'notEqual', valueA: 'create_meeting', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'update_meeting', valueB: '{{action}}', action: 'hide' },
                ],
            },
            duration: {
                type: 'number',
                description: 'Meeting duration in minutes',
                rules: [
                    { operation: 'notEqual', valueA: 'create_meeting', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'update_meeting', valueB: '{{action}}', action: 'hide' },
                ],
            },
            timezone: {
                type: 'string',
                description: 'Meeting timezone (e.g., America/New_York)',
                rules: [
                    { operation: 'notEqual', valueA: 'create_meeting', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'update_meeting', valueB: '{{action}}', action: 'hide' },
                ],
            },
            password: {
                type: 'string',
                description: 'Meeting password',
                rules: [
                    { operation: 'notEqual', valueA: 'create_meeting', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'update_meeting', valueB: '{{action}}', action: 'hide' },
                ],
            },
            agenda: {
                type: 'string',
                description: 'Meeting agenda',
                rules: [
                    { operation: 'notEqual', valueA: 'create_meeting', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'update_meeting', valueB: '{{action}}', action: 'hide' },
                ],
            },
            settings: {
                type: 'object',
                description: 'Meeting settings',
                properties: {
                    host_video: { type: 'boolean', description: 'Start video when host joins' },
                    participant_video: { type: 'boolean', description: 'Start video when participants join' },
                    join_before_host: { type: 'boolean', description: 'Allow participants to join before host' },
                    mute_upon_entry: { type: 'boolean', description: 'Mute participants upon entry' },
                    watermark: { type: 'boolean', description: 'Add watermark when viewing shared screen' },
                    use_pmi: { type: 'boolean', description: 'Use Personal Meeting ID instead of auto-generated ID' },
                    approval_type: { type: 'number', description: 'Approval type (0: Automatically approve, 1: Manually approve, 2: No registration required)' },
                    registration_type: { type: 'number', description: 'Registration type (1: Attendees register once, 2: Attendees need to register for each occurrence, 3: Attendees register once and can choose one or more occurrences)' },
                    audio: { type: 'string', enum: ['both', 'telephony', 'voip'], description: 'Audio options' },
                    auto_recording: { type: 'string', enum: ['local', 'cloud', 'none'], description: 'Automatic recording option' },
                    waiting_room: { type: 'boolean', description: 'Enable waiting room' },
                },
                rules: [
                    { operation: 'notEqual', valueA: 'create_meeting', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'update_meeting', valueB: '{{action}}', action: 'hide' },
                ],
            },
            // Meeting ID parameter
            meetingId: {
                type: 'string',
                description: 'Meeting ID',
                rules: [
                    { operation: 'notEqual', valueA: 'get_meeting', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'update_meeting', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'delete_meeting', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'create_meeting_registrant', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'list_meeting_registrants', valueB: '{{action}}', action: 'hide' },
                ],
            },
            // Meeting deletion parameters
            occurrenceId: {
                type: 'string',
                description: 'Meeting occurrence ID for recurring meetings',
                rules: [
                    { operation: 'notEqual', valueA: 'delete_meeting', valueB: '{{action}}', action: 'hide' },
                ],
            },
            scheduleForReminder: {
                type: 'boolean',
                description: 'Send cancellation email to registrants',
                rules: [
                    { operation: 'notEqual', valueA: 'delete_meeting', valueB: '{{action}}', action: 'hide' },
                ],
            },
            cancelMeetingReminder: {
                type: 'boolean',
                description: 'Send cancellation email to host and alternative hosts',
                rules: [
                    { operation: 'notEqual', valueA: 'delete_meeting', valueB: '{{action}}', action: 'hide' },
                ],
            },
            // List meetings parameters
            userId: {
                type: 'string',
                description: 'User ID or email address (default: me)',
                rules: [
                    { operation: 'notEqual', valueA: 'list_meetings', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'get_user', valueB: '{{action}}', action: 'hide' },
                ],
            },
            meetingType: {
                type: 'string',
                enum: ['scheduled', 'live', 'upcoming', 'upcoming_meetings', 'previous_meetings', 'pmi'],
                description: 'Meeting type for listing',
                rules: [
                    { operation: 'notEqual', valueA: 'list_meetings', valueB: '{{action}}', action: 'hide' },
                ],
            },
            // Registrant parameters
            email: {
                type: 'string',
                description: 'Registrant email address',
                rules: [
                    { operation: 'notEqual', valueA: 'create_meeting_registrant', valueB: '{{action}}', action: 'hide' },
                ],
            },
            first_name: {
                type: 'string',
                description: 'Registrant first name',
                rules: [
                    { operation: 'notEqual', valueA: 'create_meeting_registrant', valueB: '{{action}}', action: 'hide' },
                ],
            },
            last_name: {
                type: 'string',
                description: 'Registrant last name',
                rules: [
                    { operation: 'notEqual', valueA: 'create_meeting_registrant', valueB: '{{action}}', action: 'hide' },
                ],
            },
            address: {
                type: 'string',
                description: 'Registrant address',
                rules: [
                    { operation: 'notEqual', valueA: 'create_meeting_registrant', valueB: '{{action}}', action: 'hide' },
                ],
            },
            city: {
                type: 'string',
                description: 'Registrant city',
                rules: [
                    { operation: 'notEqual', valueA: 'create_meeting_registrant', valueB: '{{action}}', action: 'hide' },
                ],
            },
            state: {
                type: 'string',
                description: 'Registrant state/province',
                rules: [
                    { operation: 'notEqual', valueA: 'create_meeting_registrant', valueB: '{{action}}', action: 'hide' },
                ],
            },
            zip: {
                type: 'string',
                description: 'Registrant ZIP/postal code',
                rules: [
                    { operation: 'notEqual', valueA: 'create_meeting_registrant', valueB: '{{action}}', action: 'hide' },
                ],
            },
            country: {
                type: 'string',
                description: 'Registrant country code',
                rules: [
                    { operation: 'notEqual', valueA: 'create_meeting_registrant', valueB: '{{action}}', action: 'hide' },
                ],
            },
            phone: {
                type: 'string',
                description: 'Registrant phone number',
                rules: [
                    { operation: 'notEqual', valueA: 'create_meeting_registrant', valueB: '{{action}}', action: 'hide' },
                ],
            },
            industry: {
                type: 'string',
                description: 'Registrant industry',
                rules: [
                    { operation: 'notEqual', valueA: 'create_meeting_registrant', valueB: '{{action}}', action: 'hide' },
                ],
            },
            org: {
                type: 'string',
                description: 'Registrant organization',
                rules: [
                    { operation: 'notEqual', valueA: 'create_meeting_registrant', valueB: '{{action}}', action: 'hide' },
                ],
            },
            job_title: {
                type: 'string',
                description: 'Registrant job title',
                rules: [
                    { operation: 'notEqual', valueA: 'create_meeting_registrant', valueB: '{{action}}', action: 'hide' },
                ],
            },
            comments: {
                type: 'string',
                description: 'Registrant comments',
                rules: [
                    { operation: 'notEqual', valueA: 'create_meeting_registrant', valueB: '{{action}}', action: 'hide' },
                ],
            },
            custom_questions: {
                type: 'object',
                description: 'Custom questions for registrant',
                rules: [
                    { operation: 'notEqual', valueA: 'create_meeting_registrant', valueB: '{{action}}', action: 'hide' },
                ],
            },
            // Pagination parameters
            pageSize: {
                type: 'number',
                description: 'Number of records to return',
                rules: [
                    { operation: 'notEqual', valueA: 'list_meetings', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'list_meeting_registrants', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'list_users', valueB: '{{action}}', action: 'hide' },
                ],
            },
            pageNumber: {
                type: 'number',
                description: 'Page number for pagination',
                rules: [
                    { operation: 'notEqual', valueA: 'list_meetings', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'list_meeting_registrants', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'list_users', valueB: '{{action}}', action: 'hide' },
                ],
            },
            nextPageToken: {
                type: 'string',
                description: 'Next page token for pagination',
                rules: [
                    { operation: 'notEqual', valueA: 'list_meetings', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'list_meeting_registrants', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'list_users', valueB: '{{action}}', action: 'hide' },
                ],
            },
            // List registrants parameters
            status: {
                type: 'string',
                enum: ['pending', 'approved', 'denied'],
                description: 'Registrant status',
                rules: [
                    { operation: 'notEqual', valueA: 'list_meeting_registrants', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'list_users', valueB: '{{action}}', action: 'hide' },
                ],
            },
        },
        required: ['action', 'token'],
    },
    outputSchema: {
        type: "object",
    },
    exampleInput: {
        action: 'create_meeting',
        token: 'your-zoom-api-token',
        topic: 'Weekly Team Meeting',
        type: 2,
        start_time: '2023-01-01T10:00:00',
        duration: 60,
        timezone: 'America/New_York',
        settings: {
            host_video: true,
            participant_video: true,
            join_before_host: false,
            mute_upon_entry: true,
            auto_recording: 'none'
        }
    },
    exampleOutput: {
        id: 123456789,
        topic: 'Weekly Team Meeting',
        type: 2,
        start_time: '2023-01-01T10:00:00Z',
        duration: 60,
        timezone: 'America/New_York',
        join_url: 'https://zoom.us/j/123456789',
        settings: {
            host_video: true,
            participant_video: true,
            join_before_host: false,
            mute_upon_entry: true,
            auto_recording: 'none'
        }
    },
    documentation: "https://marketplace.zoom.us/docs/api-reference/zoom-api/",
    method: "exec",
    actions: [
        {
            name: 'zoom',
            execute: async (input: any): Promise<any> => {
                const { action, token } = input;

                if (!action || !token) {
                    throw new Error('Missing required parameters: action, token');
                }

                switch (action) {
                    case 'create_meeting': {
                        const { topic, type, start_time, duration, timezone, password, agenda, settings } = input;

                        if (!topic) {
                            throw new Error('Missing required parameter: topic');
                        }

                        return await createMeeting({
                            token,
                            topic,
                            type,
                            start_time,
                            duration,
                            timezone,
                            password,
                            agenda,
                            settings
                        });
                    }

                    case 'get_meeting': {
                        const { meetingId } = input;

                        if (!meetingId) {
                            throw new Error('Missing required parameter: meetingId');
                        }

                        return await getMeeting({
                            token,
                            meetingId
                        });
                    }

                    case 'update_meeting': {
                        const { meetingId, topic, type, start_time, duration, timezone, password, agenda, settings } = input;

                        if (!meetingId) {
                            throw new Error('Missing required parameter: meetingId');
                        }

                        return await updateMeeting({
                            token,
                            meetingId,
                            topic,
                            type,
                            start_time,
                            duration,
                            timezone,
                            password,
                            agenda,
                            settings
                        });
                    }

                    case 'delete_meeting': {
                        const { meetingId, occurrenceId, scheduleForReminder, cancelMeetingReminder } = input;

                        if (!meetingId) {
                            throw new Error('Missing required parameter: meetingId');
                        }

                        await deleteMeeting({
                            token,
                            meetingId,
                            occurrenceId,
                            scheduleForReminder,
                            cancelMeetingReminder
                        });

                        return { success: true, message: 'Meeting deleted successfully' };
                    }

                    case 'list_meetings': {
                        const { userId, meetingType, pageSize, pageNumber, nextPageToken } = input;

                        return await listMeetings({
                            token,
                            userId,
                            type: meetingType,
                            pageSize,
                            pageNumber,
                            nextPageToken
                        });
                    }

                    case 'create_meeting_registrant': {
                        const {
                            meetingId, email, first_name, last_name, address, city, state, zip,
                            country, phone, industry, org, job_title, comments, custom_questions
                        } = input;

                        if (!meetingId || !email || !first_name) {
                            throw new Error('Missing required parameters: meetingId, email, first_name');
                        }

                        return await createMeetingRegistrant({
                            token,
                            meetingId,
                            email,
                            first_name,
                            last_name,
                            address,
                            city,
                            state,
                            zip,
                            country,
                            phone,
                            industry,
                            org,
                            job_title,
                            comments,
                            custom_questions: custom_questions ? Object.entries(custom_questions).map(([title, value]) => ({ title, value: String(value) })) : undefined
                        });
                    }

                    case 'list_meeting_registrants': {
                        const { meetingId, status, pageSize, pageNumber, nextPageToken } = input;

                        if (!meetingId) {
                            throw new Error('Missing required parameter: meetingId');
                        }

                        return await listMeetingRegistrants({
                            token,
                            meetingId,
                            status,
                            pageSize,
                            pageNumber,
                            nextPageToken
                        });
                    }

                    case 'get_user': {
                        const { userId } = input;

                        return await getUser({
                            token,
                            userId
                        });
                    }

                    case 'list_users': {
                        const { status, pageSize, pageNumber, nextPageToken } = input;

                        return await listUsers({
                            token,
                            status,
                            pageSize,
                            pageNumber,
                            nextPageToken
                        });
                    }

                    default:
                        throw new Error(`Unsupported action: ${action}`);
                }
            }
        }
    ]
};

export default zoomPlugin;
