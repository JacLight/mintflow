export interface SendgridEmailAddress {
    email: string;
    name?: string;
}

export interface SendgridEmailContent {
    type: string;
    value: string;
}

export interface SendgridPersonalization {
    to: SendgridEmailAddress[];
    cc?: SendgridEmailAddress[];
    bcc?: SendgridEmailAddress[];
    subject?: string;
    dynamic_template_data?: Record<string, any>;
}

export interface SendgridMailData {
    personalizations: SendgridPersonalization[];
    from: SendgridEmailAddress;
    reply_to?: SendgridEmailAddress;
    subject?: string;
    content?: SendgridEmailContent[];
    template_id?: string;
}

export interface SendgridApiResponse {
    success: boolean;
    message?: string;
    errors?: any[];
}
