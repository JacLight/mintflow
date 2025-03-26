import axios from 'axios';
import {
    PayPalPayment,
    PayPalRefund,
    PayPalBillingPlan,
    PayPalBillingAgreement,
    PayPalCreatePaymentParams,
    PayPalExecutePaymentParams,
    PayPalGetPaymentParams,
    PayPalRefundSaleParams,
    PayPalCreateBillingPlanParams,
    PayPalActivateBillingPlanParams,
    PayPalGetBillingPlanParams,
    PayPalCreateBillingAgreementParams,
    PayPalExecuteBillingAgreementParams,
    PayPalGetBillingAgreementParams,
    PayPalCancelBillingAgreementParams,
    PayPalListPaymentsParams,
    PayPalListBillingPlansParams
} from './models.js';

// PayPal API endpoints
const SANDBOX_BASE_URL = 'https://api.sandbox.paypal.com';
const LIVE_BASE_URL = 'https://api.paypal.com';

/**
 * Get the base URL based on the token (sandbox or live)
 */
const getBaseUrl = (token: string): string => {
    return token.startsWith('Bearer') ?
        (token.includes('sandbox') ? SANDBOX_BASE_URL : LIVE_BASE_URL) :
        (token.includes('sandbox') ? SANDBOX_BASE_URL : LIVE_BASE_URL);
};

/**
 * Get the authorization header
 */
const getAuthHeader = (token: string): string => {
    return token.startsWith('Bearer') ? token : `Bearer ${token}`;
};

/**
 * Create a payment in PayPal
 */
export const createPayment = async (params: PayPalCreatePaymentParams): Promise<PayPalPayment> => {
    try {
        const { token, ...paymentData } = params;
        const baseUrl = getBaseUrl(token);

        const response = await axios.post(
            `${baseUrl}/v1/payments/payment`,
            paymentData,
            {
                headers: {
                    Authorization: getAuthHeader(token),
                    'Content-Type': 'application/json'
                }
            }
        );

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(`PayPal API error: ${error.response?.data?.message || error.message}`);
        }
        throw error;
    }
};

/**
 * Execute a payment in PayPal after payer approval
 */
export const executePayment = async (params: PayPalExecutePaymentParams): Promise<PayPalPayment> => {
    try {
        const { token, paymentId, payerId } = params;
        const baseUrl = getBaseUrl(token);

        const response = await axios.post(
            `${baseUrl}/v1/payments/payment/${paymentId}/execute`,
            { payer_id: payerId },
            {
                headers: {
                    Authorization: getAuthHeader(token),
                    'Content-Type': 'application/json'
                }
            }
        );

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(`PayPal API error: ${error.response?.data?.message || error.message}`);
        }
        throw error;
    }
};

/**
 * Get payment details from PayPal
 */
export const getPayment = async (params: PayPalGetPaymentParams): Promise<PayPalPayment> => {
    try {
        const { token, paymentId } = params;
        const baseUrl = getBaseUrl(token);

        const response = await axios.get(
            `${baseUrl}/v1/payments/payment/${paymentId}`,
            {
                headers: {
                    Authorization: getAuthHeader(token)
                }
            }
        );

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(`PayPal API error: ${error.response?.data?.message || error.message}`);
        }
        throw error;
    }
};

/**
 * Refund a sale in PayPal
 */
export const refundSale = async (params: PayPalRefundSaleParams): Promise<PayPalRefund> => {
    try {
        const { token, saleId, amount, description } = params;
        const baseUrl = getBaseUrl(token);

        const refundData: any = {};

        if (amount) {
            refundData.amount = amount;
        }

        if (description) {
            refundData.description = description;
        }

        const response = await axios.post(
            `${baseUrl}/v1/payments/sale/${saleId}/refund`,
            refundData,
            {
                headers: {
                    Authorization: getAuthHeader(token),
                    'Content-Type': 'application/json'
                }
            }
        );

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(`PayPal API error: ${error.response?.data?.message || error.message}`);
        }
        throw error;
    }
};

/**
 * Create a billing plan in PayPal
 */
export const createBillingPlan = async (params: PayPalCreateBillingPlanParams): Promise<PayPalBillingPlan> => {
    try {
        const { token, ...planData } = params;
        const baseUrl = getBaseUrl(token);

        const response = await axios.post(
            `${baseUrl}/v1/payments/billing-plans`,
            planData,
            {
                headers: {
                    Authorization: getAuthHeader(token),
                    'Content-Type': 'application/json'
                }
            }
        );

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(`PayPal API error: ${error.response?.data?.message || error.message}`);
        }
        throw error;
    }
};

/**
 * Activate a billing plan in PayPal
 */
export const activateBillingPlan = async (params: PayPalActivateBillingPlanParams): Promise<void> => {
    try {
        const { token, planId } = params;
        const baseUrl = getBaseUrl(token);

        await axios.patch(
            `${baseUrl}/v1/payments/billing-plans/${planId}`,
            [
                {
                    op: 'replace',
                    path: '/',
                    value: {
                        state: 'ACTIVE'
                    }
                }
            ],
            {
                headers: {
                    Authorization: getAuthHeader(token),
                    'Content-Type': 'application/json'
                }
            }
        );
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(`PayPal API error: ${error.response?.data?.message || error.message}`);
        }
        throw error;
    }
};

