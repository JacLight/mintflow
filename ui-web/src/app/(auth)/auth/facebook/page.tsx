import { redirect } from 'next/navigation';

// Provider configuration
const providerConfig = {
    facebook: {
        authUrl: 'https://www.facebook.com/v12.0/dialog/oauth',
        clientId: process.env.FACEBOOK_ID || '',
        scope: 'email,public_profile',
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

export default function FacebookAuthPage({
    searchParams
}: {
    searchParams: { callbackUrl?: string } | any
}) {
    const provider = 'facebook';
    const config = providerConfig.facebook;
    const callbackUrl = '/auth/facebook/callback';
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

    // Redirect to provider's authorization URL
    return redirect(authUrl.toString());
}
