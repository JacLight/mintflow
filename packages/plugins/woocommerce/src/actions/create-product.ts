import { wooCommon } from '../common/index.js';

export const wooCreateProduct = {
  name: 'create_product',
  displayName: 'Create Product',
  description: 'Creates a new product in WooCommerce',
  
  inputSchema: {
    type: 'object',
    required: ['name'],
    properties: {
      name: {
        type: 'string',
        description: 'The name of the product',
      },
      type: {
        type: 'string',
        description: 'Product type',
        enum: ['simple', 'grouped', 'external', 'variable'],
        default: 'simple',
      },
      regular_price: {
        type: 'string',
        description: 'Product regular price',
      },
      sale_price: {
        type: 'string',
        description: 'Product sale price',
      },
      description: {
        type: 'string',
        description: 'Product description',
      },
      short_description: {
        type: 'string',
        description: 'Product short description',
      },
      categories: {
        type: 'array',
        description: 'List of categories',
        items: {
          type: 'object',
          properties: {
            id: {
              type: 'number',
              description: 'Category ID',
            },
          },
        },
      },
      images: {
        type: 'array',
        description: 'List of images',
        items: {
          type: 'object',
          properties: {
            src: {
              type: 'string',
              description: 'Image URL',
            },
            name: {
              type: 'string',
              description: 'Image name',
            },
            alt: {
              type: 'string',
              description: 'Image alternative text',
            },
          },
        },
      },
      sku: {
        type: 'string',
        description: 'Product SKU',
      },
      manage_stock: {
        type: 'boolean',
        description: 'Whether to manage stock or not',
      },
      stock_quantity: {
        type: 'number',
        description: 'Stock quantity',
      },
      stock_status: {
        type: 'string',
        description: 'Stock status',
        enum: ['instock', 'outofstock', 'onbackorder'],
        default: 'instock',
      },
      weight: {
        type: 'string',
        description: 'Product weight',
      },
      dimensions: {
        type: 'object',
        description: 'Product dimensions',
        properties: {
          length: {
            type: 'string',
            description: 'Product length',
          },
          width: {
            type: 'string',
            description: 'Product width',
          },
          height: {
            type: 'string',
            description: 'Product height',
          },
        },
      },
      shipping_class: {
        type: 'string',
        description: 'Shipping class slug',
      },
      tax_status: {
        type: 'string',
        description: 'Tax status',
        enum: ['taxable', 'shipping', 'none'],
        default: 'taxable',
      },
      tax_class: {
        type: 'string',
        description: 'Tax class',
      },
      sold_individually: {
        type: 'boolean',
        description: 'Whether to sell individually or not',
      },
      reviews_allowed: {
        type: 'boolean',
        description: 'Whether to allow reviews or not',
      },
      status: {
        type: 'string',
        description: 'Product status',
        enum: ['draft', 'pending', 'private', 'publish'],
        default: 'publish',
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
        description: 'The created product data',
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
      '/wp-json/wc/v3/products',
      auth,
      input
    );
  },
};
