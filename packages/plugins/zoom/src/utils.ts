import axios from 'axios';
import {
    ZoomMeeting,
    ZoomMeetingRegistrant,
    ZoomUser,
    ZoomCreateMeetingParams,
    ZoomGetMeetingParams,
    ZoomUpdateMeetingParams,
    ZoomDeleteMeetingParams,
    ZoomListMeetingsParams,
    ZoomCreateMeetingRegistrantParams,
    ZoomListMeetingRegistrantsParams,
    ZoomGetUserParams,
    ZoomListUsersParams
} from './models';

// Zoom API base URL
const API_BASE_URL = 'https://api.zoom.us/v2';

/**
 * Get the authorization header
 */
const getAuthHeader = (token: string): string => {
    return token.startsWith('Bearer') ? token : `Bearer ${token}`;
};

/**
 * Create a meeting in Zoom
 */
export const createMeeting = async (params: ZoomCreateMeetingParams): Promise<ZoomMeeting> => {
    try {
        const { token, ...meetingData } = params;

        const response = await axios.post(
            `${API_BASE_URL}/users/me/meetings`,
            meetingData,
            {
                headers: {
                    Authorization: getAuthHeader(token),
                    'Content-Type': 'application/json'
                }
            }
        );

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(`Zoom API error: ${error.response?.data?.message || error.message}`);
        }
        throw error;
    }
};

/**
 * Get meeting details from Zoom
 */
export const getMeeting = async (params: ZoomGetMeetingParams): Promise<ZoomMeeting> => {
    try {
        const { token, meetingId } = params;

        const response = await axios.get(
            `${API_BASE_URL}/meetings/${meetingId}`,
            {
                headers: {
                    Authorization: getAuthHeader(token)
                }
            }
        );

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(`Zoom API error: ${error.response?.data?.message || error.message}`);
        }
        throw error;
    }
};

/**
 * Update a meeting in Zoom
 */
export const updateMeeting = async (params: ZoomUpdateMeetingParams): Promise<ZoomMeeting> => {
    try {
        const { token, meetingId, ...meetingData } = params;

        const response = await axios.patch(
            `${API_BASE_URL}/meetings/${meetingId}`,
            meetingData,
            {
                headers: {
                    Authorization: getAuthHeader(token),
                    'Content-Type': 'application/json'
                }
            }
        );

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(`Zoom API error: ${error.response?.data?.message || error.message}`);
        }
        throw error;
    }
};

/**
 * Delete a meeting in Zoom
 */
export const deleteMeeting = async (params: ZoomDeleteMeetingParams): Promise<void> => {
    try {
        const { token, meetingId, occurrenceId, scheduleForReminder, cancelMeetingReminder } = params;

        const queryParams: Record<string, string> = {};

        if (occurrenceId) {
            queryParams.occurrence_id = occurrenceId;
        }

        if (scheduleForReminder !== undefined) {
            queryParams.schedule_for_reminder = scheduleForReminder.toString();
        }

        if (cancelMeetingReminder !== undefined) {
            queryParams.cancel_meeting_reminder = cancelMeetingReminder.toString();
        }

        await axios.delete(
            `${API_BASE_URL}/meetings/${meetingId}`,
            {
                headers: {
                    Authorization: getAuthHeader(token)
                },
                params: queryParams
            }
        );
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(`Zoom API error: ${error.response?.data?.message || error.message}`);
        }
        throw error;
    }
};

/**
 * List meetings from Zoom
 */
