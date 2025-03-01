# InvoiceNinja Plugin for MintFlow

The InvoiceNinja plugin for MintFlow provides integration with InvoiceNinja's open-source invoicing, billing, and accounting platform, allowing you to automate client management, invoice creation, and payment tracking.

## Features

- **Client Management**: Retrieve client information
- **Invoice Management**: Create and manage invoices
- **Payment Tracking**: Retrieve payment information
- **Polling Integration**: Trigger workflows when new invoices or payments are created
- **Custom API Access**: Make custom API calls to the InvoiceNinja API

## Authentication

The InvoiceNinja plugin requires API token authentication with the following credentials:

1. **API Token**: Your InvoiceNinja API token
2. **Base URL**: The base URL of your InvoiceNinja instance

To obtain these credentials:

1. Log in to your InvoiceNinja instance
2. Go to Settings > API Tokens
3. Create a new API token with the necessary permissions
4. Copy the token and use it for authentication

## Actions

### Get Client

Retrieve a client from InvoiceNinja by ID.

#### Input

```json
{
  "clientId": "1",
  "includeContacts": true
}
```

#### Parameters

- **clientId** (required): The ID of the client to retrieve
- **includeContacts** (optional): Whether to include contact information. Default: true

#### Output

```json
{
  "client": {
    "id": "1",
    "name": "John Doe",
    "number": "CLIENT-0001",
    "balance": 0,
    "paid_to_date": 0,
    "address1": "123 Main St",
    "address2": "",
    "city": "Anytown",
    "state": "CA",
    "postal_code": "12345",
    "country_id": "1",
    "phone": "555-555-5555",
    "private_notes": "",
    "website": "https://example.com",
    "industry_id": null,
    "size_id": null,
    "is_deleted": false,
    "vat_number": "",
    "id_number": "",
    "currency_id": "1",
    "settings": {
      "currency_id": "1"
    },
    "contacts": [
      {
        "id": "1",
        "first_name": "John",
        "last_name": "Doe",
        "email": "john.doe@example.com",
        "phone": "555-555-5555",
        "is_primary": true
      }
    ]
  }
}
```

### Create Invoice

Create a new invoice in InvoiceNinja.

#### Input

```json
{
  "clientId": "1",
  "lineItems": [
    {
      "productKey": "Consulting",
      "notes": "Consulting Services",
      "cost": 100,
      "quantity": 2
    }
  ],
  "date": "2023-12-01",
  "dueDate": "2023-12-31",
  "publicNotes": "Thank you for your business",
  "emailInvoice": false
}
```

#### Parameters

- **clientId** (required): The ID of the client for the invoice
- **lineItems** (required): Array of line items for the invoice
  - **productKey** (required): The product key or name
  - **notes** (optional): The description of the item
  - **cost** (required): The cost of the item
  - **quantity** (optional): The quantity of the item. Default: 1
  - **taxRate1** (optional): The first tax rate for the item
  - **taxRate2** (optional): The second tax rate for the item
- **invoiceNumber** (optional): The invoice number
- **poNumber** (optional): The purchase order number
- **date** (optional): The invoice date (YYYY-MM-DD)
- **dueDate** (optional): The due date of the invoice (YYYY-MM-DD)
- **isAmountDiscount** (optional): Whether the discount is a fixed amount (true) or a percentage (false). Default: false
- **discount** (optional): The discount amount or percentage
- **publicNotes** (optional): Public notes visible to the client
- **privateNotes** (optional): Private notes not visible to the client
- **emailInvoice** (optional): Whether to email the invoice to the client. Default: false

#### Output

```json
{
  "invoice": {
    "id": "1",
    "number": "INV-0001",
    "client_id": "1",
    "date": "2023-12-01",
    "due_date": "2023-12-31",
    "amount": 200,
    "balance": 200,
    "status_id": "1",
    "public_notes": "Thank you for your business",
    "private_notes": "",
    "line_items": [
      {
        "product_key": "Consulting",
        "notes": "Consulting Services",
        "cost": 100,
        "quantity": 2,
        "line_total": 200
      }
    ]
  }
}
```

### Get Payment

Retrieve a payment from InvoiceNinja by ID.

#### Input

```json
{
  "paymentId": "1",
  "includeInvoices": true
}
```

#### Parameters

- **paymentId** (required): The ID of the payment to retrieve
- **includeInvoices** (optional): Whether to include invoice information. Default: true

#### Output

```json
{
  "payment": {
    "id": "1",
    "client_id": "1",
    "amount": 100,
    "date": "2023-12-01",
    "transaction_reference": "TRANS-123",
    "private_notes": "",
    "is_deleted": false,
    "payment_type_id": "1",
    "invoices": [
      {
        "id": "1",
        "amount": 100,
        "invoice_id": "1",
        "invoice_number": "INV-0001"
      }
    ]
  }
}
```

### Custom API Call

Make a custom API call to the InvoiceNinja API.

#### Input

```json
{
  "endpoint": "api/v1/clients",
  "method": "GET",
  "params": {
    "per_page": 10,
    "page": 1
  }
}
```

#### Parameters

- **endpoint** (required): The InvoiceNinja API endpoint to call (e.g., "api/v1/clients", "api/v1/invoices")
- **method** (required): The HTTP method to use. Options: "GET", "POST", "PUT", "DELETE". Default: "GET"
- **data** (optional): The request data (for POST, PUT methods)
- **params** (optional): The query parameters to include in the request

#### Output

```json
{
  "data": {
    "data": [
      {
        "id": "1",
        "name": "John Doe",
        "email": "john.doe@example.com"
      }
    ],
    "meta": {
      "pagination": {
        "total": 1,
        "count": 1,
        "per_page": 10,
        "current_page": 1,
        "total_pages": 1
      }
    }
  }
}
```

## Triggers

### New Invoice

Triggers when a new invoice is created in InvoiceNinja.

#### Output

```json
{
  "invoice": {
    "id": "1",
    "number": "INV-0001",
    "client_id": "1",
    "date": "2023-12-01",
    "due_date": "2023-12-31",
    "amount": 200,
    "balance": 200,
    "status_id": "1",
    "public_notes": "Thank you for your business",
    "private_notes": "",
    "line_items": [
      {
        "product_key": "Consulting",
        "notes": "Consulting Services",
        "cost": 100,
        "quantity": 2,
        "line_total": 200
      }
    ]
  }
}
```

### New Payment

Triggers when a new payment is created in InvoiceNinja.

#### Output

```json
{
  "payment": {
    "id": "1",
    "client_id": "1",
    "amount": 100,
    "date": "2023-12-01",
    "transaction_reference": "TRANS-123",
    "private_notes": "",
    "is_deleted": false,
    "payment_type_id": "1",
    "invoices": [
      {
        "id": "1",
        "amount": 100,
        "invoice_id": "1",
        "invoice_number": "INV-0001"
      }
    ]
  }
}
```

## Resources

- [InvoiceNinja API Documentation](https://invoice-ninja.readthedocs.io/en/latest/api.html)
- [InvoiceNinja GitHub Repository](https://github.com/invoiceninja/invoiceninja)
- [InvoiceNinja Website](https://www.invoiceninja.com/)
