# MintFlow Klaviyo Plugin

The Klaviyo plugin provides integration with Klaviyo, a powerful email marketing and customer data platform. It allows you to track events, identify profiles, manage lists, and access campaign data.

## Features

- **Track Events**: Record customer activities and behaviors in Klaviyo
- **Identify Profiles**: Create and update customer profiles in Klaviyo
- **List Management**: Get lists, add profiles to lists, and remove profiles from lists
- **Campaign Access**: Retrieve campaign information

## Installation

```bash
pnpm add @mintflow/klaviyo
```

## Authentication

This plugin requires a Klaviyo API key for authentication. You can obtain your API key from the Klaviyo dashboard under Account > Settings > API Keys.

## Actions

### Track Event

Tracks an event in Klaviyo, associating it with a customer profile.

```javascript
// Example usage in a workflow
const input = {
  data: {
    apiKey: "pk_1234567890",
    event: "Viewed Product",
    email: "customer@example.com",
    firstName: "John",
    lastName: "Doe",
    properties: {
      productId: "123",
      productName: "Example Product",
      price: 99.99
    }
  }
};

const result = await klaviyoPlugin.actions[0].execute(input, {}, {});

// Result:
// {
//   success: true
// }
```

### Identify Profile

Creates or updates a profile in Klaviyo.

```javascript
// Example usage in a workflow
const input = {
  data: {
    apiKey: "pk_1234567890",
    email: "customer@example.com",
    firstName: "John",
    lastName: "Doe",
    phoneNumber: "+1234567890",
    organization: "Example Company",
    title: "CEO",
    properties: {
      source: "Website",
      signupDate: "2023-01-01"
    }
  }
};

const result = await klaviyoPlugin.actions[1].execute(input, {}, {});

// Result:
// {
//   success: true
// }
```

### Get Lists

Retrieves all lists from your Klaviyo account.

```javascript
// Example usage in a workflow
const input = {
  data: {
    apiKey: "pk_1234567890"
  }
};

const result = await klaviyoPlugin.actions[2].execute(input, {}, {});

// Result:
// {
//   success: true,
//   data: [
//     {
//       id: "abc123",
//       name: "Newsletter Subscribers",
//       created: "2023-01-01T00:00:00+00:00",
//       updated: "2023-01-01T00:00:00+00:00"
//     }
//   ]
// }
```

### Add Profiles to List

Adds one or more profiles to a Klaviyo list.

```javascript
// Example usage in a workflow
const input = {
  data: {
    apiKey: "pk_1234567890",
    listId: "abc123",
    profiles: [
      {
        email: "customer1@example.com",
        firstName: "John",
        lastName: "Doe"
      },
      {
        email: "customer2@example.com",
        firstName: "Jane",
        lastName: "Smith"
      }
    ]
  }
};

const result = await klaviyoPlugin.actions[3].execute(input, {}, {});

// Result:
// {
//   success: true
// }
```

### Remove Profile from List

Removes a profile from a Klaviyo list.

```javascript
// Example usage in a workflow
const input = {
  data: {
    apiKey: "pk_1234567890",
    listId: "abc123",
    email: "customer@example.com"
  }
};

const result = await klaviyoPlugin.actions[4].execute(input, {}, {});

// Result:
// {
//   success: true
// }
```

### Get Campaigns

Retrieves all campaigns from your Klaviyo account.

```javascript
// Example usage in a workflow
const input = {
  data: {
    apiKey: "pk_1234567890"
  }
};

const result = await klaviyoPlugin.actions[5].execute(input, {}, {});

// Result:
// {
//   success: true,
//   data: [
//     {
//       id: "abc123",
//       name: "Monthly Newsletter",
//       subject: "Monthly Newsletter - January 2023",
//       from_email: "newsletter@example.com",
//       from_name: "Example Company",
//       status: "sent",
//       created: "2023-01-01T00:00:00+00:00",
//       updated: "2023-01-01T00:00:00+00:00"
//     }
//   ]
// }
```

## Example Workflow

```javascript
// Create a workflow that tracks a purchase event and adds the customer to a list
const workflow = {
  nodes: [
    {
      id: "start",
      type: "start",
      next: "track_purchase"
    },
    {
      id: "track_purchase",
      type: "klaviyo",
      action: "track_event",
      data: {
        apiKey: "{{config.klaviyoApiKey}}",
        event: "Purchased Product",
        email: "{{input.email}}",
        firstName: "{{input.firstName}}",
        lastName: "{{input.lastName}}",
        properties: {
          productId: "{{input.productId}}",
          productName: "{{input.productName}}",
          price: "{{input.price}}",
          orderId: "{{input.orderId}}"
        }
      },
      next: "add_to_list"
    },
    {
      id: "add_to_list",
      type: "klaviyo",
      action: "add_profiles_to_list",
      data: {
        apiKey: "{{config.klaviyoApiKey}}",
        listId: "{{config.customerListId}}",
        profiles: [
          {
            email: "{{input.email}}",
            firstName: "{{input.firstName}}",
            lastName: "{{input.lastName}}"
          }
        ]
      },
      next: "end"
    },
    {
      id: "end",
      type: "end"
    }
  ]
};
```

## Error Handling

All actions include comprehensive error handling:

- If required parameters are missing, the action will return an error message
- If the Klaviyo API returns an error, the action will return the error message
- All actions return a `success` boolean indicating whether the operation was successful

## Common Use Cases

- **E-commerce**: Track product views, purchases, and abandoned carts
- **Customer Segmentation**: Add customers to lists based on their behavior
- **Email Marketing**: Manage email campaigns and subscriber lists
- **Customer Data Management**: Create and update customer profiles

## License

MIT