export const listMeetings = async (params: ZoomListMeetingsParams): Promise<{ meetings: ZoomMeeting[]; next_page_token?: string; page_count?: number; page_number?: number; page_size?: number; total_records?: number }> => {
    try {
        const { token, userId = 'me', type, pageSize, nextPageToken, pageNumber } = params;

        const queryParams: Record<string, string | number> = {};

        if (type) {
            queryParams.type = type;
        }

        if (pageSize) {
            queryParams.page_size = pageSize;
        }

        if (nextPageToken) {
            queryParams.next_page_token = nextPageToken;
        }

        if (pageNumber) {
            queryParams.page_number = pageNumber;
        }

        const response = await axios.get(
            `${API_BASE_URL}/users/${userId}/meetings`,
            {
                headers: {
                    Authorization: getAuthHeader(token)
                },
                params: queryParams
            }
        );

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(`Zoom API error: ${error.response?.data?.message || error.message}`);
        }
        throw error;
    }
};

/**
 * Create a meeting registrant in Zoom
 */
export const createMeetingRegistrant = async (params: ZoomCreateMeetingRegistrantParams): Promise<{ registrant_id: string; id: number; topic: string; start_time: string; join_url: string; participant_pin_code?: number }> => {
    try {
        const { token, meetingId, ...registrantData } = params;

        // Format custom questions if provided
        if (registrantData.custom_questions) {
            registrantData.custom_questions = registrantData.custom_questions.map(q => ({
                title: q.title,
                value: q.value
            }));
        }

        const response = await axios.post(
            `${API_BASE_URL}/meetings/${meetingId}/registrants`,
            registrantData,
            {
                headers: {
                    Authorization: getAuthHeader(token),
                    'Content-Type': 'application/json'
                }
            }
        );

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(`Zoom API error: ${error.response?.data?.message || error.message}`);
        }
        throw error;
    }
};

/**
 * List meeting registrants from Zoom
 */
export const listMeetingRegistrants = async (params: ZoomListMeetingRegistrantsParams): Promise<{ registrants: ZoomMeetingRegistrant[]; next_page_token?: string; page_count?: number; page_number?: number; page_size?: number; total_records?: number }> => {
    try {
        const { token, meetingId, status, pageSize, pageNumber, nextPageToken } = params;

        const queryParams: Record<string, string | number> = {};

        if (status) {
            queryParams.status = status;
        }

        if (pageSize) {
            queryParams.page_size = pageSize;
        }

        if (pageNumber) {
            queryParams.page_number = pageNumber;
        }

        if (nextPageToken) {
            queryParams.next_page_token = nextPageToken;
        }

        const response = await axios.get(
            `${API_BASE_URL}/meetings/${meetingId}/registrants`,
            {
                headers: {
                    Authorization: getAuthHeader(token)
                },
                params: queryParams
            }
        );

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(`Zoom API error: ${error.response?.data?.message || error.message}`);
        }
        throw error;
    }
};

/**
 * Get user details from Zoom
 */
export const getUser = async (params: ZoomGetUserParams): Promise<ZoomUser> => {
    try {
        const { token, userId = 'me' } = params;

        const response = await axios.get(
            `${API_BASE_URL}/users/${userId}`,
            {
                headers: {
                    Authorization: getAuthHeader(token)
                }
            }
        );

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(`Zoom API error: ${error.response?.data?.message || error.message}`);
        }
        throw error;
    }
};

/**
 * List users from Zoom
 */
export const listUsers = async (params: ZoomListUsersParams): Promise<{ users: ZoomUser[]; next_page_token?: string; page_count?: number; page_number?: number; page_size?: number; total_records?: number }> => {
    try {
        const { token, status, pageSize, pageNumber, nextPageToken } = params;

        const queryParams: Record<string, string | number> = {};

        if (status) {
            queryParams.status = status;
        }

        if (pageSize) {
            queryParams.page_size = pageSize;
        }

        if (pageNumber) {
            queryParams.page_number = pageNumber;
        }

        if (nextPageToken) {
            queryParams.next_page_token = nextPageToken;
        }

        const response = await axios.get(
            `${API_BASE_URL}/users`,
            {
                headers: {
                    Authorization: getAuthHeader(token)
                },
                params: queryParams
            }
        );

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(`Zoom API error: ${error.response?.data?.message || error.message}`);
        }
        throw error;
    }
};
