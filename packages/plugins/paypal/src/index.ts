import {
    createPayment,
    executePayment,
    getPayment,
    refundSale,
    createBillingPlan,
    activateBillingPlan,
    getBillingPlan,
    createBillingAgreement,
    executeBillingAgreement,
    getBillingAgreement,
    cancelBillingAgreement,
    listPayments,
    listBillingPlans
} from './utils';

const paypalPlugin = {
    name: "PayPal",
    icon: "",
    description: "Online payment system supporting money transfers and e-commerce transactions",
    groups: ["payment"],
    tags: ["payment","finance","money","transaction","billing"],
    version: '1.0.0',
    id: "paypal",
    runner: "node",
    inputSchema: {
        type: "object",
        properties: {
            action: {
                type: 'string',
                enum: [
                    'create_payment',
                    'execute_payment',
                    'get_payment',
                    'refund_sale',
                    'create_billing_plan',
                    'activate_billing_plan',
                    'get_billing_plan',
                    'create_billing_agreement',
                    'execute_billing_agreement',
                    'get_billing_agreement',
                    'cancel_billing_agreement',
                    'list_payments',
                    'list_billing_plans'
                ],
                description: 'Action to perform on PayPal',
            },
            token: {
                type: 'string',
                description: 'PayPal API OAuth token or access token',
            },
            // Fields for payment operations
            intent: {
                type: 'string',
                enum: ['sale', 'authorize', 'order'],
                description: 'Payment intent',
                rules: [
                    { operation: 'notEqual', valueA: 'create_payment', valueB: '{{action}}', action: 'hide' },
                ],
            },
            payer: {
                type: 'object',
                description: 'Payer information',
                properties: {
                    payment_method: {
                        type: 'string',
                        enum: ['paypal', 'credit_card', 'bank']
                    }
                },
                rules: [
                    { operation: 'notEqual', valueA: 'create_payment', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'create_billing_agreement', valueB: '{{action}}', action: 'hide' },
                ],
            },
            transactions: {
                type: 'array',
                description: 'Payment transactions',
                items: {
                    type: 'object',
                    properties: {
                        amount: {
                            type: 'object',
                            properties: {
                                total: { type: 'string' },
                                currency: { type: 'string' },
                                details: {
                                    type: 'object',
                                    properties: {
                                        subtotal: { type: 'string' },
                                        tax: { type: 'string' },
                                        shipping: { type: 'string' },
                                        handling_fee: { type: 'string' },
                                        insurance: { type: 'string' },
                                        shipping_discount: { type: 'string' }
                                    }
                                }
                            }
                        },
                        description: { type: 'string' },
                        item_list: {
                            type: 'object',
                            properties: {
                                items: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            name: { type: 'string' },
                                            sku: { type: 'string' },
                                            price: { type: 'string' },
                                            currency: { type: 'string' },
                                            quantity: { type: 'number' }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                rules: [
                    { operation: 'notEqual', valueA: 'create_payment', valueB: '{{action}}', action: 'hide' },
                ],
            },
            redirect_urls: {
                type: 'object',
                description: 'URLs to redirect the payer',
                properties: {
                    return_url: { type: 'string' },
                    cancel_url: { type: 'string' }
                },
                rules: [
                    { operation: 'notEqual', valueA: 'create_payment', valueB: '{{action}}', action: 'hide' },
                ],
            },
            paymentId: {
                type: 'string',
                description: 'PayPal payment ID',
                rules: [
                    { operation: 'notEqual', valueA: 'execute_payment', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'get_payment', valueB: '{{action}}', action: 'hide' },
                ],
            },
            payerId: {
                type: 'string',
                description: 'PayPal payer ID',
                rules: [
                    { operation: 'notEqual', valueA: 'execute_payment', valueB: '{{action}}', action: 'hide' },
                ],
            },
            // Fields for refund operations
            saleId: {
                type: 'string',
                description: 'PayPal sale ID',
                rules: [
                    { operation: 'notEqual', valueA: 'refund_sale', valueB: '{{action}}', action: 'hide' },
                ],
            },
            amount: {
                type: 'object',
                description: 'Refund amount',
                properties: {
                    total: { type: 'string' },
                    currency: { type: 'string' }
                },
                rules: [
                    { operation: 'notEqual', valueA: 'refund_sale', valueB: '{{action}}', action: 'hide' },
                ],
            },
            description: {
                type: 'string',
                description: 'Refund description',
                rules: [
                    { operation: 'notEqual', valueA: 'refund_sale', valueB: '{{action}}', action: 'hide' },
                ],
            },
            // Fields for billing plan operations
            name: {
                type: 'string',
                description: 'Name for the billing plan or agreement',
                rules: [
                    { operation: 'notEqual', valueA: 'create_billing_plan', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'create_billing_agreement', valueB: '{{action}}', action: 'hide' },
                ],
            },
            type: {
                type: 'string',
                enum: ['FIXED', 'INFINITE'],
                description: 'Type of billing plan',
                rules: [
                    { operation: 'notEqual', valueA: 'create_billing_plan', valueB: '{{action}}', action: 'hide' },
                ],
            },
            payment_definitions: {
                type: 'array',
                description: 'Payment definitions for the billing plan',
                items: {
                    type: 'object',
                    properties: {
                        name: { type: 'string' },
                        type: { type: 'string', enum: ['REGULAR', 'TRIAL'] },
                        frequency: { type: 'string', enum: ['DAY', 'WEEK', 'MONTH', 'YEAR'] },
                        frequency_interval: { type: 'string' },
                        amount: {
                            type: 'object',
                            properties: {
                                value: { type: 'string' },
                                currency: { type: 'string' }
                            }
                        },
                        cycles: { type: 'string' },
                        charge_models: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    type: { type: 'string', enum: ['SHIPPING', 'TAX'] },
                                    amount: {
                                        type: 'object',
                                        properties: {
                                            value: { type: 'string' },
                                            currency: { type: 'string' }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                rules: [
                    { operation: 'notEqual', valueA: 'create_billing_plan', valueB: '{{action}}', action: 'hide' },
                ],
            },
            merchant_preferences: {
                type: 'object',
                description: 'Merchant preferences for the billing plan',
                properties: {
                    setup_fee: {
                        type: 'object',
                        properties: {
                            value: { type: 'string' },
                            currency: { type: 'string' }
                        }
                    },
                    return_url: { type: 'string' },
                    cancel_url: { type: 'string' },
                    auto_bill_amount: { type: 'string', enum: ['YES', 'NO'] },
                    initial_fail_amount_action: { type: 'string', enum: ['CONTINUE', 'CANCEL'] },
                    max_fail_attempts: { type: 'string' }
                },
                rules: [
                    { operation: 'notEqual', valueA: 'create_billing_plan', valueB: '{{action}}', action: 'hide' },
                ],
            },
            planId: {
                type: 'string',
                description: 'PayPal billing plan ID',
                rules: [
                    { operation: 'notEqual', valueA: 'activate_billing_plan', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'get_billing_plan', valueB: '{{action}}', action: 'hide' },
                ],
            },
            // Fields for billing agreement operations
            start_date: {
                type: 'string',
                description: 'Start date for the billing agreement (ISO format)',
                rules: [
                    { operation: 'notEqual', valueA: 'create_billing_agreement', valueB: '{{action}}', action: 'hide' },
                ],
            },
            plan: {
                type: 'object',
                description: 'Plan for the billing agreement',
                properties: {
                    id: { type: 'string' }
                },
                rules: [
                    { operation: 'notEqual', valueA: 'create_billing_agreement', valueB: '{{action}}', action: 'hide' },
                ],
            },
            agreementToken: {
                type: 'string',
                description: 'PayPal billing agreement token',
                rules: [
                    { operation: 'notEqual', valueA: 'execute_billing_agreement', valueB: '{{action}}', action: 'hide' },
                ],
            },
            agreementId: {
                type: 'string',
                description: 'PayPal billing agreement ID',
                rules: [
                    { operation: 'notEqual', valueA: 'get_billing_agreement', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'cancel_billing_agreement', valueB: '{{action}}', action: 'hide' },
                ],
            },
            note: {
                type: 'string',
                description: 'Note for cancelling the billing agreement',
                rules: [
                    { operation: 'notEqual', valueA: 'cancel_billing_agreement', valueB: '{{action}}', action: 'hide' },
                ],
            },
            // Fields for list operations
            count: {
                type: 'number',
                description: 'Number of results to return',
                rules: [
                    { operation: 'notEqual', valueA: 'list_payments', valueB: '{{action}}', action: 'hide' },
                ],
            },
            start_index: {
                type: 'number',
                description: 'Start index for pagination',
                rules: [
                    { operation: 'notEqual', valueA: 'list_payments', valueB: '{{action}}', action: 'hide' },
                ],
            },
            sort_by: {
                type: 'string',
                description: 'Field to sort by',
                rules: [
                    { operation: 'notEqual', valueA: 'list_payments', valueB: '{{action}}', action: 'hide' },
                ],
            },
            sort_order: {
                type: 'string',
                enum: ['asc', 'desc'],
                description: 'Sort order',
                rules: [
                    { operation: 'notEqual', valueA: 'list_payments', valueB: '{{action}}', action: 'hide' },
                ],
            },
            start_time: {
                type: 'string',
                description: 'Start time for filtering payments (ISO format)',
                rules: [
                    { operation: 'notEqual', valueA: 'list_payments', valueB: '{{action}}', action: 'hide' },
                ],
            },
            end_time: {
                type: 'string',
                description: 'End time for filtering payments (ISO format)',
                rules: [
                    { operation: 'notEqual', valueA: 'list_payments', valueB: '{{action}}', action: 'hide' },
                ],
            },
            page_size: {
                type: 'number',
                description: 'Number of results per page',
                rules: [
                    { operation: 'notEqual', valueA: 'list_billing_plans', valueB: '{{action}}', action: 'hide' },
                ],
            },
            page: {
                type: 'number',
                description: 'Page number',
                rules: [
                    { operation: 'notEqual', valueA: 'list_billing_plans', valueB: '{{action}}', action: 'hide' },
                ],
            },
            status: {
                type: 'string',
                enum: ['CREATED', 'ACTIVE', 'INACTIVE', 'ALL'],
                description: 'Status for filtering billing plans',
                rules: [
                    { operation: 'notEqual', valueA: 'list_billing_plans', valueB: '{{action}}', action: 'hide' },
                ],
            },
        },
        required: ['action', 'token'],
    },
    outputSchema: {
        type: "object",
    },
    exampleInput: {
        action: 'create_payment',
        token: 'your-paypal-api-token',
        intent: 'sale',
        payer: {
            payment_method: 'paypal'
        },
        transactions: [
            {
                amount: {
                    total: '10.00',
                    currency: 'USD'
                },
                description: 'Payment for order #1234'
            }
        ],
        redirect_urls: {
            return_url: 'https://example.com/success',
            cancel_url: 'https://example.com/cancel'
        }
    },
    exampleOutput: {
        id: 'PAY-1234567890',
        intent: 'sale',
        state: 'created',
        payer: {
            payment_method: 'paypal'
        },
        transactions: [
            {
                amount: {
                    total: '10.00',
                    currency: 'USD'
                },
                description: 'Payment for order #1234'
            }
        ],
        create_time: '2023-01-01T00:00:00Z',
        links: [
            {
                href: 'https://api.sandbox.paypal.com/v1/payments/payment/PAY-1234567890',
                rel: 'self',
                method: 'GET'
            },
            {
                href: 'https://www.sandbox.paypal.com/cgi-bin/webscr?cmd=_express-checkout&token=EC-1234567890',
                rel: 'approval_url',
                method: 'REDIRECT'
            },
            {
                href: 'https://api.sandbox.paypal.com/v1/payments/payment/PAY-1234567890/execute',
                rel: 'execute',
                method: 'POST'
            }
        ]
    },
    documentation: "https://developer.paypal.com/docs/api/overview/",
    method: "exec",
    actions: [
        {
            name: 'paypal',
            execute: async (input: any): Promise<any> => {
                const { action, token } = input;

                if (!action || !token) {
                    throw new Error('Missing required parameters: action, token');
                }

                switch (action) {
                    case 'create_payment': {
                        const { intent, payer, transactions, redirect_urls } = input;

                        if (!intent || !payer || !transactions || !redirect_urls) {
                            throw new Error('Missing required parameters: intent, payer, transactions, redirect_urls');
                        }

                        return await createPayment({
                            token,
                            intent,
                            payer,
                            transactions,
                            redirect_urls
                        });
                    }

                    case 'execute_payment': {
                        const { paymentId, payerId } = input;

                        if (!paymentId || !payerId) {
                            throw new Error('Missing required parameters: paymentId, payerId');
                        }

                        return await executePayment({
                            token,
                            paymentId,
                            payerId
                        });
                    }

                    case 'get_payment': {
                        const { paymentId } = input;

                        if (!paymentId) {
                            throw new Error('Missing required parameter: paymentId');
                        }

                        return await getPayment({
                            token,
                            paymentId
                        });
                    }

                    case 'refund_sale': {
                        const { saleId, amount, description } = input;

                        if (!saleId) {
                            throw new Error('Missing required parameter: saleId');
                        }

                        return await refundSale({
                            token,
                            saleId,
                            amount,
                            description
                        });
                    }

                    case 'create_billing_plan': {
                        const { name, description, type, payment_definitions, merchant_preferences } = input;

                        if (!name || !type || !payment_definitions || !merchant_preferences) {
                            throw new Error('Missing required parameters: name, type, payment_definitions, merchant_preferences');
                        }

                        return await createBillingPlan({
                            token,
                            name,
                            description,
                            type,
                            payment_definitions,
                            merchant_preferences
                        });
                    }

                    case 'activate_billing_plan': {
                        const { planId } = input;

                        if (!planId) {
                            throw new Error('Missing required parameter: planId');
                        }

                        await activateBillingPlan({
                            token,
                            planId
                        });

                        return { success: true, message: 'Billing plan activated successfully' };
                    }

                    case 'get_billing_plan': {
                        const { planId } = input;

                        if (!planId) {
                            throw new Error('Missing required parameter: planId');
                        }

                        return await getBillingPlan({
                            token,
                            planId
                        });
                    }

                    case 'create_billing_agreement': {
                        const { name, description, start_date, plan, payer } = input;

                        if (!name || !start_date || !plan || !payer) {
                            throw new Error('Missing required parameters: name, start_date, plan, payer');
                        }

                        return await createBillingAgreement({
                            token,
                            name,
                            description,
                            start_date,
                            plan,
                            payer
                        });
                    }

                    case 'execute_billing_agreement': {
                        const { agreementToken } = input;

                        if (!agreementToken) {
                            throw new Error('Missing required parameter: agreementToken');
                        }

                        return await executeBillingAgreement({
                            token,
                            agreementToken
                        });
                    }

                    case 'get_billing_agreement': {
                        const { agreementId } = input;

                        if (!agreementId) {
                            throw new Error('Missing required parameter: agreementId');
                        }

                        return await getBillingAgreement({
                            token,
                            agreementId
                        });
                    }

                    case 'cancel_billing_agreement': {
                        const { agreementId, note } = input;

                        if (!agreementId || !note) {
                            throw new Error('Missing required parameters: agreementId, note');
                        }

                        await cancelBillingAgreement({
                            token,
                            agreementId,
                            note
                        });

                        return { success: true, message: 'Billing agreement cancelled successfully' };
                    }

                    case 'list_payments': {
                        const { count, start_index, sort_by, sort_order, start_time, end_time } = input;

                        return await listPayments({
                            token,
                            count,
                            start_index,
                            sort_by,
                            sort_order,
                            start_time,
                            end_time
                        });
                    }

                    case 'list_billing_plans': {
                        const { page_size, page, status } = input;

                        return await listBillingPlans({
                            token,
                            page_size,
                            page,
                            status
                        });
                    }

                    default:
                        throw new Error(`Unsupported action: ${action}`);
                }
            }
        }
    ]
};

export default paypalPlugin;
