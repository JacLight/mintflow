# Shopify Plugin for MintFlow

The Shopify plugin provides integration with Shopify's e-commerce platform, allowing you to manage products, customers, orders, and more.

## Features

- **Product Management**: Create, read, update products and variants
- **Customer Management**: Create, read, update customers and view their orders
- **Order Management**: Create, update, close, and cancel orders
- **Transaction Management**: Create and retrieve transactions
- **Fulfillment Management**: Retrieve fulfillments and create fulfillment events
- **Inventory Management**: Adjust inventory levels
- **Webhook Processing**: Process Shopify webhook events

## Authentication

This plugin requires authentication with Shopify. You'll need:

1. Your Shopify shop name (e.g., if your shop URL is example.myshopify.com, use "example")
2. An Admin API access token

To get an Admin API access token:

1. Log in to your Shopify admin
2. Go to Settings → Apps and sales channels
3. Click on "Develop apps"
4. Create a new app or select an existing one
5. Configure Admin API scopes (select the scopes you need)
6. Install the app in your store
7. Copy the Admin Access Token

## Usage

### Get Products

Retrieve a list of products from your Shopify store:

```json
{
  "action": "get_products",
  "shopName": "your-shop-name",
  "adminToken": "your-admin-token"
}
```

You can filter products by title or date:

```json
{
  "action": "get_products",
  "shopName": "your-shop-name",
  "adminToken": "your-admin-token",
  "productTitle": "T-shirt",
  "createdAtMin": "2023-01-01T00:00:00Z",
  "updatedAtMin": "2023-01-01T00:00:00Z"
}
```

### Create a Product

Create a new product in your Shopify store:

```json
{
  "action": "create_product",
  "shopName": "your-shop-name",
  "adminToken": "your-admin-token",
  "productData": {
    "title": "New Product",
    "body_html": "<p>Product description</p>",
    "vendor": "Your Brand",
    "product_type": "Apparel",
    "status": "draft",
    "tags": "new, summer"
  }
}
```

### Get Customers

Retrieve a list of customers from your Shopify store:

```json
{
  "action": "get_customers",
  "shopName": "your-shop-name",
  "adminToken": "your-admin-token"
}
```

### Create an Order

Create a new order in your Shopify store:

```json
{
  "action": "create_order",
  "shopName": "your-shop-name",
  "adminToken": "your-admin-token",
  "orderData": {
    "email": "customer@example.com",
    "line_items": [
      {
        "variant_id": 12345678901234,
        "quantity": 1
      }
    ],
    "financial_status": "pending",
    "send_receipt": true
  }
}
```

### Process a Webhook

Process a webhook payload from Shopify:

```json
{
  "action": "process_webhook",
  "shopName": "your-shop-name",
  "adminToken": "your-admin-token",
  "webhookPayload": {
    "id": 123456789,
    "email": "customer@example.com",
    "first_name": "John",
    "last_name": "Doe"
  },
  "webhookTopic": "customers/create"
}
```

## Available Actions

### Customer Actions

- `get_customer`: Get a specific customer by ID
- `get_customers`: Get all customers
- `create_customer`: Create a new customer
- `update_customer`: Update an existing customer
- `get_customer_orders`: Get orders for a specific customer

### Product Actions

- `get_product`: Get a specific product by ID
- `get_products`: Get all products
- `create_product`: Create a new product
- `update_product`: Update an existing product
- `get_product_variant`: Get a specific product variant
- `upload_product_image`: Upload an image for a product

### Order Actions

- `create_order`: Create a new order
- `update_order`: Update an existing order
- `close_order`: Close an order
- `cancel_order`: Cancel an order
- `create_draft_order`: Create a draft order

### Transaction Actions

- `create_transaction`: Create a transaction for an order
- `get_transaction`: Get a specific transaction
- `get_transactions`: Get all transactions for an order

### Fulfillment Actions

- `get_fulfillment`: Get a specific fulfillment
- `get_fulfillments`: Get all fulfillments for an order
- `create_fulfillment_event`: Create a fulfillment event

### Other Actions

- `get_locations`: Get all locations
- `adjust_inventory_level`: Adjust inventory level for a product variant
- `create_collect`: Add a product to a collection
- `get_asset`: Get an asset from a theme

### Webhook Actions

- `process_webhook`: Process a webhook payload from Shopify

## Error Handling

The plugin provides detailed error messages for common issues:

- Invalid authentication credentials
- Missing required parameters
- Shopify API errors

## Limitations

- The plugin requires a valid Shopify Admin API access token
- Some operations may require specific Shopify API scopes
- The plugin uses Shopify Admin API version 2023-10

## Resources

- [Shopify Admin API Documentation](https://shopify.dev/docs/api/admin-rest)
- [Shopify Admin API Reference](https://shopify.dev/docs/api/admin-rest/2023-10/resources/product)
- [Shopify OAuth](https://shopify.dev/docs/apps/auth/oauth)
