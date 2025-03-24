import axios from 'axios';

export type SetWebhookRequest = {
    ip_address: string;
    max_connections: number;
    allowed_updates: string[];
    drop_pending_updates: boolean;
    secret_token: string;
};

export const telegramCommons = {
    getApiUrl: (botToken: string, methodName: string) => {
        return `https://api.telegram.org/bot${botToken}/${methodName}`;
    },
    subscribeWebhook: async (
        botToken: string,
        webhookUrl: string,
        overrides?: Partial<SetWebhookRequest>
    ) => {
        try {
            const response = await axios.post(
                `https://api.telegram.org/bot${botToken}/setWebhook`,
                {
                    allowed_updates: [],
                    url: webhookUrl,
                    ...overrides,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );
            return response.data;
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                throw new Error(`Telegram API error: ${error.message}`);
            } else if (error instanceof Error) {
                throw new Error(`Unexpected error: ${error.message}`);
            } else {
                throw new Error('Unknown error occurred');
            }
        }
    },
    unsubscribeWebhook: async (botToken: string) => {
        try {
            const response = await axios.get(
                `https://api.telegram.org/bot${botToken}/deleteWebhook`
            );
            return response.data;
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                throw new Error(`Telegram API error: ${error.message}`);
            } else if (error instanceof Error) {
                throw new Error(`Unexpected error: ${error.message}`);
            } else {
                throw new Error('Unknown error occurred');
            }
        }
    },
};
