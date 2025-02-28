export interface PipedriveAuth {
    access_token: string;
    data: {
        api_domain: string;
    };
}

export interface RequestParams {
    [key: string]: string | number | string[] | undefined;
}

export interface PaginationData {
    start: number;
    limit: number;
    more_items_in_collection: boolean;
    next_start: number;
}

export interface PipedriveResponse<T> {
    success: boolean;
    data: T;
    additional_data?: {
        pagination?: PaginationData;
    };
}

export interface PaginatedResponse<T> {
    success: boolean;
    data: T[];
    additional_data: {
        pagination: PaginationData;
    };
}

export interface Field {
    id: string;
    name: string;
    key: string;
    edit_flag: boolean;
    field_type: "varchar" | "text" | "enum" | "set" | "varchar_auto" | "double" | "monetary" | "user" | "org" | "people" | "phone" | "time" | "int" | "timerange" | "date" | "daterange" | "address";
    options?: Array<{ id: number; label: string }>;
}

export interface FieldsResponse {
    success: boolean;
    data: Field[];
    additional_data: {
        pagination: PaginationData;
    };
}

export interface StageWithPipelineInfo {
    id: number;
    name: string;
    pipeline_id: number;
    pipeline_name: string;
}

export interface GetStagesResponse {
    success: boolean;
    data: StageWithPipelineInfo[];
}

export interface Person {
    id: number;
    name: string;
    first_name?: string;
    last_name?: string;
    email?: string[];
    phone?: string[];
    owner_id?: number;
    org_id?: number;
    visible_to?: number;
    marketing_status?: string;
    label_ids?: number[];
    [key: string]: any;
}

export interface Organization {
    id: number;
    name: string;
    owner_id?: number;
    visible_to?: number;
    label_ids?: number[];
    address?: string;
    [key: string]: any;
}

export interface Deal {
    id: number;
    title: string;
    value?: number;
    currency?: string;
    status?: string;
    stage_id?: number;
    pipeline_id?: number;
    owner_id?: number;
    org_id?: number;
    person_id?: number;
    visible_to?: number;
    label_ids?: number[];
    probability?: number;
    expected_close_date?: string;
    [key: string]: any;
}

export interface Lead {
    id: number;
    title: string;
    owner_id?: number;
    organization_id?: number;
    person_id?: number;
    label_ids?: string[];
    expected_close_date?: string;
    visible_to?: number;
    value?: number;
    currency?: string;
    [key: string]: any;
}

export interface Activity {
    id: number;
    subject: string;
    type?: string;
    due_date?: string;
    due_time?: string;
    duration?: string;
    org_id?: number;
    person_id?: number;
    deal_id?: number;
    lead_id?: number;
    assigned_to_user_id?: number;
    done?: boolean;
    busy_flag?: string;
    note?: string;
    public_description?: string;
    [key: string]: any;
}

export interface Product {
    id: number;
    name: string;
    code?: string;
    unit?: string;
    tax?: number;
    active_flag?: boolean;
    visible_to?: number;
    owner_id?: number;
    prices?: Array<{
        currency: string;
        price: number;
        cost: number;
        overhead_cost: number;
    }>;
    [key: string]: any;
}

export interface Note {
    id: number;
    content: string;
    deal_id?: number;
    person_id?: number;
    org_id?: number;
    lead_id?: number;
    pinned_to_deal_flag?: boolean;
    pinned_to_person_flag?: boolean;
    pinned_to_organization_flag?: boolean;
    pinned_to_lead_flag?: boolean;
    [key: string]: any;
}

export interface User {
    id: number;
    name: string;
    email: string;
    active_flag: boolean;
    [key: string]: any;
}

export interface WebhookInformation {
    id: number;
    board_id: number;
}

export interface WebhookCreateResponse {
    status: string;
    success: boolean;
    data: {
        id: number;
    };
}

export interface WebhookPayload {
    v: number;
    matches_filters: {
        current: any[];
    };
    meta: {
        action: string;
        id: number;
        object: string;
        company_id: number;
        user_id: number;
        host: string;
        timestamp: number;
    };
    current: any;
    previous: any;
    event: string;
}
