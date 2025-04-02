import { cookies } from "next/headers";

// Provider configuration
const providerConfig = {
    github: {
        authUrl: 'https://github.com/login/oauth/authorize',
        clientId: process.env.GITHUB_ID || '',
        scope: 'user:email',
    },
    facebook: {
        authUrl: 'https://www.facebook.com/v12.0/dialog/oauth',
        clientId: process.env.FACEBOOK_ID || '',
        scope: 'email,public_profile',
    },
    google: {
        authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
        clientId: process.env.GOOGLE_ID || '',
        scope: 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
    }
};


// Helper function to generate state parameter
function generateState(callbackUrl: string): string {
    const state = {
        callbackUrl,
        nonce: Math.random().toString(36).substring(2, 15),
    };
    return Buffer.from(JSON.stringify(state)).toString('base64');
}

export function getOAuthUrl(provider: string, callbackUrl: string) {
    const config = providerConfig[provider];
    const state = generateState(callbackUrl);
    const host = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const redirectUrl = host + callbackUrl;

    // Build authorization URL
    const authUrl = new URL(config.authUrl);
    authUrl.searchParams.set('client_id', config.clientId);
    authUrl.searchParams.set('redirect_uri', redirectUrl);
    authUrl.searchParams.set('scope', config.scope);
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('response_type', 'code');
    return authUrl.toString();
}

export async function setAuthCookies(result: any) {
    if (result.cookies) {
        const cookieStore = await cookies()
        const secure = process.env.NODE_ENV === 'production' ? 'Secure;' : '';
        const domain = process.env.NEXT_PUBLIC_APP_URL ? new URL(process.env.NEXT_PUBLIC_APP_URL).hostname : 'localhost';
        const cookieOptions: any = { secure, path: '/', domain: domain, sameSite: 'lax', httpOnly: secure, maxAge: 60 * 60 * 24 * 7 };
        cookieStore.set('token', result.cookies.token, cookieOptions);
        cookieStore.set('user', result.cookies.user, cookieOptions);
        if (result.cookies.refreshToken) {
            cookieStore.set('refreshToken', result.cookies.refreshToken, cookieOptions);
        }
    }
}