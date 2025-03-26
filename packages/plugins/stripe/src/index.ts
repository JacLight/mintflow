import {
    createCustomer,
    createPaymentIntent,
    createSubscription,
    createProduct,
    createPrice,
    getCustomer,
    getPaymentIntent,
    getSubscription,
    getProduct,
    getPrice,
    listCustomers,
    listPaymentIntents,
    listSubscriptions,
    listProducts,
    listPrices
} from './utils.js';

const stripePlugin = {
    name: "Stripe",
    icon: "",
    description: "Payment processing platform for online businesses",
    groups: ["payment"],
    tags: ["payment","finance","money","transaction","billing"],
    version: '1.0.0',
    id: "stripe",
    runner: "node",
    inputSchema: {
        type: "object",
        properties: {
            action: {
                type: 'string',
                enum: [
                    'create_customer',
                    'create_payment_intent',
                    'create_subscription',
                    'create_product',
                    'create_price',
                    'get_customer',
                    'get_payment_intent',
                    'get_subscription',
                    'get_product',
                    'get_price',
                    'list_customers',
                    'list_payment_intents',
                    'list_subscriptions',
                    'list_products',
                    'list_prices'
                ],
                description: 'Action to perform on Stripe',
            },
            token: {
                type: 'string',
                description: 'Stripe API secret key',
            },
            // Fields for customer operations
            email: {
                type: 'string',
                description: 'Customer email address',
                rules: [
                    { operation: 'notEqual', valueA: 'create_customer', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'list_customers', valueB: '{{action}}', action: 'hide' },
                ],
            },
            name: {
                type: 'string',
                description: 'Customer name',
                rules: [
                    { operation: 'notEqual', valueA: 'create_customer', valueB: '{{action}}', action: 'hide' },
                ],
            },
            description: {
                type: 'string',
                description: 'Description for customer or product',
                rules: [
                    { operation: 'notEqual', valueA: 'create_customer', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'create_payment_intent', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'create_product', valueB: '{{action}}', action: 'hide' },
                ],
            },
            phone: {
                type: 'string',
                description: 'Customer phone number',
                rules: [
                    { operation: 'notEqual', valueA: 'create_customer', valueB: '{{action}}', action: 'hide' },
                ],
            },
            address: {
                type: 'object',
                description: 'Customer address',
                properties: {
                    line1: { type: 'string' },
                    line2: { type: 'string' },
                    city: { type: 'string' },
                    state: { type: 'string' },
                    postal_code: { type: 'string' },
                    country: { type: 'string' }
                },
                rules: [
                    { operation: 'notEqual', valueA: 'create_customer', valueB: '{{action}}', action: 'hide' },
                ],
            },
            // Fields for payment intent operations
            amount: {
                type: 'number',
                description: 'Amount in cents (e.g., 1000 = $10.00)',
                rules: [
                    { operation: 'notEqual', valueA: 'create_payment_intent', valueB: '{{action}}', action: 'hide' },
                ],
            },
            currency: {
                type: 'string',
                description: 'Three-letter ISO currency code (e.g., usd, eur)',
                rules: [
                    { operation: 'notEqual', valueA: 'create_payment_intent', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'create_price', valueB: '{{action}}', action: 'hide' },
                ],
            },
            customer: {
                type: 'string',
                description: 'Stripe customer ID',
                rules: [
                    { operation: 'notEqual', valueA: 'create_payment_intent', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'create_subscription', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'list_payment_intents', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'list_subscriptions', valueB: '{{action}}', action: 'hide' },
                ],
            },
            payment_method: {
                type: 'string',
                description: 'Stripe payment method ID',
                rules: [
                    { operation: 'notEqual', valueA: 'create_payment_intent', valueB: '{{action}}', action: 'hide' },
                ],
            },
            receipt_email: {
                type: 'string',
                description: 'Email address to send receipt to',
                rules: [
                    { operation: 'notEqual', valueA: 'create_payment_intent', valueB: '{{action}}', action: 'hide' },
                ],
            },
            // Fields for subscription operations
            price: {
                type: 'string',
                description: 'Stripe price ID',
                rules: [
                    { operation: 'notEqual', valueA: 'create_subscription', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'list_prices', valueB: '{{action}}', action: 'hide' },
                ],
            },
            quantity: {
                type: 'number',
                description: 'Quantity of the price to purchase',
                rules: [
                    { operation: 'notEqual', valueA: 'create_subscription', valueB: '{{action}}', action: 'hide' },
                ],
            },
            // Fields for product operations
            active: {
                type: 'boolean',
                description: 'Whether the product or price is active',
                rules: [
                    { operation: 'notEqual', valueA: 'create_product', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'create_price', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'list_products', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'list_prices', valueB: '{{action}}', action: 'hide' },
                ],
            },
            // Fields for price operations
            product: {
                type: 'string',
                description: 'Stripe product ID',
                rules: [
                    { operation: 'notEqual', valueA: 'create_price', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'list_prices', valueB: '{{action}}', action: 'hide' },
                ],
            },
            unit_amount: {
                type: 'number',
                description: 'Amount in cents (e.g., 1000 = $10.00)',
                rules: [
                    { operation: 'notEqual', valueA: 'create_price', valueB: '{{action}}', action: 'hide' },
                ],
            },
            recurring: {
                type: 'object',
                description: 'Recurring price configuration',
                properties: {
                    interval: {
                        type: 'string',
                        enum: ['day', 'week', 'month', 'year']
                    },
                    interval_count: { type: 'number' }
                },
                rules: [
                    { operation: 'notEqual', valueA: 'create_price', valueB: '{{action}}', action: 'hide' },
                ],
            },
            // Fields for get operations
            customerId: {
                type: 'string',
                description: 'Stripe customer ID',
                rules: [
                    { operation: 'notEqual', valueA: 'get_customer', valueB: '{{action}}', action: 'hide' },
                ],
            },
            paymentIntentId: {
                type: 'string',
                description: 'Stripe payment intent ID',
                rules: [
                    { operation: 'notEqual', valueA: 'get_payment_intent', valueB: '{{action}}', action: 'hide' },
                ],
            },
            subscriptionId: {
                type: 'string',
                description: 'Stripe subscription ID',
                rules: [
                    { operation: 'notEqual', valueA: 'get_subscription', valueB: '{{action}}', action: 'hide' },
                ],
            },
            productId: {
                type: 'string',
                description: 'Stripe product ID',
                rules: [
                    { operation: 'notEqual', valueA: 'get_product', valueB: '{{action}}', action: 'hide' },
                ],
            },
            priceId: {
                type: 'string',
                description: 'Stripe price ID',
                rules: [
                    { operation: 'notEqual', valueA: 'get_price', valueB: '{{action}}', action: 'hide' },
                ],
            },
            // Fields for list operations
            status: {
                type: 'string',
                enum: ['active', 'past_due', 'unpaid', 'canceled', 'incomplete', 'incomplete_expired', 'trialing', 'all'],
                description: 'Subscription status to filter by',
                rules: [
                    { operation: 'notEqual', valueA: 'list_subscriptions', valueB: '{{action}}', action: 'hide' },
                ],
            },
            limit: {
                type: 'number',
                description: 'Maximum number of results to return (default: 10)',
                rules: [
                    { operation: 'notEqual', valueA: 'list_customers', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'list_payment_intents', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'list_subscriptions', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'list_products', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'list_prices', valueB: '{{action}}', action: 'hide' },
                ],
            },
            // Common fields
            metadata: {
                type: 'object',
                description: 'Set of key-value pairs for storing additional information',
                rules: [
                    { operation: 'notEqual', valueA: 'create_customer', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'create_payment_intent', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'create_subscription', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'create_product', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'create_price', valueB: '{{action}}', action: 'hide' },
                ],
            },
        },
        required: ['action', 'token'],
    },
    outputSchema: {
        type: "object",
    },
    exampleInput: {
        action: 'create_payment_intent',
        token: 'sk_test_your_stripe_secret_key',
        amount: 1000,
        currency: 'usd',
        description: 'Payment for order #1234'
    },
    exampleOutput: {
        id: 'pi_1234567890',
        amount: 1000,
        currency: 'usd',
        status: 'requires_payment_method',
        description: 'Payment for order #1234',
        created: 1609459200
    },
    documentation: "https://stripe.com/docs/api",
    method: "exec",
    actions: [
        {
            name: 'stripe',
            execute: async (input: any): Promise<any> => {
                const { action, token } = input;

                if (!action || !token) {
                    throw new Error('Missing required parameters: action, token');
                }

                switch (action) {
                    case 'create_customer': {
                        const { email, name, description, phone, address, metadata } = input;
                        return await createCustomer({
                            token,
                            email,
                            name,
                            description,
                            phone,
                            address,
                            metadata
                        });
                    }

                    case 'create_payment_intent': {
                        const { amount, currency, description, customer, payment_method, receipt_email, metadata } = input;

                        if (!amount || !currency) {
                            throw new Error('Missing required parameters: amount, currency');
                        }

                        return await createPaymentIntent({
                            token,
                            amount,
                            currency,
                            description,
                            customer,
                            payment_method,
                            receipt_email,
                            metadata
                        });
                    }

                    case 'create_subscription': {
                        const { customer, price, quantity, metadata } = input;

                        if (!customer || !price) {
                            throw new Error('Missing required parameters: customer, price');
                        }

                        return await createSubscription({
                            token,
                            customer,
                            price,
                            quantity,
                            metadata
                        });
                    }

                    case 'create_product': {
                        const { name, description, active, metadata } = input;

                        if (!name) {
                            throw new Error('Missing required parameter: name');
                        }

                        return await createProduct({
                            token,
                            name,
                            description,
                            active,
                            metadata
                        });
                    }

                    case 'create_price': {
                        const { product, unit_amount, currency, recurring, active, metadata } = input;

                        if (!product || !unit_amount || !currency) {
                            throw new Error('Missing required parameters: product, unit_amount, currency');
                        }

                        return await createPrice({
                            token,
                            product,
                            unit_amount,
                            currency,
                            recurring,
                            active,
                            metadata
                        });
                    }

                    case 'get_customer': {
                        const { customerId } = input;

                        if (!customerId) {
                            throw new Error('Missing required parameter: customerId');
                        }

                        return await getCustomer({
                            token,
                            customerId
                        });
                    }

                    case 'get_payment_intent': {
                        const { paymentIntentId } = input;

                        if (!paymentIntentId) {
                            throw new Error('Missing required parameter: paymentIntentId');
                        }

                        return await getPaymentIntent({
                            token,
                            paymentIntentId
                        });
                    }

                    case 'get_subscription': {
                        const { subscriptionId } = input;

                        if (!subscriptionId) {
                            throw new Error('Missing required parameter: subscriptionId');
                        }

                        return await getSubscription({
                            token,
                            subscriptionId
                        });
                    }

                    case 'get_product': {
                        const { productId } = input;

                        if (!productId) {
                            throw new Error('Missing required parameter: productId');
                        }

                        return await getProduct({
                            token,
                            productId
                        });
                    }

                    case 'get_price': {
                        const { priceId } = input;

                        if (!priceId) {
                            throw new Error('Missing required parameter: priceId');
                        }

                        return await getPrice({
                            token,
                            priceId
                        });
                    }

                    case 'list_customers': {
                        const { email, limit } = input;
                        return await listCustomers({
                            token,
                            email,
                            limit
                        });
                    }

                    case 'list_payment_intents': {
                        const { customer, limit } = input;
                        return await listPaymentIntents({
                            token,
                            customer,
                            limit
                        });
                    }

                    case 'list_subscriptions': {
                        const { customer, status, limit } = input;
                        return await listSubscriptions({
                            token,
                            customer,
                            status,
                            limit
                        });
                    }

                    case 'list_products': {
                        const { active, limit } = input;
                        return await listProducts({
                            token,
                            active,
                            limit
                        });
                    }

                    case 'list_prices': {
                        const { product, active, limit } = input;
                        return await listPrices({
                            token,
                            product,
                            active,
                            limit
                        });
                    }

                    default:
                        throw new Error(`Unsupported action: ${action}`);
                }
            }
        }
    ]
};

export default stripePlugin;
