# WooCommerce Plugin for MintFlow

This plugin allows you to integrate MintFlow with WooCommerce, the popular e-commerce platform built on WordPress.

## Authentication

To use this plugin, you need to generate API credentials from your WooCommerce store:

1. Go to WooCommerce -> Settings -> Advanced tab -> REST API.
2. Click on Add Key to create a new key.
3. Enter the key description and change the permissions to Read/Write.
4. Click Generate Key.
5. Copy the Consumer Key and Consumer Secret into the authentication fields.

**Note**: The base URL of your WooCommerce instance needs to be on a secure (HTTPS) connection, or the plugin will not work even on local instances on the same device.

## Triggers

### Product Triggers

- **Product Created**: Triggers when a new product is created.
- **Product Updated**: Triggers when an existing product is updated.
- **Product Deleted**: Triggers when an existing product is deleted.

### Order Triggers

- **Order Created**: Triggers when a new order is created.
- **Order Updated**: Triggers when an existing order is updated.
- **Order Deleted**: Triggers when an existing order is deleted.

### Coupon Triggers

- **Coupon Created**: Triggers when a new coupon is created.
- **Coupon Updated**: Triggers when an existing coupon is updated.
- **Coupon Deleted**: Triggers when an existing coupon is deleted.

### Customer Triggers

- **Customer Created**: Triggers when a new customer is created.
- **Customer Updated**: Triggers when an existing customer is updated.
- **Customer Deleted**: Triggers when an existing customer is deleted.

## Actions

### Customer Actions

- **Create Customer**: Creates a new customer in WooCommerce.
- **Find Customer**: Finds a customer in WooCommerce by email or ID.

### Product Actions

- **Create Product**: Creates a new product in WooCommerce.
- **Find Product**: Finds a product in WooCommerce by ID or SKU.

### Coupon Actions

- **Create Coupon**: Creates a new coupon in WooCommerce.

### Other Actions

- **Custom API Call**: Make a custom API call to the WooCommerce API.

## Example Usage

### Creating a New Customer

```javascript
const result = await actions.woocommerce.create_customer({
  email: "customer@example.com",
  first_name: "John",
  last_name: "Doe",
  username: "johndoe",
  password: "securepassword",
  billing: {
    first_name: "John",
    last_name: "Doe",
    address_1: "123 Main St",
    city: "Anytown",
    state: "CA",
    postcode: "12345",
    country: "US",
    email: "customer@example.com",
    phone: "555-123-4567"
  }
});
```

### Creating a New Product

```javascript
const result = await actions.woocommerce.create_product({
  name: "My Awesome Product",
  type: "simple",
  regular_price: "19.99",
  description: "<p>This is an awesome product description.</p>",
  short_description: "Short product description",
  categories: [
    {
      id: 9
    }
  ],
  images: [
    {
      src: "https://example.com/images/product.jpg",
      name: "Product Image"
    }
  ]
});
```

### Listening for New Orders

Set up a trigger for "Order Created" to automatically run your flow whenever a new order is placed in your WooCommerce store.

## API Documentation

For more details on the WooCommerce REST API, refer to the [official documentation](https://woocommerce.github.io/woocommerce-rest-api-docs/).
