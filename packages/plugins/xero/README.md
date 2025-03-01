# Xero Plugin for MintFlow

The Xero plugin for MintFlow provides integration with Xero's cloud-based accounting software, allowing you to automate accounting tasks, retrieve financial data, and create invoices and other financial documents.

## Features

- **Contact Management**: Retrieve contact information
- **Invoice Management**: Create and manage invoices
- **Financial Reporting**: Generate profit and loss reports
- **Polling Integration**: Trigger workflows when new invoices are created
- **Custom API Access**: Make custom API calls to the Xero API

## Authentication

The Xero plugin requires OAuth 2.0 authentication with the following credentials:

1. **Client ID**: Your Xero API application client ID
2. **Client Secret**: Your Xero API application client secret
3. **Refresh Token**: A refresh token obtained through the OAuth 2.0 flow
4. **Tenant ID**: Your Xero organization ID (also known as Tenant ID)

To obtain these credentials:

1. Create a developer account at [Xero Developer](https://developer.xero.com/)
2. Create a new app in the Xero Developer dashboard
3. Configure the app with the necessary scopes (accounting.transactions, accounting.contacts, accounting.settings)
4. Use the OAuth 2.0 flow to obtain a refresh token
5. Find your Tenant ID in the Xero API connections

## Actions

### Get Contact

Retrieve a contact from Xero by ID.

#### Input

```json
{
  "contactId": "00000000-0000-0000-0000-000000000000"
}
```

#### Parameters

- **contactId** (required): The ID of the contact to retrieve

#### Output

```json
{
  "contact": {
    "ContactID": "00000000-0000-0000-0000-000000000000",
    "Name": "John Doe",
    "FirstName": "John",
    "LastName": "Doe",
    "EmailAddress": "john.doe@example.com",
    "Addresses": [
      {
        "AddressType": "STREET",
        "AddressLine1": "123 Main St",
        "City": "Anytown",
        "Region": "CA",
        "PostalCode": "12345",
        "Country": "USA"
      }
    ],
    "Phones": [
      {
        "PhoneType": "DEFAULT",
        "PhoneNumber": "555-555-5555"
      }
    ]
  }
}
```

### Create Invoice

Create a new invoice in Xero.

#### Input

```json
{
  "contactId": "00000000-0000-0000-0000-000000000000",
  "lineItems": [
    {
      "description": "Consulting Services",
      "quantity": 2,
      "unitAmount": 100,
      "accountCode": "200"
    }
  ],
  "invoiceType": "ACCREC",
  "dueDate": "2023-12-31",
  "reference": "INV-001",
  "status": "DRAFT"
}
```

#### Parameters

- **contactId** (required): The ID of the contact for the invoice
- **lineItems** (required): Array of line items for the invoice
  - **description** (required): The description of the item
  - **quantity** (optional): The quantity of the item. Default: 1
  - **unitAmount** (required): The unit amount of the item
  - **accountCode** (optional): The account code for the item
  - **taxType** (optional): The tax type for the item
- **invoiceType** (optional): The type of invoice. Options: "ACCREC" (Accounts Receivable) or "ACCPAY" (Accounts Payable). Default: "ACCREC"
- **dueDate** (optional): The due date of the invoice (YYYY-MM-DD)
- **reference** (optional): The reference for the invoice
- **status** (optional): The status of the invoice. Options: "DRAFT", "SUBMITTED", "AUTHORISED". Default: "DRAFT"

#### Output

```json
{
  "invoice": {
    "InvoiceID": "00000000-0000-0000-0000-000000000000",
    "Type": "ACCREC",
    "Contact": {
      "ContactID": "00000000-0000-0000-0000-000000000000",
      "Name": "John Doe"
    },
    "Date": "2023-12-01",
    "DueDate": "2023-12-31",
    "Status": "DRAFT",
    "LineAmountTypes": "Exclusive",
    "LineItems": [
      {
        "Description": "Consulting Services",
        "Quantity": 2,
        "UnitAmount": 100,
        "AccountCode": "200",
        "LineAmount": 200
      }
    ],
    "SubTotal": 200,
    "TotalTax": 0,
    "Total": 200
  }
}
```

### Get Profit and Loss Report

Generate a profit and loss report from Xero.

#### Input

```json
{
  "fromDate": "2023-01-01",
  "toDate": "2023-12-31",
  "periods": 12,
  "timeframe": "MONTH",
  "standardLayout": true,
  "paymentsOnly": false
}
```

#### Parameters

- **fromDate** (required): The start date of the report (YYYY-MM-DD)
- **toDate** (required): The end date of the report (YYYY-MM-DD)
- **periods** (optional): The number of periods to compare
- **timeframe** (optional): The timeframe for the report. Options: "MONTH", "QUARTER", "YEAR"
- **trackingCategoryID** (optional): The ID of the tracking category to filter by
- **trackingOptionID** (optional): The ID of the tracking option to filter by
- **standardLayout** (optional): Whether to use the standard layout. Default: true
- **paymentsOnly** (optional): Whether to include only payments. Default: false

#### Output

```json
{
  "report": {
    "Reports": [
      {
        "ReportID": "ProfitAndLoss",
        "ReportName": "Profit and Loss",
        "ReportType": "ProfitAndLoss",
        "ReportTitles": ["Profit and Loss"],
        "ReportDate": "2023-12-31",
        "UpdatedDateUTC": "2023-12-31T00:00:00",
        "Rows": [
          {
            "RowType": "Header",
            "Title": "Income",
            "Cells": [
              {
                "Value": "Income"
              }
            ],
            "Rows": [
              {
                "RowType": "Row",
                "Cells": [
                  {
                    "Value": "Sales"
                  },
                  {
                    "Value": "1000.00"
                  }
                ]
              }
            ]
          },
          {
            "RowType": "Header",
            "Title": "Expenses",
            "Cells": [
              {
                "Value": "Expenses"
              }
            ],
            "Rows": [
              {
                "RowType": "Row",
                "Cells": [
                  {
                    "Value": "Rent"
                  },
                  {
                    "Value": "500.00"
                  }
                ]
              }
            ]
          },
          {
            "RowType": "Header",
            "Title": "Net Profit",
            "Cells": [
              {
                "Value": "Net Profit"
              },
              {
                "Value": "500.00"
              }
            ]
          }
        ]
      }
    ]
  }
}
```

### Custom API Call

Make a custom API call to the Xero API.

#### Input

```json
{
  "endpoint": "getContacts",
  "method": "GET"
}
```

#### Parameters

- **endpoint** (required): The Xero API endpoint to call (e.g., "getContacts", "getInvoices")
- **method** (required): The HTTP method to use. Options: "GET", "POST", "PUT", "DELETE". Default: "GET"
- **data** (optional): The request data (for POST, PUT methods)

#### Output

```json
{
  "Contacts": [
    {
      "ContactID": "00000000-0000-0000-0000-000000000000",
      "Name": "John Doe",
      "EmailAddress": "john.doe@example.com"
    }
  ]
}
```

## Triggers

### New Invoice

Triggers when a new invoice is created in Xero.

#### Output

```json
{
  "invoice": {
    "InvoiceID": "00000000-0000-0000-0000-000000000000",
    "Type": "ACCREC",
    "Contact": {
      "ContactID": "00000000-0000-0000-0000-000000000000",
      "Name": "John Doe"
    },
    "Date": "2023-12-01",
    "DueDate": "2023-12-31",
    "Status": "AUTHORISED",
    "LineAmountTypes": "Exclusive",
    "LineItems": [
      {
        "Description": "Consulting Services",
        "Quantity": 2,
        "UnitAmount": 100,
        "AccountCode": "200",
        "LineAmount": 200
      }
    ],
    "SubTotal": 200,
    "TotalTax": 0,
    "Total": 200
  }
}
```

## Resources

- [Xero API Documentation](https://developer.xero.com/documentation/)
- [Xero Developer Dashboard](https://developer.xero.com/app/dashboard)
- [Xero OAuth 2.0 Guide](https://developer.xero.com/documentation/guides/oauth2/auth-flow)
