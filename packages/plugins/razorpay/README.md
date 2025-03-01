# Razorpay Plugin for MintFlow

The Razorpay plugin for MintFlow provides integration with Razorpay's payment gateway, allowing you to create payment links and interact with the Razorpay API.

## Features

- **Create Payment Links**: Generate payment links that can be shared with customers
- **Custom API Calls**: Make custom API calls to the Razorpay API for advanced use cases
- **Secure Authentication**: Basic authentication using Razorpay API keys

## Authentication

The Razorpay plugin uses API key authentication. You'll need to:

1. Create a Razorpay account at [https://razorpay.com/](https://razorpay.com/)
2. Navigate to Settings > API Keys in your Razorpay Dashboard
3. Generate a new API key pair
4. Use the Key ID and Key Secret in your MintFlow workflow

## Actions

### Create Payment Link

Creates a payment link that can be shared with customers.

#### Input

```json
{
  "amount": 1000,
  "currency": "INR",
  "reference_id": "order_123",
  "description": "Payment for Order #123",
  "customer_name": "John Doe",
  "customer_contact": "+919876543210",
  "notify_sms": true,
  "customer_email": "john@example.com",
  "notify_email": true,
  "metafield_notes": "Premium Plan",
  "callback_url": "https://example.com/callback",
  "callback_method": "GET"
}
```

#### Output

```json
{
  "id": "plink_EXdKy9nT9ywKY4",
  "entity": "payment_link",
  "amount": 100000,
  "currency": "INR",
  "status": "created",
  "description": "Payment for Order #123",
  "short_url": "https://rzp.io/i/nxrHnLJ",
  "created_at": 1591097057,
  "expire_by": 1591183457
}
```

### Custom API Call

Make a custom API call to the Razorpay API.

#### Input

```json
{
  "method": "GET",
  "path": "payment_links",
  "queryParams": {
    "count": 10
  }
}
```

#### Output

```json
{
  "entity": "collection",
  "count": 1,
  "items": [
    {
      "id": "plink_EXdKy9nT9ywKY4",
      "entity": "payment_link",
      "amount": 100000,
      "currency": "INR",
      "status": "created",
      "description": "Payment for Order #123",
      "short_url": "https://rzp.io/i/nxrHnLJ",
      "created_at": 1591097057,
      "expire_by": 1591183457
    }
  ]
}
```

## Common Use Cases

### E-commerce Integration

- Create payment links for orders
- Track payment status
- Send payment links to customers via email or SMS

### Subscription Management

- Create recurring payment links
- Manage subscription plans
- Handle subscription cancellations

### Invoicing

- Generate invoices with payment links
- Track invoice payment status
- Send reminders for unpaid invoices

## Resources

- [Razorpay API Documentation](https://razorpay.com/docs/api/)
- [Razorpay Payment Links API](https://razorpay.com/docs/api/payment-links/)
- [Razorpay API Reference](https://razorpay.com/docs/api/api-reference/)
