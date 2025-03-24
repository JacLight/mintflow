# QuickBooks Plugin for MintFlow

The QuickBooks plugin for MintFlow provides integration with Intuit's QuickBooks Online accounting software, allowing you to automate accounting tasks, retrieve financial data, and create invoices and other financial documents.

## Features

- **Customer Management**: Retrieve customer information
- **Invoice Management**: Create and manage invoices
- **Financial Reporting**: Generate profit and loss reports
- **Webhook Integration**: Trigger workflows when new invoices are created
- **Custom API Access**: Make custom API calls to the QuickBooks API

## Authentication

The QuickBooks plugin requires OAuth 2.0 authentication with the following credentials:

1. **Client ID**: Your QuickBooks API application client ID
2. **Client Secret**: Your QuickBooks API application client secret
3. **Refresh Token**: A refresh token obtained through the OAuth 2.0 flow
4. **Realm ID**: Your QuickBooks company ID (also known as Realm ID)
5. **Environment**: The QuickBooks environment to use (sandbox or production)

To obtain these credentials:

1. Create a developer account at [Intuit Developer](https://developer.intuit.com/)
2. Create a new app in the Intuit Developer dashboard
3. Configure the app with the necessary scopes (accounting, payments, etc.)
4. Use the OAuth 2.0 Playground to obtain a refresh token
5. Find your Realm ID in the QuickBooks Online company settings

## Actions

### Get Customer

Retrieve a customer from QuickBooks by ID.

#### Input

```json
{
  "customerId": "1",
  "includeDetails": true
}
```

#### Parameters

- **customerId** (required): The ID of the customer to retrieve
- **includeDetails** (optional): Whether to include all customer details. Default: true

#### Output

```json
{
  "customer": {
    "Id": "1",
    "DisplayName": "John Doe",
    "PrimaryEmailAddr": {
      "Address": "john.doe@example.com"
    },
    "PrimaryPhone": {
      "FreeFormNumber": "555-555-5555"
    },
    "BillAddr": {
      "Line1": "123 Main St",
      "City": "Anytown",
      "CountrySubDivisionCode": "CA",
      "PostalCode": "12345"
    }
  }
}
```

### Create Invoice

Create a new invoice in QuickBooks.

#### Input

```json
{
  "customerId": "1",
  "lineItems": [
    {
      "description": "Consulting Services",
      "amount": 100,
      "quantity": 2
    }
  ],
  "dueDate": "2023-12-31",
  "memo": "Thank you for your business",
  "emailToCustomer": false
}
```

#### Parameters

- **customerId** (required): The ID of the customer for the invoice
- **lineItems** (required): Array of line items for the invoice
  - **itemId** (optional): The ID of the item
  - **description** (required): The description of the item
  - **amount** (required): The amount of the item
  - **quantity** (optional): The quantity of the item. Default: 1
- **dueDate** (optional): The due date of the invoice (YYYY-MM-DD)
- **memo** (optional): A memo for the invoice
- **emailToCustomer** (optional): Whether to email the invoice to the customer. Default: false

#### Output

```json
{
  "invoice": {
    "Id": "123",
    "DocNumber": "INV-123",
    "CustomerRef": {
      "value": "1"
    },
    "TotalAmt": 200,
    "Balance": 200,
    "DueDate": "2023-12-31"
  }
}
```

### Get Profit and Loss Report

Generate a profit and loss report from QuickBooks.

#### Input

```json
{
  "startDate": "2023-01-01",
  "endDate": "2023-12-31",
  "accountingMethod": "Accrual",
  "summarizeColumnsBy": "Month"
}
```

#### Parameters

- **startDate** (required): The start date of the report (YYYY-MM-DD)
- **endDate** (required): The end date of the report (YYYY-MM-DD)
- **accountingMethod** (optional): The accounting method to use for the report. Options: "Accrual" or "Cash". Default: "Accrual"
- **summarizeColumnsBy** (optional): How to summarize columns in the report. Options: "Total", "Month", "Quarter", or "Year". Default: "Total"

#### Output

```json
{
  "report": {
    "Header": {
      "ReportName": "Profit and Loss",
      "Time": "2023-01-01T00:00:00 - 2023-12-31T23:59:59",
      "ReportBasis": "Accrual"
    },
    "Columns": {
      "Column": [
        {
          "ColTitle": "Jan 2023",
          "ColType": "Money"
        },
        {
          "ColTitle": "Feb 2023",
          "ColType": "Money"
        }
      ]
    },
    "Rows": {
      "Row": [
        {
          "Header": {
            "ColData": [
              {
                "value": "Income"
              }
            ]
          },
          "Rows": {
            "Row": [
              {
                "ColData": [
                  {
                    "value": "Sales"
                  },
                  {
                    "value": "1000.00"
                  },
                  {
                    "value": "1200.00"
                  }
                ]
              }
            ]
          },
          "Summary": {
            "ColData": [
              {
                "value": "Total Income"
              },
              {
                "value": "1000.00"
              },
              {
                "value": "1200.00"
              }
            ]
          }
        }
      ]
    }
  }
}
```

### Custom API Call

Make a custom API call to the QuickBooks API.

#### Input

```json
{
  "endpoint": "customer",
  "method": "GET",
  "params": {
    "limit": 10
  }
}
```

#### Parameters

- **endpoint** (required): The QuickBooks API endpoint to call (e.g., "customer", "invoice")
- **method** (required): The HTTP method to use. Options: "GET", "POST", "PUT", "DELETE". Default: "GET"
- **data** (optional): The request body (for POST, PUT methods)
- **params** (optional): Query parameters to include in the request

#### Output

```json
{
  "Customer": [
    {
      "Id": "1",
      "DisplayName": "John Doe",
      "PrimaryEmailAddr": {
        "Address": "john.doe@example.com"
      }
    }
  ]
}
```

## Triggers

### New Invoice

Triggers when a new invoice is created in QuickBooks.

#### Output

```json
{
  "invoice": {
    "Id": "123",
    "DocNumber": "INV-123",
    "CustomerRef": {
      "value": "1",
      "name": "John Doe"
    },
    "TotalAmt": 200,
    "Balance": 200,
    "DueDate": "2023-12-31",
    "TxnDate": "2023-12-01",
    "Line": [
      {
        "DetailType": "SalesItemLineDetail",
        "Amount": 200,
        "Description": "Consulting Services",
        "SalesItemLineDetail": {
          "Qty": 2,
          "UnitPrice": 100
        }
      }
    ]
  }
}
```

## Resources

- [QuickBooks API Documentation](https://developer.intuit.com/app/developer/qbo/docs/api/accounting/most-commonly-used/account)
- [Intuit Developer Dashboard](https://developer.intuit.com/app/developer/dashboard)
- [QuickBooks OAuth 2.0 Playground](https://developer.intuit.com/app/developer/qbo/docs/develop/authentication-and-authorization/oauth-2.0-playground)
