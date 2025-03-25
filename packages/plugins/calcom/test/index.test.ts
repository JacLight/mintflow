import calcom from '../src/index.js';
import { CalComClient } from '../src/utils/index.js';
import { customApiCall } from '../src/actions/custom-api-call.js';
import { getEventType } from '../src/actions/get-event-type.js';
import { getBooking } from '../src/actions/get-booking.js';
import { listEventTypes } from '../src/actions/list-event-types.js';
import { listBookings } from '../src/actions/list-bookings.js';

describe('Cal.com Plugin', () => {
  it('should define plugin properties', () => {
    expect(calcom).toBeDefined();
    expect(calcom.name).toEqual('calcom');
    expect(calcom.displayName).toEqual('Cal.com');
    expect(calcom.auth).toBeDefined();
    expect(calcom.actions).toBeDefined();
    expect(calcom.triggers).toBeDefined();
  });

  it('should define actions', () => {
    expect(calcom.actions).toContainEqual(customApiCall);
    expect(calcom.actions).toContainEqual(getEventType);
    expect(calcom.actions).toContainEqual(getBooking);
    expect(calcom.actions).toContainEqual(listEventTypes);
    expect(calcom.actions).toContainEqual(listBookings);
  });

  it('should define triggers', () => {
    expect(calcom.triggers.length).toEqual(3);
  });
});

describe('CalComClient', () => {
  let client: CalComClient;
  
  beforeEach(() => {
    client = new CalComClient({ apiKey: 'test-api-key' });
  });

  it('should be defined', () => {
    expect(client).toBeDefined();
  });

  // Add more tests for the client methods if needed
});

describe('Actions', () => {
  describe('customApiCall', () => {
    it('should be defined', () => {
      expect(customApiCall).toBeDefined();
      expect(customApiCall.name).toEqual('custom_api_call');
      expect(customApiCall.displayName).toEqual('Custom API Call');
      expect(customApiCall.props).toBeDefined();
      expect(customApiCall.run).toBeDefined();
    });
  });

  describe('getEventType', () => {
    it('should be defined', () => {
      expect(getEventType).toBeDefined();
      expect(getEventType.name).toEqual('get_event_type');
      expect(getEventType.displayName).toEqual('Get Event Type');
      expect(getEventType.props).toBeDefined();
      expect(getEventType.run).toBeDefined();
    });
  });

  describe('getBooking', () => {
    it('should be defined', () => {
      expect(getBooking).toBeDefined();
      expect(getBooking.name).toEqual('get_booking');
      expect(getBooking.displayName).toEqual('Get Booking');
      expect(getBooking.props).toBeDefined();
      expect(getBooking.run).toBeDefined();
    });
  });

  describe('listEventTypes', () => {
    it('should be defined', () => {
      expect(listEventTypes).toBeDefined();
      expect(listEventTypes.name).toEqual('list_event_types');
      expect(listEventTypes.displayName).toEqual('List Event Types');
      expect(listEventTypes.props).toBeDefined();
      expect(listEventTypes.run).toBeDefined();
    });
  });

  describe('listBookings', () => {
    it('should be defined', () => {
      expect(listBookings).toBeDefined();
      expect(listBookings.name).toEqual('list_bookings');
      expect(listBookings.displayName).toEqual('List Bookings');
      expect(listBookings.props).toBeDefined();
      expect(listBookings.run).toBeDefined();
    });
  });
});
