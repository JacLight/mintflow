import axios from 'axios';

export interface OAuthConfig {
    client_id: string;
    client_secret: string;
    redirect_uri: string;
    refresh_token?: string;
    access_token?: string;
}

export const gmailCommons = {
    getAuthUrl: (config: OAuthConfig) => {
        const scopes = [
            'https://www.googleapis.com/auth/gmail.send',
            'https://www.googleapis.com/auth/gmail.readonly',
            'https://www.googleapis.com/auth/gmail.modify',
            'https://www.googleapis.com/auth/gmail.compose'
        ];
        
        return `https://accounts.google.com/o/oauth2/v2/auth?` +
            `client_id=${encodeURIComponent(config.client_id)}` +
            `&redirect_uri=${encodeURIComponent(config.redirect_uri)}` +
            `&response_type=code` +
            `&scope=${encodeURIComponent(scopes.join(' '))}` +
            `&access_type=offline` +
            `&prompt=consent`;
    },
    
    getToken: async (code: string, config: OAuthConfig) => {
        try {
            const response = await axios.post(
                'https://oauth2.googleapis.com/token',
                {
                    code,
                    client_id: config.client_id,
                    client_secret: config.client_secret,
                    redirect_uri: config.redirect_uri,
                    grant_type: 'authorization_code'
                },
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
            );
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(`Google OAuth error: ${error.message}`);
            } else if (error instanceof Error) {
                throw new Error(`Unexpected error: ${error.message}`);
            } else {
                throw new Error('Unknown error occurred');
            }
        }
    },
    
    refreshToken: async (config: OAuthConfig) => {
        if (!config.refresh_token) {
            throw new Error('Refresh token is required');
        }
        
        try {
            const response = await axios.post(
                'https://oauth2.googleapis.com/token',
                {
                    client_id: config.client_id,
                    client_secret: config.client_secret,
                    refresh_token: config.refresh_token,
                    grant_type: 'refresh_token'
                },
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
            );
            return {
                ...config,
                access_token: response.data.access_token
            };
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(`Google OAuth error: ${error.message}`);
            } else if (error instanceof Error) {
                throw new Error(`Unexpected error: ${error.message}`);
            } else {
                throw new Error('Unknown error occurred');
            }
        }
    },
    
    getApiUrl: (endpoint: string) => {
        return `https://gmail.googleapis.com/gmail/v1/users/me/${endpoint}`;
    }
};