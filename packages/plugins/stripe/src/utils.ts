import axios from 'axios';
import {
    StripeCustomer,
    StripePaymentIntent,
    StripeSubscription,
    StripeProduct,
    StripePrice,
    StripeCreateCustomerParams,
    StripeCreatePaymentIntentParams,
    StripeCreateSubscriptionParams,
    StripeCreateProductParams,
    StripeCreatePriceParams,
    StripeGetCustomerParams,
    StripeGetPaymentIntentParams,
    StripeGetSubscriptionParams,
    StripeGetProductParams,
    StripeGetPriceParams,
    StripeListCustomersParams,
    StripeListPaymentIntentsParams,
    StripeListSubscriptionsParams,
    StripeListProductsParams,
    StripeListPricesParams
} from './models.js';

const BASE_URL = 'https://api.stripe.com/v1';

/**
 * Create a customer in Stripe
 */
export const createCustomer = async (params: StripeCreateCustomerParams): Promise<StripeCustomer> => {
    try {
        const { token, ...customerData } = params;

        const response = await axios.post(
            `${BASE_URL}/customers`,
            customerData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(`Stripe API error: ${error.response?.data?.error?.message || error.message}`);
        }
        throw error;
    }
};

/**
 * Create a payment intent in Stripe
 */
export const createPaymentIntent = async (params: StripeCreatePaymentIntentParams): Promise<StripePaymentIntent> => {
    try {
        const { token, ...paymentIntentData } = params;

        const response = await axios.post(
            `${BASE_URL}/payment_intents`,
            paymentIntentData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(`Stripe API error: ${error.response?.data?.error?.message || error.message}`);
        }
        throw error;
    }
};

/**
 * Create a subscription in Stripe
 */
export const createSubscription = async (params: StripeCreateSubscriptionParams): Promise<StripeSubscription> => {
    try {
        const { token, ...subscriptionData } = params;

        // Format the items array for Stripe's API
        const formattedData = {
            customer: subscriptionData.customer,
            items: [
                {
                    price: subscriptionData.price,
                    quantity: subscriptionData.quantity || 1
                }
            ],
            metadata: subscriptionData.metadata
        };

        const response = await axios.post(
            `${BASE_URL}/subscriptions`,
            formattedData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(`Stripe API error: ${error.response?.data?.error?.message || error.message}`);
        }
        throw error;
    }
};

/**
 * Create a product in Stripe
 */
export const createProduct = async (params: StripeCreateProductParams): Promise<StripeProduct> => {
    try {
        const { token, ...productData } = params;

        const response = await axios.post(
            `${BASE_URL}/products`,
            productData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(`Stripe API error: ${error.response?.data?.error?.message || error.message}`);
        }
        throw error;
    }
};

/**
 * Create a price in Stripe
 */
export const createPrice = async (params: StripeCreatePriceParams): Promise<StripePrice> => {
    try {
        const { token, ...priceData } = params;

        // Format the recurring object for Stripe's API if it exists
        const formattedData: any = {
            product: priceData.product,
            unit_amount: priceData.unit_amount,
            currency: priceData.currency,
            active: priceData.active,
            metadata: priceData.metadata
        };

        if (priceData.recurring) {
            formattedData.recurring = {
                interval: priceData.recurring.interval,
                interval_count: priceData.recurring.interval_count || 1
            };
        }

        const response = await axios.post(
            `${BASE_URL}/prices`,
            formattedData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(`Stripe API error: ${error.response?.data?.error?.message || error.message}`);
        }
        throw error;
    }
};

/**
 * Get a customer from Stripe
 */
export const getCustomer = async (params: StripeGetCustomerParams): Promise<StripeCustomer> => {
    try {
        const { token, customerId } = params;

        const response = await axios.get(
            `${BASE_URL}/customers/${customerId}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(`Stripe API error: ${error.response?.data?.error?.message || error.message}`);
        }
        throw error;
    }
};

/**
 * Get a payment intent from Stripe
 */
export const getPaymentIntent = async (params: StripeGetPaymentIntentParams): Promise<StripePaymentIntent> => {
    try {
        const { token, paymentIntentId } = params;

        const response = await axios.get(
            `${BASE_URL}/payment_intents/${paymentIntentId}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(`Stripe API error: ${error.response?.data?.error?.message || error.message}`);
        }
        throw error;
    }
};

