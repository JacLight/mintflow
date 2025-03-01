# Freshbooks Plugin for MintFlow

The Freshbooks plugin for MintFlow provides integration with Freshbooks' cloud-based accounting software, allowing you to automate client management, invoice creation, expense tracking, and time tracking.

## Features

- **Client Management**: Retrieve client information
- **Invoice Management**: Create and manage invoices
- **Expense Tracking**: Retrieve expense information
- **Time Tracking**: Retrieve time entry information
- **Polling Integration**: Trigger workflows when new invoices or expenses are created
- **Custom API Access**: Make custom API calls to the Freshbooks API

## Authentication

The Freshbooks plugin requires API token authentication with the following credentials:

1. **API Token**: Your Freshbooks API token
2. **Account ID**: Your Freshbooks account ID (also known as business ID)

To obtain these credentials:

1. Log in to your Freshbooks account
2. Go to Settings > Developer Portal
3. Create a new application
4. Generate an API token
5. Note your account ID (visible in the URL when logged in: `https://my.freshbooks.com/#/dashboard/:account_id`)

## Actions

### Get Client

Retrieve a client from Freshbooks by ID.

#### Input

```json
{
  "clientId": "123456"
}
```

#### Parameters

- **clientId** (required): The ID of the client to retrieve

#### Output

```json
{
  "client": {
    "id": 123456,
    "organization": "ACME Inc.",
    "fname": "John",
    "lname": "Doe",
    "email": "john.doe@example.com",
    "home_phone": "555-555-5555",
    "mobile": "555-555-5556",
    "bus_phone": "555-555-5557",
    "fax": "555-555-5558",
    "notes": "Important client",
    "p_street": "123 Main St",
    "p_city": "Anytown",
    "p_state": "CA",
    "p_country": "United States",
    "p_code": "12345",
    "currency_code": "USD",
    "language": "en"
  }
}
```

### Create Invoice

Create a new invoice in Freshbooks.

#### Input

```json
{
  "clientId": "123456",
  "lineItems": [
    {
      "name": "Consulting Services",
      "description": "Professional consulting services",
      "rate": 100,
      "quantity": 2
    }
  ],
  "createDate": "2023-12-01",
  "dueDate": "2023-12-31",
  "notes": "Thank you for your business",
  "sendEmail": false
}
```

#### Parameters

- **clientId** (required): The ID of the client for the invoice
- **lineItems** (required): Array of line items for the invoice
  - **name** (required): The name of the item
  - **description** (optional): The description of the item
  - **rate** (required): The rate of the item
  - **quantity** (optional): The quantity of the item. Default: 1
  - **taxName1** (optional): The name of the first tax
  - **taxAmount1** (optional): The amount of the first tax
  - **taxName2** (optional): The name of the second tax
  - **taxAmount2** (optional): The amount of the second tax
- **invoiceNumber** (optional): The invoice number
- **createDate** (optional): The creation date of the invoice (YYYY-MM-DD)
- **dueDate** (optional): The due date of the invoice (YYYY-MM-DD)
- **poNumber** (optional): The purchase order number
- **discount** (optional): The discount percentage
- **notes** (optional): Notes to be displayed on the invoice
- **terms** (optional): Terms to be displayed on the invoice
- **currency** (optional): The currency code for the invoice (e.g., USD, EUR, GBP)
- **language** (optional): The language code for the invoice (e.g., en, fr, es)
- **sendEmail** (optional): Whether to send the invoice to the client via email. Default: false

#### Output

```json
{
  "invoice": {
    "id": 654321,
    "client_id": 123456,
    "number": "INV-0001",
    "create_date": "2023-12-01",
    "due_date": "2023-12-31",
    "status": 1,
    "amount": {
      "amount": "200.00",
      "code": "USD"
    },
    "outstanding": {
      "amount": "200.00",
      "code": "USD"
    },
    "notes": "Thank you for your business",
    "lines": [
      {
        "id": 1,
        "name": "Consulting Services",
        "description": "Professional consulting services",
        "unit_cost": {
          "amount": "100.00",
          "code": "USD"
        },
        "quantity": 2,
        "amount": {
          "amount": "200.00",
          "code": "USD"
        }
      }
    ]
  }
}
```

### Get Expense

Retrieve an expense from Freshbooks by ID.

#### Input

```json
{
  "expenseId": "123456"
}
```

