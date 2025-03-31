# Square Plugin for MintFlow

The Square plugin for MintFlow provides integration with Square's payment processing and point of sale platform, allowing you to automate workflows based on Square events.

## Features

- **Webhook-based Triggers**: Receive real-time notifications for various Square events
- **Event Verification**: Secure webhook event verification using HMAC signatures
- **OAuth Authentication**: Secure authentication with Square's OAuth 2.0 API

## Authentication

The Square plugin uses OAuth 2.0 for authentication. You'll need to:

1. Create a Square Developer account at [https://developer.squareup.com/](https://developer.squareup.com/)
2. Create a new application in the Square Developer Dashboard
3. Configure the OAuth settings with your redirect URI
4. Use the provided client ID and client secret in your MintFlow workflow

## Triggers

The Square plugin provides the following triggers:

### New Order

Triggered when a new order is created in Square.

```json
{
  "merchant_id": "MLTZ79VE64YTN",
  "type": "order.created",
  "event_id": "03441e3a-47f1-49a7-a64c-55ab26703f8d",
  "created_at": "2023-03-14T01:42:54.984089903Z",
  "data": {
    "type": "order",
    "id": "eA3vssLHKJrv9H0IdJCM3gNqfdcZY",
    "object": {
      "order_created": {
        "created_at": "2020-04-16T23:14:26.129Z",
        "location_id": "FPYCBCHYMXFK1",
        "order_id": "eA3vssLHKJrv9H0IdJCM3gNqfdcZY",
        "state": "OPEN",
        "version": 1
      }
    }
  }
}
```

### Order Updated

Triggered when an existing order is updated in Square.

```json
{
  "merchant_id": "MLTZ79VE64YTN",
  "type": "order.updated",
  "event_id": "7e1d596e-ebf1-443d-87aa-a5f397bce1e5",
  "created_at": "2023-03-14T01:56:10.454184371Z",
  "data": {
    "type": "order",
    "id": "eA3vssLHKJrv9H0IdJCM3gNqfdcZY",
    "object": {
      "order_updated": {
        "created_at": "2020-04-16T23:14:26.129Z",
        "location_id": "FPYCBCHYMXFK1",
        "order_id": "eA3vssLHKJrv9H0IdJCM3gNqfdcZY",
        "state": "OPEN",
        "updated_at": "2020-04-16T23:14:26.359Z",
        "version": 2
      }
    }
  }
}
```

### New Customer

Triggered when a new customer is created in Square.

```json
{
  "merchant_id": "MLTZ79VE64YTN",
  "type": "customer.created",
  "event_id": "2985c7c7-2ccc-409e-8aba-998684732cab",
  "created_at": "2023-03-14T01:57:28.679389163Z",
  "data": {
    "type": "customer",
    "id": "QPTXM8PQNX3Q726ZYHPMNP46XC",
    "object": {
      "customer": {
        "address": {
          "address_line_1": "1018 40th Street",
          "administrative_district_level_1": "CA",
          "locality": "Oakland",
          "postal_code": "94608"
        },
        "birthday": "1962-03-04",
        "created_at": "2022-11-09T21:23:25.519Z",
        "creation_source": "DIRECTORY",
        "email_address": "jenkins+smorly@squareup.com",
        "family_name": "Smorly",
        "given_name": "Jenkins",
        "group_ids": ["JGJCW9S0G68NE.APPOINTMENTS"],
        "id": "QPTXM8PQNX3Q726ZYHPMNP46XC",
        "phone_number": "+12126668929",
        "preferences": {
          "email_unsubscribed": false
        },
        "updated_at": "2022-11-09T21:23:25Z",
        "version": 0
      }
    }
  }
}
```

### Customer Updated

Triggered when an existing customer is updated in Square.

```json
{
  "merchant_id": "MLTZ79VE64YTN",
  "type": "customer.updated",
  "event_id": "f6e89469-de2f-4ae4-84c7-83a95681759a",
  "created_at": "2023-03-14T01:58:22.076902762Z",
  "data": {
    "type": "customer",
    "id": "A0AP25A6SCVTH8JES9BX01GXM4",
    "object": {
      "customer": {
        "created_at": "2022-07-09T18:23:01.795Z",
        "creation_source": "THIRD_PARTY",
        "email_address": "jenkins+smorly@squareup.com",
        "family_name": "Smorly",
        "given_name": "Jenkins",
        "id": "A0AP25A6SCVTH8JES9BX01GXM4",
        "phone_number": "+13477947111",
        "preferences": {
          "email_unsubscribed": false
        },
        "updated_at": "2022-11-09T21:38:30Z",
        "version": 1
      }
    }
  }
}
```

### New Payment

Triggered when a new payment is created in Square.

```json
{
  "merchant_id": "MLTZ79VE64YTN",
  "type": "payment.created",
  "event_id": "11fb274d-6882-417a-879c-faec367e0665",
  "created_at": "2023-03-14T02:00:56.000119371Z",
  "data": {
    "type": "payment",
    "id": "KkAkhdMsgzn59SM8A89WgKwekxLZY",
    "object": {
      "payment": {
        "amount_money": {
          "amount": 100,
          "currency": "USD"
        },
        "approved_money": {
          "amount": 100,
          "currency": "USD"
        },
        "card_details": {
          "card": {
            "card_brand": "MASTERCARD",
            "last_4": "9029"
          },
          "status": "AUTHORIZED"
        },
        "created_at": "2020-11-22T21:16:51.086Z",
        "id": "hYy9pRFVxpDsO1FB05SunFWUe9JZY",
        "location_id": "S8GWD5R9QB376",
        "order_id": "03O3USaPaAaFnI6kkwB1JxGgBsUZY",
        "status": "APPROVED"
      }
    }
  }
}
```

### New Invoice

Triggered when a new invoice is created in Square.

```json
{
  "merchant_id": "MLTZ79VE64YTN",
  "location_id": "ES0RJRZYEC39A",
  "type": "invoice.created",
  "event_id": "ee17dc22-5e38-4aba-ad15-af8e25adcc93",
  "created_at": "2023-03-14T02:01:46.497709569Z",
  "data": {
    "type": "invoice",
    "id": "inv:0-ChCHu2mZEabLeeHahQnXDjZQECY",
    "object": {
      "invoice": {
        "id": "inv:0-ChCHu2mZEabLeeHahQnXDjZQECY",
        "invoice_number": "inv-100",
        "status": "DRAFT",
        "title": "Event Planning Services"
      }
    }
  }
}
```

### New Appointment

Triggered when a new appointment is created in Square.

```json
{
  "merchant_id": "MLTZ79VE64YTN",
  "location_id": "ES0RJRZYEC39A",
  "type": "booking.created",
  "event_id": "ee17dc22-5e38-4aba-ad15-af8e25adcc93",
  "created_at": "2023-03-14T02:01:46.497709569Z",
  "data": {
    "type": "booking",
    "id": "booking-id",
    "object": {
      "booking": {
        "appointment_segments": [
          {
            "duration_minutes": 60,
            "service_variation_id": "service-variation-id",
            "service_variation_version": 1,
            "team_member_id": "team-member-id"
          }
        ],
        "created_at": "2020-11-26T20:42:54Z",
        "customer_id": "customer-id",
        "id": "booking-id",
        "location_id": "location-id",
        "start_at": "2020-11-26T21:00:00Z",
        "status": "ACCEPTED"
      }
    }
  }
}
```

## Webhook Setup

To use the Square plugin triggers, you need to set up a webhook in your Square Developer Dashboard:

1. Go to your application in the Square Developer Dashboard
2. Navigate to the Webhooks section
3. Add a webhook subscription with the URL provided by MintFlow
4. Select the event types you want to subscribe to
5. Copy the webhook signature key to use in your MintFlow workflow

## Resources

- [Square Developer Documentation](https://developer.squareup.com/docs)
- [Square API Reference](https://developer.squareup.com/reference/square)
- [Square Webhooks Documentation](https://developer.squareup.com/docs/webhooks/overview)
