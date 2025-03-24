import { customApiCall } from './custom-api-call.js';
import { getEventType } from './get-event-type.js';
import { getBooking } from './get-booking.js';
import { listEventTypes } from './list-event-types.js';
import { listBookings } from './list-bookings.js';

export const actions = [
  customApiCall,
  getEventType,
  getBooking,
  listEventTypes,
  listBookings,
];
