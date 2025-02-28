# PayPal Plugin for MintFlow

This plugin provides integration with the PayPal API, allowing you to process payments, handle refunds, and manage recurring billing through subscriptions.

## Features

- Create and execute payments
- Get payment details
- Refund sales
- Create and manage billing plans
- Create and manage billing agreements (subscriptions)
- List payments and billing plans

## Authentication

To use this plugin, you need a PayPal API access token. There are two environments:

- **Sandbox**: For testing and development
- **Live**: For production use

### How to obtain a PayPal API token

1. Go to the [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
2. Create a developer account if you don't have one
3. Create a new app in the "My Apps & Credentials" section
4. Get your Client ID and Secret
5. Use these credentials to obtain an access token via the OAuth 2.0 flow

## Usage

### Create a Payment

```javascript
{
  "action": "create_payment",
  "token": "your-paypal-api-token",
  "intent": "sale", // Options: sale, authorize, order
  "payer": {
    "payment_method": "paypal" // Options: paypal, credit_card, bank
  },
  "transactions": [
    {
      "amount": {
        "total": "10.00",
        "currency": "USD",
        "details": { // Optional
          "subtotal": "8.00",
          "tax": "1.00",
          "shipping": "1.00"
        }
      },
      "description": "Payment for order #1234", // Optional
      "item_list": { // Optional
        "items": [
          {
            "name": "Product Name",
            "sku": "SKU123", // Optional
            "price": "8.00",
            "currency": "USD",
            "quantity": 1
          }
        ]
      }
    }
  ],
  "redirect_urls": {
    "return_url": "https://example.com/success",
    "cancel_url": "https://example.com/cancel"
  }
}
```

### Execute a Payment

After the payer approves the payment, execute it to complete the transaction:

```javascript
{
  "action": "execute_payment",
  "token": "your-paypal-api-token",
  "paymentId": "PAY-1234567890",
  "payerId": "PAYER-1234567890"
}
```

### Get Payment Details

```javascript
{
  "action": "get_payment",
  "token": "your-paypal-api-token",
  "paymentId": "PAY-1234567890"
}
```

### Refund a Sale

```javascript
{
  "action": "refund_sale",
  "token": "your-paypal-api-token",
  "saleId": "SALE-1234567890",
  "amount": { // Optional, for partial refunds
    "total": "5.00",
    "currency": "USD"
  },
  "description": "Refund for order #1234" // Optional
}
```

### Create a Billing Plan

```javascript
{
  "action": "create_billing_plan",
  "token": "your-paypal-api-token",
  "name": "Monthly Subscription",
  "description": "Monthly subscription plan", // Optional
  "type": "INFINITE", // Options: FIXED, INFINITE
  "payment_definitions": [
    {
      "name": "Regular Payment",
      "type": "REGULAR", // Options: REGULAR, TRIAL
      "frequency": "MONTH", // Options: DAY, WEEK, MONTH, YEAR
      "frequency_interval": "1",
      "amount": {
        "value": "9.99",
        "currency": "USD"
      },
      "cycles": "0" // 0 for infinite
    }
  ],
  "merchant_preferences": {
    "setup_fee": { // Optional
      "value": "0",
      "currency": "USD"
    },
    "return_url": "https://example.com/success",
    "cancel_url": "https://example.com/cancel",
    "auto_bill_amount": "YES", // Options: YES, NO
    "initial_fail_amount_action": "CONTINUE", // Options: CONTINUE, CANCEL
    "max_fail_attempts": "3"
  }
}
```

### Activate a Billing Plan

```javascript
{
  "action": "activate_billing_plan",
  "token": "your-paypal-api-token",
  "planId": "P-1234567890"
}
```

### Get Billing Plan Details

```javascript
{
  "action": "get_billing_plan",
  "token": "your-paypal-api-token",
  "planId": "P-1234567890"
}
```

### Create a Billing Agreement

```javascript
{
  "action": "create_billing_agreement",
  "token": "your-paypal-api-token",
  "name": "Monthly Subscription Agreement",
  "description": "Agreement for monthly subscription", // Optional
  "start_date": "2023-01-01T00:00:00Z",
  "plan": {
    "id": "P-1234567890"
  },
  "payer": {
    "payment_method": "paypal"
  }
}
```

### Execute a Billing Agreement

After the payer approves the agreement, execute it to activate the subscription:

```javascript
{
  "action": "execute_billing_agreement",
  "token": "your-paypal-api-token",
  "agreementToken": "EC-1234567890"
}
```

### Get Billing Agreement Details

```javascript
{
  "action": "get_billing_agreement",
  "token": "your-paypal-api-token",
  "agreementId": "I-1234567890"
}
```

### Cancel a Billing Agreement

```javascript
{
  "action": "cancel_billing_agreement",
  "token": "your-paypal-api-token",
  "agreementId": "I-1234567890",
  "note": "Cancellation requested by customer"
}
```

### List Payments

```javascript
{
  "action": "list_payments",
  "token": "your-paypal-api-token",
  "count": 10, // Optional, default: 10
  "start_index": 0, // Optional
  "sort_by": "create_time", // Optional
  "sort_order": "desc", // Optional, options: asc, desc
  "start_time": "2023-01-01T00:00:00Z", // Optional
  "end_time": "2023-12-31T23:59:59Z" // Optional
}
```

### List Billing Plans

```javascript
{
  "action": "list_billing_plans",
  "token": "your-paypal-api-token",
  "page_size": 10, // Optional, default: 10
  "page": 1, // Optional, default: 1
  "status": "ACTIVE" // Optional, options: CREATED, ACTIVE, INACTIVE, ALL
}
```

## Response Examples

### Create Payment Response

```json
{
  "id": "PAY-1234567890",
  "intent": "sale",
  "state": "created",
  "payer": {
    "payment_method": "paypal"
  },
  "transactions": [
    {
      "amount": {
        "total": "10.00",
        "currency": "USD",
        "details": {
          "subtotal": "8.00",
          "tax": "1.00",
          "shipping": "1.00"
        }
      },
      "description": "Payment for order #1234"
    }
  ],
  "create_time": "2023-01-01T00:00:00Z",
  "links": [
    {
      "href": "https://api.sandbox.paypal.com/v1/payments/payment/PAY-1234567890",
      "rel": "self",
      "method": "GET"
    },
    {
      "href": "https://www.sandbox.paypal.com/cgi-bin/webscr?cmd=_express-checkout&token=EC-1234567890",
      "rel": "approval_url",
      "method": "REDIRECT"
    },
    {
      "href": "https://api.sandbox.paypal.com/v1/payments/payment/PAY-1234567890/execute",
      "rel": "execute",
      "method": "POST"
    }
  ]
}
```

### Execute Payment Response

```json
{
  "id": "PAY-1234567890",
  "intent": "sale",
  "state": "approved",
  "payer": {
    "payment_method": "paypal",
    "status": "VERIFIED",
    "payer_info": {
      "email": "buyer@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "payer_id": "PAYER-1234567890"
    }
  },
  "transactions": [
    {
      "amount": {
        "total": "10.00",
        "currency": "USD"
      },
      "related_resources": [
        {
          "sale": {
            "id": "SALE-1234567890",
            "state": "completed",
            "amount": {
              "total": "10.00",
              "currency": "USD"
            },
            "payment_mode": "INSTANT_TRANSFER",
            "create_time": "2023-01-01T00:00:00Z",
            "update_time": "2023-01-01T00:00:00Z"
          }
        }
      ]
    }
  ],
  "create_time": "2023-01-01T00:00:00Z",
  "update_time": "2023-01-01T00:00:00Z"
}
```

### Refund Response

```json
{
  "id": "REFUND-1234567890",
  "amount": {
    "total": "10.00",
    "currency": "USD"
  },
  "state": "completed",
  "sale_id": "SALE-1234567890",
  "parent_payment": "PAY-1234567890",
  "create_time": "2023-01-01T00:00:00Z",
  "update_time": "2023-01-01T00:00:00Z"
}
```

### Create Billing Plan Response

```json
{
  "id": "P-1234567890",
  "name": "Monthly Subscription",
  "description": "Monthly subscription plan",
  "type": "INFINITE",
  "state": "CREATED",
  "payment_definitions": [
    {
      "id": "PD-1234567890",
      "name": "Regular Payment",
      "type": "REGULAR",
      "frequency": "MONTH",
      "frequency_interval": "1",
      "amount": {
        "value": "9.99",
        "currency": "USD"
      },
      "cycles": "0"
    }
  ],
  "merchant_preferences": {
    "setup_fee": {
      "value": "0",
      "currency": "USD"
    },
    "return_url": "https://example.com/success",
    "cancel_url": "https://example.com/cancel",
    "auto_bill_amount": "YES",
    "initial_fail_amount_action": "CONTINUE",
    "max_fail_attempts": "3"
  },
  "create_time": "2023-01-01T00:00:00Z",
  "update_time": "2023-01-01T00:00:00Z"
}
```

### Create Billing Agreement Response

```json
{
  "id": "token",
  "links": [
    {
      "href": "https://www.sandbox.paypal.com/cgi-bin/webscr?cmd=_express-checkout&token=EC-1234567890",
      "rel": "approval_url",
      "method": "REDIRECT"
    },
    {
      "href": "https://api.sandbox.paypal.com/v1/payments/billing-agreements/EC-1234567890/agreement-execute",
      "rel": "execute",
      "method": "POST"
    }
  ]
}
```

### Execute Billing Agreement Response

```json
{
  "id": "I-1234567890",
  "state": "ACTIVE",
  "name": "Monthly Subscription Agreement",
  "description": "Agreement for monthly subscription",
  "start_date": "2023-01-01T00:00:00Z",
  "agreement_details": {
    "outstanding_balance": {
      "value": "0",
      "currency": "USD"
    },
    "cycles_remaining": "0",
    "cycles_completed": "0",
    "next_billing_date": "2023-02-01T00:00:00Z",
    "last_payment_date": "2023-01-01T00:00:00Z",
    "last_payment_amount": {
      "value": "9.99",
      "currency": "USD"
    },
    "final_payment_date": "1970-01-01T00:00:00Z",
    "failed_payment_count": "0"
  },
  "payer": {
    "payment_method": "paypal",
    "status": "VERIFIED",
    "payer_info": {
      "email": "buyer@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "payer_id": "PAYER-1234567890"
    }
  },
  "plan": {
    "id": "P-1234567890",
    "state": "ACTIVE",
    "name": "Monthly Subscription",
    "description": "Monthly subscription plan",
    "type": "INFINITE",
    "payment_definitions": [
      {
        "id": "PD-1234567890",
        "name": "Regular Payment",
        "type": "REGULAR",
        "frequency": "MONTH",
        "amount": {
          "value": "9.99",
          "currency": "USD"
        },
        "cycles": "0",
        "frequency_interval": "1"
      }
    ]
  },
  "create_time": "2023-01-01T00:00:00Z",
  "update_time": "2023-01-01T00:00:00Z"
}
```

## Error Handling

The plugin will throw errors in the following cases:

- Missing required parameters
- Invalid API token
- API rate limits exceeded
- Resource not found
- Validation errors from PayPal

## Limitations

- This plugin requires a valid PayPal API token
- API rate limits apply as per PayPal's policies
- Some operations may require additional verification or features enabled on your PayPal account
- For security reasons, this plugin should only be used in server-side contexts

## Documentation

For more information about the PayPal API, refer to the [official documentation](https://developer.paypal.com/docs/api/overview/).
