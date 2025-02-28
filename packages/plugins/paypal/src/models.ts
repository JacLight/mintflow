// PayPal data models

export interface PayPalPayment {
    id: string;
    intent: string;
    state: string;
    payer: {
        payment_method: string;
        status?: string;
        payer_info?: {
            email?: string;
            first_name?: string;
            last_name?: string;
            payer_id?: string;
        };
    };
    transactions: Array<{
        amount: {
            total: string;
            currency: string;
            details?: {
                subtotal?: string;
                tax?: string;
                shipping?: string;
                handling_fee?: string;
                insurance?: string;
                shipping_discount?: string;
            };
        };
        description?: string;
        item_list?: {
            items?: Array<{
                name: string;
                sku?: string;
                price: string;
                currency: string;
                quantity: number;
            }>;
            shipping_address?: {
                recipient_name?: string;
                line1?: string;
                line2?: string;
                city?: string;
                state?: string;
                postal_code?: string;
                country_code?: string;
            };
        };
        related_resources?: Array<{
            sale?: {
                id: string;
                state: string;
                amount: {
                    total: string;
                    currency: string;
                };
                payment_mode: string;
                protection_eligibility?: string;
                transaction_fee?: {
                    value: string;
                    currency: string;
                };
                create_time: string;
                update_time: string;
            };
            refund?: {
                id: string;
                state: string;
                amount: {
                    total: string;
                    currency: string;
                };
                create_time: string;
                update_time: string;
            };
        }>;
    }>;
    redirect_urls?: {
        return_url: string;
        cancel_url: string;
    };
    create_time: string;
    update_time: string;
    links: Array<{
        href: string;
        rel: string;
        method: string;
    }>;
}

export interface PayPalRefund {
    id: string;
    amount: {
        total: string;
        currency: string;
    };
    state: string;
    sale_id: string;
    parent_payment: string;
    create_time: string;
    update_time: string;
    links: Array<{
        href: string;
        rel: string;
        method: string;
    }>;
}

export interface PayPalBillingPlan {
    id: string;
    name: string;
    description: string;
    type: string;
    state: string;
    create_time: string;
    update_time: string;
    payment_definitions: Array<{
        id: string;
        name: string;
        type: string;
        frequency: string;
        frequency_interval: string;
        amount: {
            value: string;
            currency: string;
        };
        cycles: string;
        charge_models?: Array<{
            id: string;
            type: string;
            amount: {
                value: string;
                currency: string;
            };
        }>;
    }>;
    merchant_preferences: {
        setup_fee?: {
            value: string;
            currency: string;
        };
        return_url: string;
        cancel_url: string;
        auto_bill_amount: string;
        initial_fail_amount_action: string;
        max_fail_attempts: string;
    };
    links: Array<{
        href: string;
        rel: string;
        method: string;
    }>;
}

export interface PayPalBillingAgreement {
    id: string;
    state: string;
    name: string;
    description: string;
    start_date: string;
    agreement_details: {
        outstanding_balance: {
            value: string;
            currency: string;
        };
        cycles_remaining: string;
        cycles_completed: string;
        next_billing_date: string;
        last_payment_date: string;
        last_payment_amount: {
            value: string;
            currency: string;
        };
        final_payment_date: string;
        failed_payment_count: string;
    };
    payer: {
        payment_method: string;
        status: string;
        payer_info: {
            email: string;
            first_name: string;
            last_name: string;
            payer_id: string;
        };
    };
    plan: {
        id: string;
        state: string;
        name: string;
        description: string;
        type: string;
        payment_definitions: Array<{
            id: string;
            name: string;
            type: string;
            frequency: string;
            amount: {
                value: string;
                currency: string;
            };
            cycles: string;
            charge_models: Array<{
                id: string;
                type: string;
                amount: {
                    value: string;
                    currency: string;
                };
            }>;
            frequency_interval: string;
        }>;
        merchant_preferences: {
            setup_fee: {
                value: string;
                currency: string;
            };
            max_fail_attempts: string;
            auto_bill_amount: string;
        };
    };
    create_time: string;
    update_time: string;
    links: Array<{
        href: string;
        rel: string;
        method: string;
    }>;
}

export interface PayPalCreatePaymentParams {
    token: string;
    intent: 'sale' | 'authorize' | 'order';
    payer: {
        payment_method: 'paypal' | 'credit_card' | 'bank';
    };
    transactions: Array<{
        amount: {
            total: string;
            currency: string;
            details?: {
                subtotal?: string;
                tax?: string;
                shipping?: string;
                handling_fee?: string;
                insurance?: string;
                shipping_discount?: string;
            };
        };
        description?: string;
        item_list?: {
            items?: Array<{
                name: string;
                sku?: string;
                price: string;
                currency: string;
                quantity: number;
            }>;
        };
    }>;
    redirect_urls: {
        return_url: string;
        cancel_url: string;
    };
}

export interface PayPalExecutePaymentParams {
    token: string;
    paymentId: string;
    payerId: string;
}

export interface PayPalGetPaymentParams {
    token: string;
    paymentId: string;
}

export interface PayPalRefundSaleParams {
    token: string;
    saleId: string;
    amount?: {
        total: string;
        currency: string;
    };
    description?: string;
}

export interface PayPalCreateBillingPlanParams {
    token: string;
    name: string;
    description: string;
    type: 'FIXED' | 'INFINITE';
    payment_definitions: Array<{
        name: string;
        type: 'REGULAR' | 'TRIAL';
        frequency: 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';
        frequency_interval: string;
        amount: {
            value: string;
            currency: string;
        };
        cycles: string;
        charge_models?: Array<{
            type: 'SHIPPING' | 'TAX';
            amount: {
                value: string;
                currency: string;
            };
        }>;
    }>;
    merchant_preferences: {
        setup_fee?: {
            value: string;
            currency: string;
        };
        return_url: string;
        cancel_url: string;
        auto_bill_amount: 'YES' | 'NO';
        initial_fail_amount_action: 'CONTINUE' | 'CANCEL';
        max_fail_attempts: string;
    };
}

export interface PayPalActivateBillingPlanParams {
    token: string;
    planId: string;
}

export interface PayPalGetBillingPlanParams {
    token: string;
    planId: string;
}

export interface PayPalCreateBillingAgreementParams {
    token: string;
    name: string;
    description: string;
    start_date: string;
    plan: {
        id: string;
    };
    payer: {
        payment_method: 'paypal';
    };
}

export interface PayPalExecuteBillingAgreementParams {
    token: string;
    agreementToken: string;
}

export interface PayPalGetBillingAgreementParams {
    token: string;
    agreementId: string;
}

export interface PayPalCancelBillingAgreementParams {
    token: string;
    agreementId: string;
    note: string;
}

export interface PayPalListPaymentsParams {
    token: string;
    count?: number;
    start_index?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    start_time?: string;
    end_time?: string;
}

export interface PayPalListBillingPlansParams {
    token: string;
    page_size?: number;
    page?: number;
    status?: 'CREATED' | 'ACTIVE' | 'INACTIVE' | 'ALL';
}