/**
 * Get billing plan details from PayPal
 */
export const getBillingPlan = async (params: PayPalGetBillingPlanParams): Promise<PayPalBillingPlan> => {
    try {
        const { token, planId } = params;
        const baseUrl = getBaseUrl(token);

        const response = await axios.get(
            `${baseUrl}/v1/payments/billing-plans/${planId}`,
            {
                headers: {
                    Authorization: getAuthHeader(token)
                }
            }
        );

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(`PayPal API error: ${error.response?.data?.message || error.message}`);
        }
        throw error;
    }
};

/**
 * Create a billing agreement in PayPal
 */
export const createBillingAgreement = async (params: PayPalCreateBillingAgreementParams): Promise<{ id: string; links: Array<{ href: string; rel: string; method: string; }> }> => {
    try {
        const { token, ...agreementData } = params;
        const baseUrl = getBaseUrl(token);

        const response = await axios.post(
            `${baseUrl}/v1/payments/billing-agreements`,
            agreementData,
            {
                headers: {
                    Authorization: getAuthHeader(token),
                    'Content-Type': 'application/json'
                }
            }
        );

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(`PayPal API error: ${error.response?.data?.message || error.message}`);
        }
        throw error;
    }
};

/**
 * Execute a billing agreement in PayPal after payer approval
 */
export const executeBillingAgreement = async (params: PayPalExecuteBillingAgreementParams): Promise<PayPalBillingAgreement> => {
    try {
        const { token, agreementToken } = params;
        const baseUrl = getBaseUrl(token);

        const response = await axios.post(
            `${baseUrl}/v1/payments/billing-agreements/${agreementToken}/agreement-execute`,
            {},
            {
                headers: {
                    Authorization: getAuthHeader(token),
                    'Content-Type': 'application/json'
                }
            }
        );

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(`PayPal API error: ${error.response?.data?.message || error.message}`);
        }
        throw error;
    }
};

/**
 * Get billing agreement details from PayPal
 */
export const getBillingAgreement = async (params: PayPalGetBillingAgreementParams): Promise<PayPalBillingAgreement> => {
    try {
        const { token, agreementId } = params;
        const baseUrl = getBaseUrl(token);

        const response = await axios.get(
            `${baseUrl}/v1/payments/billing-agreements/${agreementId}`,
            {
                headers: {
                    Authorization: getAuthHeader(token)
                }
            }
        );

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(`PayPal API error: ${error.response?.data?.message || error.message}`);
        }
        throw error;
    }
};

/**
 * Cancel a billing agreement in PayPal
 */
export const cancelBillingAgreement = async (params: PayPalCancelBillingAgreementParams): Promise<void> => {
    try {
        const { token, agreementId, note } = params;
        const baseUrl = getBaseUrl(token);

        await axios.post(
            `${baseUrl}/v1/payments/billing-agreements/${agreementId}/cancel`,
            { note },
            {
                headers: {
                    Authorization: getAuthHeader(token),
                    'Content-Type': 'application/json'
                }
            }
        );
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(`PayPal API error: ${error.response?.data?.message || error.message}`);
        }
        throw error;
    }
};

/**
 * List payments from PayPal
 */
export const listPayments = async (params: PayPalListPaymentsParams): Promise<{ payments: PayPalPayment[]; count: number; next_id?: string }> => {
    try {
        const { token, count = 10, start_index, sort_by, sort_order, start_time, end_time } = params;
        const baseUrl = getBaseUrl(token);

        const queryParams: any = {
            count
        };

        if (start_index) {
            queryParams.start_index = start_index;
        }

        if (sort_by) {
            queryParams.sort_by = sort_by;
        }

        if (sort_order) {
            queryParams.sort_order = sort_order;
        }

        if (start_time) {
            queryParams.start_time = start_time;
        }

        if (end_time) {
            queryParams.end_time = end_time;
        }

        const response = await axios.get(
            `${baseUrl}/v1/payments/payment`,
            {
                params: queryParams,
                headers: {
                    Authorization: getAuthHeader(token)
                }
            }
        );

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(`PayPal API error: ${error.response?.data?.message || error.message}`);
        }
        throw error;
    }
};

/**
 * List billing plans from PayPal
 */
export const listBillingPlans = async (params: PayPalListBillingPlansParams): Promise<{ plans: PayPalBillingPlan[]; total_items: number; total_pages: number }> => {
    try {
        const { token, page_size = 10, page = 1, status = 'ACTIVE' } = params;
        const baseUrl = getBaseUrl(token);

        const queryParams: any = {
            page_size,
            page,
            status
        };

        const response = await axios.get(
            `${baseUrl}/v1/payments/billing-plans`,
            {
                params: queryParams,
                headers: {
                    Authorization: getAuthHeader(token)
                }
            }
        );

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(`PayPal API error: ${error.response?.data?.message || error.message}`);
        }
        throw error;
    }
};
