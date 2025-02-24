export interface TwilioBaseConfig {
    accountSid: string;
    authToken: string;
    baseUrl: string;
}

export interface TwilioResponse {
    sid: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    error?: {
        code: string;
        message: string;
    };
}