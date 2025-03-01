import { EventTrigger } from '../common.js';
import { registerWebhooks } from './register-webhook.js';

export const triggers = [
  {
    type: EventTrigger.BOOKING_CANCELLED,
    displayName: 'Booking Cancelled',
    sampleData: {
      triggerEvent: 'BOOKING_CANCELLED',
      createdAt: '2023-02-18T12:11:37.975Z',
      payload: {
        title: '30 Min Meeting between John Smith and Jane Doe',
        type: '30 Min Meeting',
        description: 'Discuss project details',
        customInputs: {},
        startTime: '2023-02-21T11:00:00+00:00',
        endTime: '2023-02-21T11:30:00+00:00',
        organizer: {
          email: 'john@example.com',
          name: 'John Smith',
          timeZone: 'America/New_York',
          language: {
            locale: 'en',
          },
        },
        attendees: [
          {
            name: 'Jane Doe',
            email: 'jane@example.com',
            timeZone: 'America/Chicago',
            language: {
              locale: 'en',
            },
          },
        ],
        uid: '88wXJjC8AHAbepGYM2bwp4',
        location: 'integrations:daily',
        destinationCalendar: null,
        cancellationReason: 'Cancellation note',
        eventTitle: '30 Min Meeting',
        eventDescription: null,
        requiresConfirmation: null,
        price: null,
        currency: 'usd',
        length: 30,
        status: 'CANCELLED',
      },
    },
  },
  {
    type: EventTrigger.BOOKING_CREATED,
    displayName: 'Booking Created',
    sampleData: {
      triggerEvent: 'BOOKING_CREATED',
      createdAt: '2023-02-18T11:54:18.440Z',
      payload: {
        type: '15 Min Meeting',
        title: '15 Min Meeting between John Smith and Jane Doe',
        description: '',
        additionalNotes: '',
        customInputs: {},
        startTime: '2023-02-20T08:00:00Z',
        endTime: '2023-02-20T08:15:00Z',
        organizer: {
          id: 12345,
          name: 'John Smith',
          email: 'john@example.com',
          timeZone: 'America/New_York',
          language: {
            locale: 'en',
          },
        },
        attendees: [
          {
            email: 'jane@example.com',
            name: 'Jane Doe',
            timeZone: 'America/Chicago',
            language: {
              locale: 'en',
            },
          },
        ],
        location: 'integrations:daily',
        destinationCalendar: null,
        hideCalendarNotes: false,
        requiresConfirmation: null,
        eventTypeId: 12345,
        seatsShowAttendees: false,
        seatsPerTimeSlot: null,
        uid: 'pssX2hWwDbuKHmdGQ9BuBz',
        conferenceData: {
          createRequest: {
            requestId: '2db644eb-37a5-581a-99fa-ebe6ce513834',
          },
        },
        videoCallData: {
          type: 'daily_video',
          id: 'GrhVEmlnsyhAGw3UWKjW',
          password: 'password',
          url: 'https://meetco.daily.co/GrhVEmlnsyhAGw3UWKjW',
        },
        appsStatus: [
          {
            appName: 'Cal Video',
            type: 'daily_video',
            success: 1,
            failures: 0,
            errors: [],
          },
        ],
        eventTitle: '15 Min Meeting',
        eventDescription: null,
        price: 0,
        currency: 'usd',
        length: 15,
        bookingId: 12345,
        metadata: {
          videoCallUrl: 'https://meetco.daily.co/GrhVEmlnsyhAGw3UWKjW',
        },
        status: 'ACCEPTED',
      },
    },
  },
  {
    type: EventTrigger.BOOKING_RESCHEDULED,
    displayName: 'Booking Rescheduled',
    sampleData: {
      triggerEvent: 'BOOKING_RESCHEDULED',
      createdAt: '2023-02-18T12:11:26.909Z',
      payload: {
        type: '30 Min Meeting',
        title: '30 Min Meeting between John Smith and Jane Doe',
        description: 'Discuss project details',
        additionalNotes: 'Discuss project details',
        customInputs: {},
        startTime: '2023-02-21T11:00:00Z',
        endTime: '2023-02-21T11:30:00Z',
        organizer: {
          id: 12345,
          name: 'John Smith',
          email: 'john@example.com',
          timeZone: 'America/New_York',
          language: {
            locale: 'en',
          },
        },
        attendees: [
          {
            email: 'jane@example.com',
            name: 'Jane Doe',
            timeZone: 'America/Chicago',
            language: {
              locale: 'en',
            },
          },
        ],
        location: 'https://meetco.daily.co/9tJRDCRw9ESmb64SuEwU',
        destinationCalendar: null,
        hideCalendarNotes: false,
        requiresConfirmation: null,
        eventTypeId: 12345,
        seatsShowAttendees: false,
        seatsPerTimeSlot: null,
        uid: '88wXJjC8AHAbepGYM2bwp4',
        conferenceData: {
          createRequest: {
            requestId: '2db644eb-37a5-581a-99fa-ebe6ce513834',
          },
        },
        videoCallData: {
          type: 'daily_video',
          id: '9tJRDCRw9ESmb64SuEwU',
          password: 'password',
          url: 'https://meetco.daily.co/9tJRDCRw9ESmb64SuEwU',
        },
        eventTitle: '30 Min Meeting',
        eventDescription: null,
        price: 0,
        currency: 'usd',
        length: 30,
        bookingId: 12345,
        rescheduleUid: '3qTJ7WiwdMR3RJmDW2KGhr',
        rescheduleStartTime: '2023-02-20T08:30:00Z',
        rescheduleEndTime: '2023-02-20T09:00:00Z',
        metadata: {},
        status: 'ACCEPTED',
      },
    },
  },
].map((eventTrigger) =>
  registerWebhooks({
    name: eventTrigger.type,
    displayName: eventTrigger.displayName,
    sampleData: eventTrigger.sampleData,
    description: `Create a webhook to monitor when ${eventTrigger.displayName.toLowerCase()}`,
  })
);
