# Pipedrive Plugin for MintFlow

The Pipedrive plugin provides integration with Pipedrive CRM, allowing you to manage persons, organizations, deals, leads, activities, and more.

## Features

- **Person Management**: Create, update, find, and list persons
- **Organization Management**: Create, update, find, and list organizations
- **Deal Management**: Create, update, find, and list deals
- **Lead Management**: Create, update, find, and list leads
- **Activity Management**: Create, update, find, and list activities
- **Product Management**: Create, find, and list products
- **Note Management**: Create, find, and list notes
- **User Management**: Find and list users
- **Webhook Management**: Create and delete webhooks
- **Utility Functions**: List pipelines, stages, filters, activity types, and lead labels

## Authentication

This plugin requires authentication with Pipedrive. You'll need:

- A Pipedrive API Token
- The Pipedrive API Domain

To get your API Token:

1. Log into your Pipedrive account
2. Click on your profile picture in the top-right corner
3. Go to **Personal Preferences**
4. Select the **API** tab
5. Copy your personal API token

## Usage

### Person Management

#### List Persons

```json
{
  "action": "list_persons",
  "apiToken": "your-api-token",
  "data": {
    "api_domain": "https://your-company.pipedrive.com"
  }
}
```

#### Get Person

```json
{
  "action": "get_person",
  "apiToken": "your-api-token",
  "data": {
    "api_domain": "https://your-company.pipedrive.com"
  },
  "id": 123
}
```

#### Create Person

```json
{
  "action": "create_person",
  "apiToken": "your-api-token",
  "data": {
    "api_domain": "https://your-company.pipedrive.com"
  },
  "name": "John Doe",
  "email": ["john.doe@example.com"],
  "phone": ["123-456-7890"],
  "owner_id": 123,
  "org_id": 456,
  "first_name": "John",
  "last_name": "Doe"
}
```

#### Update Person

```json
{
  "action": "update_person",
  "apiToken": "your-api-token",
  "data": {
    "api_domain": "https://your-company.pipedrive.com"
  },
  "id": 123,
  "name": "John Smith",
  "email": ["john.smith@example.com"]
}
```

#### Find Person

```json
{
  "action": "find_person",
  "apiToken": "your-api-token",
  "data": {
    "api_domain": "https://your-company.pipedrive.com"
  },
  "term": "John",
  "fields": ["name", "email"],
  "exact_match": false
}
```

### Organization Management

#### List Organizations

```json
{
  "action": "list_organizations",
  "apiToken": "your-api-token",
  "data": {
    "api_domain": "https://your-company.pipedrive.com"
  }
}
```

#### Get Organization

```json
{
  "action": "get_organization",
  "apiToken": "your-api-token",
  "data": {
    "api_domain": "https://your-company.pipedrive.com"
  },
  "id": 123
}
```

#### Create Organization

```json
{
  "action": "create_organization",
  "apiToken": "your-api-token",
  "data": {
    "api_domain": "https://your-company.pipedrive.com"
  },
  "name": "Acme Inc",
  "owner_id": 123,
  "address": "123 Main St, Anytown, USA"
}
```

#### Update Organization

```json
{
  "action": "update_organization",
  "apiToken": "your-api-token",
  "data": {
    "api_domain": "https://your-company.pipedrive.com"
  },
  "id": 123,
  "name": "Acme Corporation",
  "address": "456 Business Ave, Metropolis, USA"
}
```

### Deal Management

#### List Deals

```json
{
  "action": "list_deals",
  "apiToken": "your-api-token",
  "data": {
    "api_domain": "https://your-company.pipedrive.com"
  }
}
```

#### Get Deal

```json
{
  "action": "get_deal",
  "apiToken": "your-api-token",
  "data": {
    "api_domain": "https://your-company.pipedrive.com"
  },
  "id": 123
}
```

#### Create Deal

```json
{
  "action": "create_deal",
  "apiToken": "your-api-token",
  "data": {
    "api_domain": "https://your-company.pipedrive.com"
  },
  "title": "New Software Purchase",
  "value": 10000,
  "currency": "USD",
  "person_id": 123,
  "org_id": 456,
  "stage_id": 789
}
```

#### Update Deal

```json
{
  "action": "update_deal",
  "apiToken": "your-api-token",
  "data": {
    "api_domain": "https://your-company.pipedrive.com"
  },
  "id": 123,
  "title": "Software Purchase and Implementation",
  "value": 15000,
  "status": "won"
}
```

### Lead Management

#### List Leads

```json
{
  "action": "list_leads",
  "apiToken": "your-api-token",
  "data": {
    "api_domain": "https://your-company.pipedrive.com"
  }
}
```

#### Get Lead

```json
{
  "action": "get_lead",
  "apiToken": "your-api-token",
  "data": {
    "api_domain": "https://your-company.pipedrive.com"
  },
  "id": 123
}
```

#### Create Lead

```json
{
  "action": "create_lead",
  "apiToken": "your-api-token",
  "data": {
    "api_domain": "https://your-company.pipedrive.com"
  },
  "title": "Potential Enterprise Client",
  "person_id": 123,
  "organization_id": 456,
  "value": 25000,
  "currency": "USD"
}
```

#### Update Lead

```json
{
  "action": "update_lead",
  "apiToken": "your-api-token",
  "data": {
    "api_domain": "https://your-company.pipedrive.com"
  },
  "id": 123,
  "title": "Enterprise Client - High Priority",
  "value": 50000
}
```

