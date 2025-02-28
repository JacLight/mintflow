// Stripe data models

export interface StripeCustomer {
    id: string;
    name?: string;
    email?: string;
    description?: string;
    phone?: string;
    address?: {
        line1?: string;
        line2?: string;
        city?: string;
        state?: string;
        postal_code?: string;
        country?: string;
    };
    metadata?: Record<string, string>;
    created: number;
}

export interface StripePaymentIntent {
    id: string;
    amount: number;
    currency: string;
    status: string;
    description?: string;
    customer?: string;
    payment_method?: string;
    receipt_email?: string;
    metadata?: Record<string, string>;
    created: number;
}

export interface StripePaymentMethod {
    id: string;
    type: string;
    card?: {
        brand: string;
        last4: string;
        exp_month: number;
        exp_year: number;
    };
    billing_details?: {
        name?: string;
        email?: string;
        phone?: string;
        address?: {
            line1?: string;
            line2?: string;
            city?: string;
            state?: string;
            postal_code?: string;
            country?: string;
        };
    };
    created: number;
}

export interface StripeSubscription {
    id: string;
    customer: string;
    status: string;
    current_period_start: number;
    current_period_end: number;
    items: {
        data: Array<{
            id: string;
            price: {
                id: string;
                product: string;
                unit_amount: number;
                currency: string;
                recurring?: {
                    interval: string;
                    interval_count: number;
                };
            };
            quantity: number;
        }>;
    };
    metadata?: Record<string, string>;
    created: number;
}

export interface StripeProduct {
    id: string;
    name: string;
    description?: string;
    active: boolean;
    metadata?: Record<string, string>;
    created: number;
}

export interface StripePrice {
    id: string;
    product: string;
    unit_amount: number;
    currency: string;
    recurring?: {
        interval: string;
        interval_count: number;
    };
    active: boolean;
    metadata?: Record<string, string>;
    created: number;
}

export interface StripeCreateCustomerParams {
    token: string;
    email?: string;
    name?: string;
    description?: string;
    phone?: string;
    address?: {
        line1?: string;
        line2?: string;
        city?: string;
        state?: string;
        postal_code?: string;
        country?: string;
    };
    metadata?: Record<string, string>;
}

export interface StripeCreatePaymentIntentParams {
    token: string;
    amount: number;
    currency: string;
    description?: string;
    customer?: string;
    payment_method?: string;
    receipt_email?: string;
    metadata?: Record<string, string>;
}

export interface StripeCreateSubscriptionParams {
    token: string;
    customer: string;
    price: string;
    quantity?: number;
    metadata?: Record<string, string>;
}

export interface StripeCreateProductParams {
    token: string;
    name: string;
    description?: string;
    active?: boolean;
    metadata?: Record<string, string>;
}

export interface StripeCreatePriceParams {
    token: string;
    product: string;
    unit_amount: number;
    currency: string;
    recurring?: {
        interval: 'day' | 'week' | 'month' | 'year';
        interval_count?: number;
    };
    active?: boolean;
    metadata?: Record<string, string>;
}

export interface StripeGetCustomerParams {
    token: string;
    customerId: string;
}

export interface StripeGetPaymentIntentParams {
    token: string;
    paymentIntentId: string;
}

export interface StripeGetSubscriptionParams {
    token: string;
    subscriptionId: string;
}

export interface StripeGetProductParams {
    token: string;
    productId: string;
}

export interface StripeGetPriceParams {
    token: string;
    priceId: string;
}

export interface StripeListCustomersParams {
    token: string;
    email?: string;
    limit?: number;
}

export interface StripeListPaymentIntentsParams {
    token: string;
    customer?: string;
    limit?: number;
}

export interface StripeListSubscriptionsParams {
    token: string;
    customer?: string;
    status?: 'active' | 'past_due' | 'unpaid' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'trialing' | 'all';
    limit?: number;
}

export interface StripeListProductsParams {
    token: string;
    active?: boolean;
    limit?: number;
}

export interface StripeListPricesParams {
    token: string;
    product?: string;
    active?: boolean;
    limit?: number;
}