/**
 * Get a subscription from Stripe
 */
export const getSubscription = async (params: StripeGetSubscriptionParams): Promise<StripeSubscription> => {
    try {
        const { token, subscriptionId } = params;

        const response = await axios.get(
            `${BASE_URL}/subscriptions/${subscriptionId}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(`Stripe API error: ${error.response?.data?.error?.message || error.message}`);
        }
        throw error;
    }
};

/**
 * Get a product from Stripe
 */
export const getProduct = async (params: StripeGetProductParams): Promise<StripeProduct> => {
    try {
        const { token, productId } = params;

        const response = await axios.get(
            `${BASE_URL}/products/${productId}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(`Stripe API error: ${error.response?.data?.error?.message || error.message}`);
        }
        throw error;
    }
};

/**
 * Get a price from Stripe
 */
export const getPrice = async (params: StripeGetPriceParams): Promise<StripePrice> => {
    try {
        const { token, priceId } = params;

        const response = await axios.get(
            `${BASE_URL}/prices/${priceId}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(`Stripe API error: ${error.response?.data?.error?.message || error.message}`);
        }
        throw error;
    }
};

/**
 * List customers from Stripe
 */
export const listCustomers = async (params: StripeListCustomersParams): Promise<StripeCustomer[]> => {
    try {
        const { token, email, limit = 10 } = params;

        const queryParams: any = {
            limit
        };

        if (email) {
            queryParams.email = email;
        }

        const response = await axios.get(
            `${BASE_URL}/customers`,
            {
                params: queryParams,
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        return response.data.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(`Stripe API error: ${error.response?.data?.error?.message || error.message}`);
        }
        throw error;
    }
};

/**
 * List payment intents from Stripe
 */
export const listPaymentIntents = async (params: StripeListPaymentIntentsParams): Promise<StripePaymentIntent[]> => {
    try {
        const { token, customer, limit = 10 } = params;

        const queryParams: any = {
            limit
        };

        if (customer) {
            queryParams.customer = customer;
        }

        const response = await axios.get(
            `${BASE_URL}/payment_intents`,
            {
                params: queryParams,
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        return response.data.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(`Stripe API error: ${error.response?.data?.error?.message || error.message}`);
        }
        throw error;
    }
};

/**
 * List subscriptions from Stripe
 */
export const listSubscriptions = async (params: StripeListSubscriptionsParams): Promise<StripeSubscription[]> => {
    try {
        const { token, customer, status, limit = 10 } = params;

        const queryParams: any = {
            limit
        };

        if (customer) {
            queryParams.customer = customer;
        }

        if (status && status !== 'all') {
            queryParams.status = status;
        }

        const response = await axios.get(
            `${BASE_URL}/subscriptions`,
            {
                params: queryParams,
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        return response.data.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(`Stripe API error: ${error.response?.data?.error?.message || error.message}`);
        }
        throw error;
    }
};

/**
 * List products from Stripe
 */
export const listProducts = async (params: StripeListProductsParams): Promise<StripeProduct[]> => {
    try {
        const { token, active, limit = 10 } = params;

        const queryParams: any = {
            limit
        };

        if (active !== undefined) {
            queryParams.active = active;
        }

        const response = await axios.get(
            `${BASE_URL}/products`,
            {
                params: queryParams,
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        return response.data.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(`Stripe API error: ${error.response?.data?.error?.message || error.message}`);
        }
        throw error;
    }
};

/**
 * List prices from Stripe
 */
export const listPrices = async (params: StripeListPricesParams): Promise<StripePrice[]> => {
    try {
        const { token, product, active, limit = 10 } = params;

        const queryParams: any = {
            limit
        };

        if (product) {
            queryParams.product = product;
        }

        if (active !== undefined) {
            queryParams.active = active;
        }

        const response = await axios.get(
            `${BASE_URL}/prices`,
            {
                params: queryParams,
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        return response.data.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(`Stripe API error: ${error.response?.data?.error?.message || error.message}`);
        }
        throw error;
    }
};
