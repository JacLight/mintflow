// Shopify data models

export interface ShopifyAuth {
    shopName: string;
    adminToken: string;
}

export interface ShopifyCustomer {
    id: number;
    email: string;
    accepts_marketing: boolean;
    created_at: string;
    updated_at: string;
    first_name: string;
    last_name: string;
    orders_count: number;
    state: string;
    total_spent: number;
    last_order_id: number;
    note: unknown;
    verified_email: boolean;
    tax_exempt: boolean;
    tags: string;
    last_order_name: unknown;
    currency: string;
    phone: string;
    addresses: unknown[];
    accepts_marketing_updated_at: string;
    marketing_opt_in_level: unknown;
    tax_exemptions: unknown[];
    email_marketing_consent: unknown;
    sms_marketing_consent: unknown;
    send_email_invite: boolean;
}

export interface ShopifyAddress {
    first_name: string;
    address1: string;
    phone: string;
    city: string;
    zip: string;
    province: string;
    country: string;
    last_name: string;
    address2: string;
    company: unknown;
    latitude: number;
    longitude: number;
    name: string;
    country_code: string;
    province_code: string;
}

export interface ShopifyProduct {
    id: number;
    title: string;
    body_html: string;
    vendor: string;
    product_type: string;
    status: ShopifyProductStatuses;
    tags: string;
    images: Partial<ShopifyImage>[];
    created_at: string;
    updated_at: string;
    variants?: ShopifyProductVariant[];
}

export interface ShopifyImage {
    id: number;
    src: string;
    attachment: string;
    position: number;
    product_id: number;
    created_at: string;
    updated_at: string;
}

export interface ShopifyProductVariant {
    id: number;
    product_id: number;
    title: string;
    price: string;
    sku: string;
    inventory_item_id: number;
    inventory_quantity: number;
    created_at: string;
    updated_at: string;
    [key: string]: string | number | unknown;
}

export interface ShopifyLineItem {
    variant_id: number;
    product_id: number;
    quantity: number;
    price: string;
    title: string;
    sku?: string;
    name?: string;
    grams?: number;
    properties?: Record<string, string>[];
    taxable?: boolean;
    tax_lines?: ShopifyTaxLine[];
    total_discount?: string;
    fulfillment_status?: string;
}

export interface ShopifyTaxLine {
    title: string;
    price: string;
    rate: number;
}

export interface ShopifyOrder {
    id?: number;
    line_items: Partial<ShopifyLineItem>[];
    customer?: Partial<ShopifyCustomer>;
    financial_status?: ShopifyOrderFinancialStatuses;
    email?: string;
    send_receipt?: boolean;
    send_fulfillment_receipt?: boolean;
    fulfillment_status?: string;
    tags?: string;
    phone?: string;
    note?: string;
    shipping_address?: Partial<ShopifyAddress>;
    billing_address?: Partial<ShopifyAddress>;
    created_at?: string;
    updated_at?: string;
    processed_at?: string;
    currency?: string;
    total_price?: string;
    subtotal_price?: string;
    total_tax?: string;
    total_discounts?: string;
    order_number?: number;
    name?: string;
    status?: string;
}

export interface ShopifyDraftOrder extends ShopifyOrder {
    status?: 'open' | 'invoice_sent' | 'completed';
}

export interface ShopifyTransaction {
    id?: number;
    order_id: number;
    currency: string;
    amount: string;
    source: string;
    kind: ShopifyTransactionKinds;
    parent_id?: number;
    test: boolean;
    created_at?: string;
    processed_at?: string;
    status?: string;
    gateway?: string;
    error_code?: string;
    message?: string;
}

export interface ShopifyFulfillment {
    id?: number;
    order_id: number;
    status: ShopifyFulfillmentStatuses;
    line_items: Partial<ShopifyLineItem>[];
    tracking_number?: string;
    tracking_company?: string;
    tracking_url?: string;
    created_at?: string;
    updated_at?: string;
    location_id?: number;
    notify_customer?: boolean;
}

export interface ShopifyFulfillmentEvent {
    id?: number;
    fulfillment_id: number;
    order_id: number;
    status: ShopifyFulfillmentEventStatuses;
    message?: string;
    created_at?: string;
    updated_at?: string;
    estimated_delivery_at?: string;
}

export interface ShopifyCollect {
    id?: number;
    product_id: number;
    collection_id: number;
    created_at?: string;
    updated_at?: string;
    position?: number;
    sort_value?: string;
}

export interface ShopifyCheckout {
    id: number;
    abandoned_checkout_url: string;
    completed_at: string;
    created_at: string;
    currency: string;
    customer: Partial<ShopifyCustomer>;
    email?: string;
    phone?: string;
    token?: string;
    total_price?: string;
    subtotal_price?: string;
    total_tax?: string;
    line_items?: Partial<ShopifyLineItem>[];
    shipping_address?: Partial<ShopifyAddress>;
    billing_address?: Partial<ShopifyAddress>;
}

export interface ShopifyWebhook {
    id: string;
    address: string;
    topic: string;
    format: string;
    created_at: string;
    updated_at: string;
}

export enum ShopifyProductStatuses {
    ACTIVE = 'active',
    ARCHIVED = 'archived',
    DRAFT = 'draft'
}

export enum ShopifyOrderFinancialStatuses {
    PENDING = 'pending',
    AUTHORIZED = 'authorized',
    PARTIALLY_PAID = 'partially_paid',
    PAID = 'paid',
    PARTIALLY_REFUNDED = 'partially_refunded',
    REFUNDED = 'refunded',
    VOIDED = 'voided'
}

export enum ShopifyTransactionKinds {
    AUTHORIZATION = 'authorization',
    SALE = 'sale',
    CAPTURE = 'capture',
    VOID = 'void',
    REFUND = 'refund'
}

export enum ShopifyFulfillmentStatuses {
    PENDING = 'pending',
    OPEN = 'open',
    SUCCESS = 'success',
    CANCELLED = 'cancelled',
    ERROR = 'error',
    FAILURE = 'failure'
}

export enum ShopifyFulfillmentEventStatuses {
    ATTEMPTED_DELIVERY = 'attempted_delivery',
    CARRIER_PICKED_UP = 'carrier_picked_up',
    CONFIRMED = 'confirmed',
    DELAYED = 'delayed',
    DELIVERED = 'delivered',
    FAILURE = 'failure',
    IN_TRANSIT = 'in_transit',
    LABEL_PRINTED = 'label_printed',
    LABEL_PURCHASED = 'label_purchased',
    OUT_FOR_DELIVERY = 'out_for_delivery',
    PICKED_UP = 'picked_up',
    READY_FOR_PICKUP = 'ready_for_pickup'
}

export interface WebhookPayload {
    [key: string]: any;
}