#### Parameters

- **expenseId** (required): The ID of the expense to retrieve

#### Output

```json
{
  "expense": {
    "id": 123456,
    "staffid": 1,
    "categoryid": 4,
    "clientid": 5678,
    "projectid": 9012,
    "date": "2023-01-15",
    "amount": {
      "amount": "150.00",
      "code": "USD"
    },
    "notes": "Office supplies",
    "status": 0,
    "billable": true,
    "taxName1": "Tax",
    "taxAmount1": 10,
    "taxName2": "",
    "taxAmount2": 0,
    "account_name": "Expenses",
    "vendor": "Office Depot",
    "has_receipt": false,
    "include_receipt": false,
    "updated": "2023-01-15 12:00:00"
  }
}
```

### Get Time Entry

Retrieve a time entry from Freshbooks by ID.

#### Input

```json
{
  "timeEntryId": "123456"
}
```

#### Parameters

- **timeEntryId** (required): The ID of the time entry to retrieve

#### Output

```json
{
  "timeEntry": {
    "id": 123456,
    "business_id": 7890,
    "project_id": 1234,
    "client_id": 5678,
    "service_id": 9012,
    "staff_id": 3456,
    "started_at": "2023-01-15T09:00:00Z",
    "duration": 3600,
    "note": "Working on project documentation",
    "billable": true,
    "active": true,
    "internal": false,
    "created_at": "2023-01-15T09:00:00Z",
    "updated_at": "2023-01-15T10:00:00Z"
  }
}
```

### Custom API Call

Make a custom API call to the Freshbooks API.

#### Input

```json
{
  "endpoint": "/accounting/account/:account_id/users/clients",
  "method": "GET",
  "params": {
    "per_page": 10,
    "page": 1
  }
}
```

#### Parameters

- **endpoint** (required): The Freshbooks API endpoint to call (e.g., "/accounting/account/:account_id/users/clients", "/accounting/account/:account_id/invoices/invoices")
- **method** (required): The HTTP method to use. Options: "GET", "POST", "PUT", "DELETE". Default: "GET"
- **data** (optional): The request data (for POST, PUT methods)
- **params** (optional): The query parameters to include in the request

#### Output

```json
{
  "data": {
    "response": {
      "result": {
        "clients": [
          {
            "id": 123456,
            "organization": "ACME Inc.",
            "fname": "John",
            "lname": "Doe",
            "email": "john.doe@example.com"
          }
        ],
        "page": 1,
        "per_page": 10,
        "pages": 1,
        "total": 1
      }
    }
  }
}
```

## Triggers

### New Invoice

Triggers when a new invoice is created in Freshbooks.

#### Output

```json
{
  "invoice": {
    "id": 654321,
    "client_id": 123456,
    "number": "INV-0001",
    "create_date": "2023-12-01",
    "due_date": "2023-12-31",
    "status": 1,
    "amount": {
      "amount": "200.00",
      "code": "USD"
    },
    "outstanding": {
      "amount": "200.00",
      "code": "USD"
    },
    "notes": "Thank you for your business",
    "lines": [
      {
        "id": 1,
        "name": "Consulting Services",
        "description": "Professional consulting services",
        "unit_cost": {
          "amount": "100.00",
          "code": "USD"
        },
        "quantity": 2,
        "amount": {
          "amount": "200.00",
          "code": "USD"
        }
      }
    ]
  }
}
```

### New Expense

Triggers when a new expense is created in Freshbooks.

#### Output

```json
{
  "expense": {
    "id": 123456,
    "staffid": 1,
    "categoryid": 4,
    "clientid": 5678,
    "projectid": 9012,
    "date": "2023-01-15",
    "amount": {
      "amount": "150.00",
      "code": "USD"
    },
    "notes": "Office supplies",
    "status": 0,
    "billable": true,
    "taxName1": "Tax",
    "taxAmount1": 10,
    "taxName2": "",
    "taxAmount2": 0,
    "account_name": "Expenses",
    "vendor": "Office Depot",
    "has_receipt": false,
    "include_receipt": false,
    "updated": "2023-01-15 12:00:00"
  }
}
```

## Resources

- [Freshbooks API Documentation](https://www.freshbooks.com/api/start)
- [Freshbooks Developer Portal](https://www.freshbooks.com/api/authentication)
- [Freshbooks Website](https://www.freshbooks.com/)
