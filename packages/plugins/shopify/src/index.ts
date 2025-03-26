import { ShopifyClient } from './client.js';
import {
    ShopifyAuth,
    ShopifyProductStatuses,
    ShopifyOrderFinancialStatuses,
    ShopifyTransactionKinds,
    ShopifyFulfillmentStatuses,
    ShopifyFulfillmentEventStatuses,
    WebhookPayload
} from './models.js';

// Create a default client instance with empty auth
const defaultClient = new ShopifyClient({
    shopName: '',
    adminToken: ''
});

const shopifyPlugin = {
    name: "Shopify",
    icon: "",
    description: "Ecommerce platform for online stores",
    groups: ["ecommerce"],
    tags: ["ecommerce","shop","store","product","order"],
    version: '1.0.0',
    id: "shopify",
    runner: "node",
    inputSchema: {
        type: "object",
        properties: {
            action: {
                type: 'string',
                enum: [
                    // Customer actions
                    'get_customer',
                    'get_customers',
                    'create_customer',
                    'update_customer',
                    'get_customer_orders',

                    // Product actions
                    'get_product',
                    'get_products',
                    'create_product',
                    'update_product',
                    'get_product_variant',
                    'upload_product_image',

                    // Order actions
                    'create_order',
                    'update_order',
                    'close_order',
                    'cancel_order',
                    'create_draft_order',

                    // Transaction actions
                    'create_transaction',
                    'get_transaction',
                    'get_transactions',

                    // Fulfillment actions
                    'get_fulfillment',
                    'get_fulfillments',
                    'create_fulfillment_event',

                    // Other actions
                    'get_locations',
                    'adjust_inventory_level',
                    'create_collect',
                    'get_asset',

                    // Webhook actions
                    'process_webhook'
                ],
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Action to perform on Shopify',
            },
            shopName: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Your Shopify shop name (e.g., if your shop URL is example.myshopify.com, enter "example")',
            },
            adminToken: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Your Shopify Admin API access token',
            },

            // Customer parameters
            customerId: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Customer ID',
                rules: [
                    { operation: 'notEqual', valueA: 'get_customer', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'update_customer', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'get_customer_orders', valueB: '{{action}}', action: 'hide' },
                ],
            },
            customerData: {
                type: 'object',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Customer data',
                rules: [
                    { operation: 'notEqual', valueA: 'create_customer', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'update_customer', valueB: '{{action}}', action: 'hide' },
                ],
            },

            // Product parameters
            productId: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Product ID',
                rules: [
                    { operation: 'notEqual', valueA: 'get_product', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'update_product', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'upload_product_image', valueB: '{{action}}', action: 'hide' },
                ],
            },
            productData: {
                type: 'object',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Product data',
                rules: [
                    { operation: 'notEqual', valueA: 'create_product', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'update_product', valueB: '{{action}}', action: 'hide' },
                ],
            },
            productTitle: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Product title',
                rules: [
                    { operation: 'notEqual', valueA: 'get_products', valueB: '{{action}}', action: 'hide' },
                ],
            },
            createdAtMin: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Filter products created after this date (ISO 8601 format)',
                rules: [
                    { operation: 'notEqual', valueA: 'get_products', valueB: '{{action}}', action: 'hide' },
                ],
            },
            updatedAtMin: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Filter products updated after this date (ISO 8601 format)',
                rules: [
                    { operation: 'notEqual', valueA: 'get_products', valueB: '{{action}}', action: 'hide' },
                ],
            },
            variantId: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Product variant ID',
                rules: [
                    { operation: 'notEqual', valueA: 'get_product_variant', valueB: '{{action}}', action: 'hide' },
                ],
            },
            productImage: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Product image URL or base64 data',
                rules: [
                    { operation: 'notEqual', valueA: 'upload_product_image', valueB: '{{action}}', action: 'hide' },
                ],
            },

            // Order parameters
            orderId: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Order ID',
                rules: [
                    { operation: 'notEqual', valueA: 'update_order', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'close_order', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'cancel_order', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'get_fulfillment', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'get_fulfillments', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'create_fulfillment_event', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'create_transaction', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'get_transaction', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'get_transactions', valueB: '{{action}}', action: 'hide' },
                ],
            },
            orderData: {
                type: 'object',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Order data',
                rules: [
                    { operation: 'notEqual', valueA: 'create_order', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'update_order', valueB: '{{action}}', action: 'hide' },
                ],
            },
            draftOrderData: {
                type: 'object',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Draft order data',
                rules: [
                    { operation: 'notEqual', valueA: 'create_draft_order', valueB: '{{action}}', action: 'hide' },
                ],
            },

            // Transaction parameters
            transactionId: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Transaction ID',
                rules: [
                    { operation: 'notEqual', valueA: 'get_transaction', valueB: '{{action}}', action: 'hide' },
                ],
            },
            transactionData: {
                type: 'object',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Transaction data',
                rules: [
                    { operation: 'notEqual', valueA: 'create_transaction', valueB: '{{action}}', action: 'hide' },
                ],
            },

            // Fulfillment parameters
            fulfillmentId: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Fulfillment ID',
                rules: [
                    { operation: 'notEqual', valueA: 'get_fulfillment', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'create_fulfillment_event', valueB: '{{action}}', action: 'hide' },
                ],
            },
            fulfillmentEventData: {
                type: 'object',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Fulfillment event data',
                rules: [
                    { operation: 'notEqual', valueA: 'create_fulfillment_event', valueB: '{{action}}', action: 'hide' },
                ],
            },

            // Inventory parameters
            inventoryItemId: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Inventory item ID',
                rules: [
                    { operation: 'notEqual', valueA: 'adjust_inventory_level', valueB: '{{action}}', action: 'hide' },
                ],
            },
            locationId: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Location ID',
                rules: [
                    { operation: 'notEqual', valueA: 'adjust_inventory_level', valueB: '{{action}}', action: 'hide' },
                ],
            },
            adjustment: {
                type: 'number',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Inventory adjustment amount',
                rules: [
                    { operation: 'notEqual', valueA: 'adjust_inventory_level', valueB: '{{action}}', action: 'hide' },
                ],
            },

            // Collect parameters
            collectData: {
                type: 'object',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Collect data (to add a product to a collection)',
                rules: [
                    { operation: 'notEqual', valueA: 'create_collect', valueB: '{{action}}', action: 'hide' },
                ],
            },

            // Asset parameters
            assetKey: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Asset key',
                rules: [
                    { operation: 'notEqual', valueA: 'get_asset', valueB: '{{action}}', action: 'hide' },
                ],
            },
            themeId: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Theme ID',
                rules: [
                    { operation: 'notEqual', valueA: 'get_asset', valueB: '{{action}}', action: 'hide' },
                ],
            },

            // Webhook parameters
            webhookPayload: {
                type: 'object',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Webhook payload',
                rules: [
                    { operation: 'notEqual', valueA: 'process_webhook', valueB: '{{action}}', action: 'hide' },
                ],
            },
            webhookTopic: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Webhook topic',
                rules: [
                    { operation: 'notEqual', valueA: 'process_webhook', valueB: '{{action}}', action: 'hide' },
                ],
            },
        },
        required: ['action', 'shopName', 'adminToken'],
    },
    outputSchema: {
        type: "object",
    },
    exampleInput: {
        action: 'get_products',
        shopName: 'your-shop-name',
        adminToken: 'your-admin-token'
    },
    exampleOutput: {
        "products": [
            {
                "id": 123456789,
                "title": "Example Product",
                "body_html": "<p>This is an example product.</p>",
                "vendor": "Example Vendor",
                "product_type": "Example Type",
                "created_at": "2023-01-01T00:00:00-00:00",
                "handle": "example-product",
                "updated_at": "2023-01-02T00:00:00-00:00",
                "published_at": "2023-01-01T00:00:00-00:00",
                "status": "active"
            }
        ]
    },
    documentation: "https://shopify.dev/docs/api/admin-rest",
    method: "exec",
    actions: [
        {
            name: 'shopify',
            execute: async (input: any, context?: any): Promise<any> => {
                const { action, shopName, adminToken } = input;

                if (!action || !shopName || !adminToken) {
                    throw new Error('Missing required parameters: action, shopName, adminToken');
                }

                // Create a client instance, using the context's axios instance if provided
                const auth: ShopifyAuth = {
                    shopName,
                    adminToken
                };

                const client = context?.axiosInstance ?
                    new ShopifyClient(auth, context.axiosInstance) :
                    new ShopifyClient(auth);

                switch (action) {
                    // Customer actions
                    case 'get_customer': {
                        const { customerId } = input;
                        if (!customerId) {
                            throw new Error('Missing required parameter: customerId');
                        }
                        return await client.getCustomer(customerId);
                    }

                    case 'get_customers': {
                        return await client.getCustomers();
                    }

                    case 'create_customer': {
                        const { customerData } = input;
                        if (!customerData) {
                            throw new Error('Missing required parameter: customerData');
                        }
                        return await client.createCustomer(customerData);
                    }

                    case 'update_customer': {
                        const { customerId, customerData } = input;
                        if (!customerId || !customerData) {
                            throw new Error('Missing required parameters: customerId, customerData');
                        }
                        return await client.updateCustomer(customerId, customerData);
                    }

                    case 'get_customer_orders': {
                        const { customerId } = input;
                        if (!customerId) {
                            throw new Error('Missing required parameter: customerId');
                        }
                        return await client.getCustomerOrders(customerId);
                    }

                    // Product actions
                    case 'get_product': {
                        const { productId } = input;
                        if (!productId) {
                            throw new Error('Missing required parameter: productId');
                        }
                        return await client.getProduct(Number(productId));
                    }

                    case 'get_products': {
                        const { productTitle, createdAtMin, updatedAtMin } = input;
                        const searchParams: any = {};

                        if (productTitle) searchParams.title = productTitle;
                        if (createdAtMin) searchParams.createdAtMin = createdAtMin;
                        if (updatedAtMin) searchParams.updatedAtMin = updatedAtMin;

                        return await client.getProducts(searchParams);
                    }

                    case 'create_product': {
                        const { productData } = input;
                        if (!productData) {
                            throw new Error('Missing required parameter: productData');
                        }
                        return await client.createProduct(productData);
                    }

                    case 'update_product': {
                        const { productId, productData } = input;
                        if (!productId || !productData) {
                            throw new Error('Missing required parameters: productId, productData');
                        }
                        return await client.updateProduct(Number(productId), productData);
                    }

                    case 'get_product_variant': {
                        const { variantId } = input;
                        if (!variantId) {
                            throw new Error('Missing required parameter: variantId');
                        }
                        return await client.getProductVariant(Number(variantId));
                    }

                    case 'upload_product_image': {
                        const { productId, productImage } = input;
                        if (!productId || !productImage) {
                            throw new Error('Missing required parameters: productId, productImage');
                        }

                        const imageData: any = {};

                        // Check if the image is a URL or base64 data
                        if (productImage.startsWith('http')) {
                            imageData.src = productImage;
                        } else {
                            imageData.attachment = productImage;
                        }

                        return await client.uploadProductImage(Number(productId), imageData);
                    }

                    // Order actions
                    case 'create_order': {
                        const { orderData } = input;
                        if (!orderData) {
                            throw new Error('Missing required parameter: orderData');
                        }
                        return await client.createOrder(orderData);
                    }

                    case 'update_order': {
                        const { orderId, orderData } = input;
                        if (!orderId || !orderData) {
                            throw new Error('Missing required parameters: orderId, orderData');
                        }
                        return await client.updateOrder(Number(orderId), orderData);
                    }

                    case 'close_order': {
                        const { orderId } = input;
                        if (!orderId) {
                            throw new Error('Missing required parameter: orderId');
                        }
                        return await client.closeOrder(Number(orderId));
                    }

                    case 'cancel_order': {
                        const { orderId } = input;
                        if (!orderId) {
                            throw new Error('Missing required parameter: orderId');
                        }
                        return await client.cancelOrder(Number(orderId));
                    }

                    case 'create_draft_order': {
                        const { draftOrderData } = input;
                        if (!draftOrderData) {
                            throw new Error('Missing required parameter: draftOrderData');
                        }
                        return await client.createDraftOrder(draftOrderData);
                    }

                    // Transaction actions
                    case 'create_transaction': {
                        const { orderId, transactionData } = input;
                        if (!orderId || !transactionData) {
                            throw new Error('Missing required parameters: orderId, transactionData');
                        }
                        return await client.createTransaction(Number(orderId), transactionData);
                    }

                    case 'get_transaction': {
                        const { orderId, transactionId } = input;
                        if (!orderId || !transactionId) {
                            throw new Error('Missing required parameters: orderId, transactionId');
                        }
                        return await client.getTransaction(Number(orderId), Number(transactionId));
                    }

                    case 'get_transactions': {
                        const { orderId } = input;
                        if (!orderId) {
                            throw new Error('Missing required parameter: orderId');
                        }
                        return await client.getTransactions(Number(orderId));
                    }

                    // Fulfillment actions
                    case 'get_fulfillment': {
                        const { orderId, fulfillmentId } = input;
                        if (!orderId || !fulfillmentId) {
                            throw new Error('Missing required parameters: orderId, fulfillmentId');
                        }
                        return await client.getFulfillment(Number(orderId), Number(fulfillmentId));
                    }

                    case 'get_fulfillments': {
                        const { orderId } = input;
                        if (!orderId) {
                            throw new Error('Missing required parameter: orderId');
                        }
                        return await client.getFulfillments(Number(orderId));
                    }

                    case 'create_fulfillment_event': {
                        const { orderId, fulfillmentId, fulfillmentEventData } = input;
                        if (!orderId || !fulfillmentId || !fulfillmentEventData) {
                            throw new Error('Missing required parameters: orderId, fulfillmentId, fulfillmentEventData');
                        }
                        return await client.createFulfillmentEvent(Number(orderId), Number(fulfillmentId), fulfillmentEventData);
                    }

                    // Other actions
                    case 'get_locations': {
                        return await client.getLocations();
                    }

                    case 'adjust_inventory_level': {
                        const { inventoryItemId, locationId, adjustment } = input;
                        if (!inventoryItemId || !locationId || adjustment === undefined) {
                            throw new Error('Missing required parameters: inventoryItemId, locationId, adjustment');
                        }
                        return await client.adjustInventoryLevel(Number(inventoryItemId), Number(locationId), Number(adjustment));
                    }

                    case 'create_collect': {
                        const { collectData } = input;
                        if (!collectData) {
                            throw new Error('Missing required parameter: collectData');
                        }
                        return await client.createCollect(collectData);
                    }

                    case 'get_asset': {
                        const { assetKey, themeId } = input;
                        if (!assetKey || !themeId) {
                            throw new Error('Missing required parameters: assetKey, themeId');
                        }
                        return await client.getAsset(assetKey, Number(themeId));
                    }

                    // Webhook actions
                    case 'process_webhook': {
                        const { webhookPayload, webhookTopic } = input;
                        if (!webhookPayload) {
                            throw new Error('Missing required parameter: webhookPayload');
                        }

                        return {
                            topic: webhookTopic || 'unknown',
                            data: webhookPayload
                        };
                    }

                    default:
                        throw new Error(`Unsupported action: ${action}`);
                }
            }
        }
    ]
};

export { ShopifyClient };
export default shopifyPlugin;
