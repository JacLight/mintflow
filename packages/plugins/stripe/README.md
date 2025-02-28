# Stripe Plugin for MintFlow

This plugin provides integration with the Stripe API, allowing you to process payments, manage customers, subscriptions, products, and prices.

## Features

- Create and manage customers
- Create payment intents for one-time payments
- Create and manage subscriptions for recurring payments
- Create and manage products and prices
- Retrieve and list Stripe resources

## Authentication

To use this plugin, you need a Stripe API secret key. You can find your API keys in the [Stripe Dashboard](https://dashboard.stripe.com/apikeys).

There are two types of API keys:

- **Test keys**: Use these for development and testing. They start with `sk_test_`.
- **Live keys**: Use these for production. They start with `sk_live_`.

**Important**: Keep your secret API keys confidential. Never expose them in client-side code or public repositories.

## Usage

### Create a Customer

```javascript
{
  "action": "create_customer",
  "token": "sk_test_your_stripe_secret_key",
  "email": "customer@example.com",
  "name": "John Doe", // Optional
  "description": "Customer from MintFlow", // Optional
  "phone": "+1234567890", // Optional
  "address": { // Optional
    "line1": "123 Main St",
    "city": "San Francisco",
    "state": "CA",
    "postal_code": "94111",
    "country": "US"
  },
  "metadata": { // Optional
    "user_id": "12345",
    "source": "mintflow"
  }
}
```

### Create a Payment Intent

```javascript
{
  "action": "create_payment_intent",
  "token": "sk_test_your_stripe_secret_key",
  "amount": 1000, // Amount in cents (e.g., 1000 = $10.00)
  "currency": "usd",
  "description": "Payment for order #1234", // Optional
  "customer": "cus_customer_id", // Optional
  "payment_method": "pm_payment_method_id", // Optional
  "receipt_email": "customer@example.com", // Optional
  "metadata": { // Optional
    "order_id": "1234",
    "product_name": "Premium Plan"
  }
}
```

### Create a Subscription

```javascript
{
  "action": "create_subscription",
  "token": "sk_test_your_stripe_secret_key",
  "customer": "cus_customer_id",
  "price": "price_price_id",
  "quantity": 1, // Optional, default: 1
  "metadata": { // Optional
    "plan": "premium",
    "user_id": "12345"
  }
}
```

### Create a Product

```javascript
{
  "action": "create_product",
  "token": "sk_test_your_stripe_secret_key",
  "name": "Premium Plan",
  "description": "Access to all premium features", // Optional
  "active": true, // Optional, default: true
  "metadata": { // Optional
    "product_category": "subscription",
    "features": "all_access"
  }
}
```

### Create a Price

```javascript
{
  "action": "create_price",
  "token": "sk_test_your_stripe_secret_key",
  "product": "prod_product_id",
  "unit_amount": 1999, // Amount in cents (e.g., 1999 = $19.99)
  "currency": "usd",
  "recurring": { // Optional, for recurring prices
    "interval": "month", // day, week, month, or year
    "interval_count": 1 // Optional, default: 1
  },
  "active": true, // Optional, default: true
  "metadata": { // Optional
    "tier": "premium",
    "features": "all_access"
  }
}
```

### Get a Customer

```javascript
{
  "action": "get_customer",
  "token": "sk_test_your_stripe_secret_key",
  "customerId": "cus_customer_id"
}
```

### Get a Payment Intent

```javascript
{
  "action": "get_payment_intent",
  "token": "sk_test_your_stripe_secret_key",
  "paymentIntentId": "pi_payment_intent_id"
}
```

### Get a Subscription

```javascript
{
  "action": "get_subscription",
  "token": "sk_test_your_stripe_secret_key",
  "subscriptionId": "sub_subscription_id"
}
```

### Get a Product

```javascript
{
  "action": "get_product",
  "token": "sk_test_your_stripe_secret_key",
  "productId": "prod_product_id"
}
```

### Get a Price

```javascript
{
  "action": "get_price",
  "token": "sk_test_your_stripe_secret_key",
  "priceId": "price_price_id"
}
```

### List Customers

```javascript
{
  "action": "list_customers",
  "token": "sk_test_your_stripe_secret_key",
  "email": "customer@example.com", // Optional, filter by email
  "limit": 10 // Optional, default: 10
}
```

### List Payment Intents

```javascript
{
  "action": "list_payment_intents",
  "token": "sk_test_your_stripe_secret_key",
  "customer": "cus_customer_id", // Optional, filter by customer
  "limit": 10 // Optional, default: 10
}
```

### List Subscriptions

```javascript
{
  "action": "list_subscriptions",
  "token": "sk_test_your_stripe_secret_key",
  "customer": "cus_customer_id", // Optional, filter by customer
  "status": "active", // Optional, filter by status
  "limit": 10 // Optional, default: 10
}
```

### List Products

```javascript
{
  "action": "list_products",
  "token": "sk_test_your_stripe_secret_key",
  "active": true, // Optional, filter by active status
  "limit": 10 // Optional, default: 10
}
```

### List Prices

```javascript
{
  "action": "list_prices",
  "token": "sk_test_your_stripe_secret_key",
  "product": "prod_product_id", // Optional, filter by product
  "active": true, // Optional, filter by active status
  "limit": 10 // Optional, default: 10
}
```

## Response Examples

### Customer Response

```json
{
  "id": "cus_1234567890",
  "name": "John Doe",
  "email": "customer@example.com",
  "description": "Customer from MintFlow",
  "phone": "+1234567890",
  "address": {
    "line1": "123 Main St",
    "city": "San Francisco",
    "state": "CA",
    "postal_code": "94111",
    "country": "US"
  },
  "metadata": {
    "user_id": "12345",
    "source": "mintflow"
  },
  "created": 1609459200
}
```

### Payment Intent Response

```json
{
  "id": "pi_1234567890",
  "amount": 1000,
  "currency": "usd",
  "status": "requires_payment_method",
  "description": "Payment for order #1234",
  "customer": "cus_1234567890",
  "payment_method": null,
  "receipt_email": "customer@example.com",
  "metadata": {
    "order_id": "1234",
    "product_name": "Premium Plan"
  },
  "created": 1609459200
}
```

### Subscription Response

```json
{
  "id": "sub_1234567890",
  "customer": "cus_1234567890",
  "status": "active",
  "current_period_start": 1609459200,
  "current_period_end": 1612137600,
  "items": {
    "data": [
      {
        "id": "si_1234567890",
        "price": {
          "id": "price_1234567890",
          "product": "prod_1234567890",
          "unit_amount": 1999,
          "currency": "usd",
          "recurring": {
            "interval": "month",
            "interval_count": 1
          }
        },
        "quantity": 1
      }
    ]
  },
  "metadata": {
    "plan": "premium",
    "user_id": "12345"
  },
  "created": 1609459200
}
```

### Product Response

```json
{
  "id": "prod_1234567890",
  "name": "Premium Plan",
  "description": "Access to all premium features",
  "active": true,
  "metadata": {
    "product_category": "subscription",
    "features": "all_access"
  },
  "created": 1609459200
}
```

### Price Response

```json
{
  "id": "price_1234567890",
  "product": "prod_1234567890",
  "unit_amount": 1999,
  "currency": "usd",
  "recurring": {
    "interval": "month",
    "interval_count": 1
  },
  "active": true,
  "metadata": {
    "tier": "premium",
    "features": "all_access"
  },
  "created": 1609459200
}
```

## Error Handling

The plugin will throw errors in the following cases:

- Missing required parameters
- Invalid API key
- API rate limits exceeded
- Resource not found
- Validation errors from Stripe

## Limitations

- This plugin requires a valid Stripe API key
- API rate limits apply as per Stripe's policies
- Some operations may require additional verification or features enabled on your Stripe account
- For security reasons, this plugin should only be used in server-side contexts

## Documentation

For more information about the Stripe API, refer to the [official documentation](https://stripe.com/docs/api).
