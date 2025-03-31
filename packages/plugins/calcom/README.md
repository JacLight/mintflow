# Cal.com Plugin for MintFlow

This plugin integrates Cal.com, an open-source scheduling infrastructure, with MintFlow.

## Features

- **Webhook Triggers**:
  - Booking Created - Triggered when a new booking is created
  - Booking Rescheduled - Triggered when a booking is rescheduled
  - Booking Cancelled - Triggered when a booking is cancelled

- **Actions**:
  - Get Event Type - Retrieve details of a specific event type
  - Get Booking - Retrieve details of a specific booking
  - List Event Types - Retrieve a list of all event types
  - List Bookings - Retrieve a list of bookings with optional filtering
  - Custom API Call - Make custom API calls to Cal.com

## Authentication

This plugin requires a Cal.com API key for authentication. You can obtain an API key from your Cal.com account settings.

## Usage

### Triggers

#### Booking Created

This trigger is activated when a new booking is created in Cal.com.

```yaml
triggers:
  - plugin: calcom
    trigger: BOOKING_CREATED
```

#### Booking Rescheduled

This trigger is activated when a booking is rescheduled in Cal.com.

```yaml
triggers:
  - plugin: calcom
    trigger: BOOKING_RESCHEDULED
```

#### Booking Cancelled

This trigger is activated when a booking is cancelled in Cal.com.

```yaml
triggers:
  - plugin: calcom
    trigger: BOOKING_CANCELLED
```

### Actions

#### Get Event Type

Retrieve details of a specific event type by ID.

```yaml
actions:
  - plugin: calcom
    action: get_event_type
    input:
      eventTypeId: "12345"
```

#### Get Booking

Retrieve details of a specific booking by ID.

```yaml
actions:
  - plugin: calcom
    action: get_booking
    input:
      bookingId: "67890"
```

#### List Event Types

Retrieve a list of all event types.

```yaml
actions:
  - plugin: calcom
    action: list_event_types
```

#### List Bookings

Retrieve a list of bookings with optional filtering.

```yaml
actions:
  - plugin: calcom
    action: list_bookings
    input:
      limit: 10
      after: "2023-01-01T00:00:00Z"
      before: "2023-12-31T23:59:59Z"
```

#### Custom API Call

Make a custom API call to Cal.com.

```yaml
actions:
  - plugin: calcom
    action: custom_api_call
    input:
      method: "GET"
      endpoint: "/event-types"
```

## API Documentation

For more information about the Cal.com API, refer to the [official documentation](https://cal.com/docs/api).
