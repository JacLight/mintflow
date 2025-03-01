export interface KlaviyoEmailAddress {
    email: string;
    first_name?: string;
    last_name?: string;
}

export interface KlaviyoProfile {
    email: string;
    first_name?: string;
    last_name?: string;
    phone_number?: string;
    external_id?: string;
    organization?: string;
    title?: string;
    properties?: Record<string, any>;
}

export interface KlaviyoEvent {
    event: string;
    customer_properties: KlaviyoProfile;
    properties?: Record<string, any>;
    time?: number;
}

export interface KlaviyoList {
    id: string;
    name: string;
    created: string;
    updated: string;
}

export interface KlaviyoSegment {
    id: string;
    name: string;
    created: string;
    updated: string;
}

export interface KlaviyoCampaign {
    id: string;
    name: string;
    subject: string;
    from_email: string;
    from_name: string;
    status: string;
    created: string;
    updated: string;
}

export interface KlaviyoTemplate {
    id: string;
    name: string;
    html: string;
    created: string;
    updated: string;
}

export interface KlaviyoApiResponse {
    success: boolean;
    message?: string;
    errors?: any[];
    data?: any;
}
