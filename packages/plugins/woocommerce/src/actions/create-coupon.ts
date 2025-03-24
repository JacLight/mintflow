import { wooCommon } from '../common/index.js';

export const wooCreateCoupon = {
  name: 'create_coupon',
  displayName: 'Create Coupon',
  description: 'Creates a new coupon in WooCommerce',
  
  inputSchema: {
    type: 'object',
    required: ['code'],
    properties: {
      code: {
        type: 'string',
        description: 'The coupon code',
      },
      discount_type: {
        type: 'string',
        description: 'The discount type',
        enum: ['percent', 'fixed_cart', 'fixed_product'],
        default: 'percent',
      },
      amount: {
        type: 'string',
        description: 'The coupon amount',
      },
      individual_use: {
        type: 'boolean',
        description: 'Whether the coupon can be used in conjunction with other coupons',
        default: false,
      },
      exclude_sale_items: {
        type: 'boolean',
        description: 'Whether the coupon should not apply to items on sale',
        default: false,
      },
      minimum_amount: {
        type: 'string',
        description: 'Minimum order amount that needs to be in the cart before the coupon applies',
      },
      maximum_amount: {
        type: 'string',
        description: 'Maximum order amount allowed when using the coupon',
      },
      product_ids: {
        type: 'array',
        description: 'List of product IDs the coupon can be used on',
        items: {
          type: 'number',
        },
      },
      excluded_product_ids: {
        type: 'array',
        description: 'List of product IDs the coupon cannot be used on',
        items: {
          type: 'number',
        },
      },
      product_categories: {
        type: 'array',
        description: 'List of category IDs the coupon can be used on',
        items: {
          type: 'number',
        },
      },
      excluded_product_categories: {
        type: 'array',
        description: 'List of category IDs the coupon cannot be used on',
        items: {
          type: 'number',
        },
      },
      email_restrictions: {
        type: 'array',
        description: 'List of email addresses that can use this coupon',
        items: {
          type: 'string',
        },
      },
      usage_limit: {
        type: 'number',
        description: 'How many times the coupon can be used in total',
      },
      usage_limit_per_user: {
        type: 'number',
        description: 'How many times the coupon can be used per customer',
      },
      limit_usage_to_x_items: {
        type: 'number',
        description: 'Max number of items in the cart the coupon can be applied to',
      },
      free_shipping: {
        type: 'boolean',
        description: 'Whether the coupon grants free shipping',
        default: false,
      },
      date_expires: {
        type: 'string',
        description: 'The coupon expiry date in ISO 8601 format (YYYY-MM-DD)',
      },
    },
  },
  
  outputSchema: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        description: 'Whether the operation was successful',
      },
      data: {
        type: 'object',
        description: 'The created coupon data',
      },
      error: {
        type: 'string',
        description: 'The error message if the operation failed',
      },
    },
  },
  
  async execute(input: any, auth: any) {
    return await wooCommon.makeRequest(
      'POST',
      '/wp-json/wc/v3/coupons',
      auth,
      input
    );
  },
};
