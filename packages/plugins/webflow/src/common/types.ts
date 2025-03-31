export interface WebflowSite {
    _id: string;
    name: string;
    shortName: string;
    domain: string;
    previewUrl: string;
    timezone: string;
    createdOn: string;
    lastPublished: string;
    lastUpdated: string;
}

export interface WebflowCollection {
    _id: string;
    name: string;
    slug: string;
    singularName: string;
    fields: WebflowField[];
}

export interface WebflowField {
    id: string;
    slug: string;
    name: string;
    type: string;
    required: boolean;
    editable: boolean;
    validations?: {
        options?: any[];
    };
}

export interface WebflowCollectionItem {
    _id: string;
    name: string;
    slug: string;
    _draft: boolean;
    _archived: boolean;
    [key: string]: any;
}

export interface WebflowOrder {
    orderId: string;
    customerInfo: {
        email: string;
        firstName: string;
        lastName: string;
    };
    orderItems: WebflowOrderItem[];
    shippingInfo: {
        address: string;
        city: string;
        state: string;
        country: string;
        zipCode: string;
    };
    paymentInfo: {
        status: string;
        amount: number;
        currency: string;
    };
    createdOn: string;
    status: string;
}

export interface WebflowOrderItem {
    productId: string;
    productName: string;
    variantId: string;
    variantName: string;
    price: number;
    quantity: number;
}

export interface WebflowFormSubmission {
    name: string;
    site: string;
    data: Record<string, any>;
    _id: string;
    d: string; // date
}

export interface WebflowWebhook {
    _id: string;
    triggerType: string;
    site: string;
    url: string;
    createdOn: string;
    lastUsed: string;
}

export interface WebflowApiResponse<T> {
    data?: T;
    error?: string;
}

export interface WebhookInformation {
    webhookId: string;
}