### Activity Management

#### List Activities

```json
{
  "action": "list_activities",
  "apiToken": "your-api-token",
  "data": {
    "api_domain": "https://your-company.pipedrive.com"
  }
}
```

#### Get Activity

```json
{
  "action": "get_activity",
  "apiToken": "your-api-token",
  "data": {
    "api_domain": "https://your-company.pipedrive.com"
  },
  "id": 123
}
```

#### Create Activity

```json
{
  "action": "create_activity",
  "apiToken": "your-api-token",
  "data": {
    "api_domain": "https://your-company.pipedrive.com"
  },
  "subject": "Initial Call",
  "type": "call",
  "due_date": "2023-12-31",
  "due_time": "15:00",
  "duration": "00:30",
  "deal_id": 123,
  "person_id": 456,
  "note": "Discuss project requirements"
}
```

#### Update Activity

```json
{
  "action": "update_activity",
  "apiToken": "your-api-token",
  "data": {
    "api_domain": "https://your-company.pipedrive.com"
  },
  "id": 123,
  "subject": "Follow-up Call",
  "due_date": "2024-01-15",
  "done": true
}
```

### Product Management

#### List Products

```json
{
  "action": "list_products",
  "apiToken": "your-api-token",
  "data": {
    "api_domain": "https://your-company.pipedrive.com"
  }
}
```

#### Get Product

```json
{
  "action": "get_product",
  "apiToken": "your-api-token",
  "data": {
    "api_domain": "https://your-company.pipedrive.com"
  },
  "id": 123
}
```

#### Create Product

```json
{
  "action": "create_product",
  "apiToken": "your-api-token",
  "data": {
    "api_domain": "https://your-company.pipedrive.com"
  },
  "name": "Enterprise Software License",
  "code": "ESL-001",
  "unit": "license",
  "tax": 7.5,
  "prices": [
    {
      "currency": "USD",
      "price": 1000,
      "cost": 500
    }
  ]
}
```

#### Add Product to Deal

```json
{
  "action": "add_product_to_deal",
  "apiToken": "your-api-token",
  "data": {
    "api_domain": "https://your-company.pipedrive.com"
  },
  "dealId": 123,
  "productId": 456,
  "item_price": 1000,
  "quantity": 5,
  "discount_percentage": 10
}
```

### Note Management

#### List Notes

```json
{
  "action": "list_notes",
  "apiToken": "your-api-token",
  "data": {
    "api_domain": "https://your-company.pipedrive.com"
  }
}
```

#### Get Note

```json
{
  "action": "get_note",
  "apiToken": "your-api-token",
  "data": {
    "api_domain": "https://your-company.pipedrive.com"
  },
  "id": 123
}
```

#### Create Note

```json
{
  "action": "create_note",
  "apiToken": "your-api-token",
  "data": {
    "api_domain": "https://your-company.pipedrive.com"
  },
  "content": "Client requested a demo next week",
  "deal_id": 123,
  "person_id": 456,
  "pinned_to_deal_flag": true
}
```

### User Management

#### List Users

```json
{
  "action": "list_users",
  "apiToken": "your-api-token",
  "data": {
    "api_domain": "https://your-company.pipedrive.com"
  }
}
```

#### Get User

```json
{
  "action": "get_user",
  "apiToken": "your-api-token",
  "data": {
    "api_domain": "https://your-company.pipedrive.com"
  },
  "id": 123
}
```

### Webhook Management

#### Create Webhook

```json
{
  "action": "create_webhook",
  "apiToken": "your-api-token",
  "data": {
    "api_domain": "https://your-company.pipedrive.com"
  },
  "object": "deal",
  "action": "updated",
  "webhookUrl": "https://your-webhook-endpoint.com/pipedrive-webhook"
}
```

#### Delete Webhook

```json
{
  "action": "delete_webhook",
  "apiToken": "your-api-token",
  "data": {
    "api_domain": "https://your-company.pipedrive.com"
  },
  "webhookId": "123"
}
```

### Utility Functions

#### List Pipelines

```json
{
  "action": "list_pipelines",
  "apiToken": "your-api-token",
  "data": {
    "api_domain": "https://your-company.pipedrive.com"
  }
}
```

#### List Stages

```json
{
  "action": "list_stages",
  "apiToken": "your-api-token",
  "data": {
    "api_domain": "https://your-company.pipedrive.com"
  }
}
```

#### List Filters

```json
{
  "action": "list_filters",
  "apiToken": "your-api-token",
  "data": {
    "api_domain": "https://your-company.pipedrive.com"
  },
  "type": "deals"
}
```

#### List Activity Types

```json
{
  "action": "list_activity_types",
  "apiToken": "your-api-token",
  "data": {
    "api_domain": "https://your-company.pipedrive.com"
  }
}
```

#### List Lead Labels

```json
{
  "action": "list_lead_labels",
  "apiToken": "your-api-token",
  "data": {
    "api_domain": "https://your-company.pipedrive.com"
  }
}
```

## Error Handling

The plugin provides detailed error messages for common issues:

- Invalid authentication credentials
- Missing required parameters
- Pipedrive API errors

## Limitations

- The plugin requires a valid Pipedrive API token
- Some operations may require specific Pipedrive permissions
- Rate limits apply based on your Pipedrive plan

## Resources

- [Pipedrive API Documentation](https://developers.pipedrive.com/docs/api/v1)
- [Pipedrive Developer Hub](https://developers.pipedrive.com/)
