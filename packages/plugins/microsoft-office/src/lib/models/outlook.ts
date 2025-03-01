import { MicrosoftOfficeBaseParams } from './index.js';

// Outlook parameters
export interface OutlookListEventsParams extends MicrosoftOfficeBaseParams {
    startDateTime?: string;
    endDateTime?: string;
}

export interface OutlookGetEventParams extends MicrosoftOfficeBaseParams {
    eventId: string;
}

export interface OutlookCreateEventParams extends MicrosoftOfficeBaseParams {
    subject: string;
    body: string;
    start: string;
    end: string;
    location?: string;
    attendees?: string[];
    isAllDay?: boolean;
}

export interface OutlookUpdateEventParams extends MicrosoftOfficeBaseParams {
    eventId: string;
    subject?: string;
    body?: string;
    start?: string;
    end?: string;
    location?: string;
    attendees?: string[];
    isAllDay?: boolean;
}

export interface OutlookDeleteEventParams extends MicrosoftOfficeBaseParams {
    eventId: string;
}

// Outlook response types
export interface OutlookEvent {
    id: string;
    subject: string;
    bodyPreview: string;
    start: {
        dateTime: string;
        timeZone: string;
    };
    end: {
        dateTime: string;
        timeZone: string;
    };
    location: string;
    organizer: {
        name: string;
        address: string;
    };
    attendees: Array<{
        name: string;
        address: string;
    }>;
    isAllDay: boolean;
}
