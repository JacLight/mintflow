'use server';

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { validateSocialLoginWithAppMint, login } from '@/lib/auth-service';

// Provider configuration
const providerConfig = {
    github: {
        tokenUrl: 'https://github.com/login/oauth/access_token',
        clientId: process.env.GITHUB_ID || '',
        clientSecret: process.env.GITHUB_SECRET || '',
        userApiUrl: 'https://api.github.com/user',
        userApiHeaders: {
            'User-Agent': 'MintFlow-App'
        }
    },
    google: {
        tokenUrl: 'https://oauth2.googleapis.com/token',
        clientId: process.env.GOOGLE_ID || '',
        clientSecret: process.env.GOOGLE_SECRET || '',
        userApiUrl: 'https://www.googleapis.com/oauth2/v2/userinfo'
    },
    facebook: {
        tokenUrl: 'https://graph.facebook.com/v12.0/oauth/access_token',
        clientId: process.env.FACEBOOK_ID || '',
        clientSecret: process.env.FACEBOOK_SECRET || '',
        userApiUrl: 'https://graph.facebook.com/me?fields=id,name,email,picture'
    },
};

// Helper function to parse state parameter
function parseState(state: string): { callbackUrl: string; nonce: string } {
    try {
        return JSON.parse(Buffer.from(state, 'base64').toString());
    } catch (error) {
        return { callbackUrl: '/', nonce: '' };
    }
}

// Helper function to get user profile from provider
async function getUserProfile(provider: string, accessToken: string): Promise<any> {
    const config = providerConfig[provider as keyof typeof providerConfig];

    if (!config) {
        throw new Error(`Unsupported provider: ${provider}`);
    }

    let userApiUrl = config.userApiUrl;
    let headers: Record<string, string> = { Authorization: `Bearer ${accessToken}` };

    // Special case for Facebook
    if (provider === 'facebook') {
        userApiUrl = `${config.userApiUrl}&access_token=${accessToken}`;
        headers = {}; // No Authorization header needed for Facebook
    }

    // Add custom headers for GitHub
    if (provider === 'github') {
        headers = {
            ...headers,
            'User-Agent': 'MintFlow-App'
        };
    }

    const response = await fetch(userApiUrl, { headers });

    if (!response.ok) {
        throw new Error(`Failed to fetch user profile: ${response.statusText}`);
    }

    return response.json();
}

// Helper function to get user email from GitHub (special case)
async function getGithubEmail(accessToken: string): Promise<string | null> {
    const response = await fetch('https://api.github.com/user/emails', {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'User-Agent': 'MintFlow-App'
        }
    });

    if (!response.ok) {
        return null;
    }

    const emails = await response.json();
    const primaryEmail = emails.find((email: any) => email.primary && email.verified);
    return primaryEmail ? primaryEmail.email : null;
}

// Define a result type for the OAuth callback
type OAuthCallbackResult = {
    success: boolean;
    redirectTo: string;
    error?: string;
    cookies?: {
        token: string;
        user: string;
        refreshToken: string;
    };
};

// Process OAuth callback
export async function processOAuthCallback(
    provider: string,
    code: string,
    state: string
): Promise<OAuthCallbackResult> {
    try {
        const config = providerConfig[provider as keyof typeof providerConfig];

        if (!config) {
            // Return result object instead of redirecting
            return {
                success: false,
                redirectTo: '/login/error?error=Unsupported+provider',
                error: 'Unsupported provider'
            };
        }

        // Exchange code for access token
        const tokenResponse = await fetch(config.tokenUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify({
                client_id: config.clientId,
                client_secret: config.clientSecret,
                code,
                redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/${provider}/callback`,
                grant_type: 'authorization_code',
            }),
        });

        if (!tokenResponse.ok) {
            throw new Error(`Failed to exchange code for token: ${tokenResponse.statusText}`);
        }

        const tokenData = await tokenResponse.json();
        const accessToken = tokenData.access_token;

        if (!accessToken) {
            throw new Error('No access token received');
        }

        // Get user profile
        let userProfile = await getUserProfile(provider, accessToken);

        // Special handling for GitHub emails
        if (provider === 'github' && !userProfile.email) {
            userProfile.email = await getGithubEmail(accessToken);
        }

        // Normalize user data
        const userData = {
            id: userProfile.id,
            name: userProfile.name,
            email: userProfile.email,
            image: userProfile.avatar_url ||
                (userProfile.picture?.data?.url || userProfile.picture) ||
                userProfile.image,
        };

        // Validate with AppMint - this is the key part that handles social login authentication
        const validatedUser = await validateSocialLoginWithAppMint(userData, {
            provider,
            providerAccountId: userData.id,
        });

        // Parse state to get callback URL
        const { callbackUrl } = parseState(state);

        // If user is validated, set cookies
        if (validatedUser.customer && validatedUser.token) {
            try {
                // Set cookies using Next.js cookies API
                // Use a different approach with response cookies
                const cookieOptions = {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax' as const,
                    path: '/',
                };

                // Store token and user data in cookies that will be sent with the response
                // These will be handled by the page component when it redirects
                return {
                    success: true,
                    redirectTo: '/welcome',
                    cookies: {
                        token: validatedUser.token,
                        user: JSON.stringify(validatedUser.customer),
                        refreshToken: validatedUser.refreshToken || ''
                    }
                };
            } catch (error) {
                console.error('Error setting cookies:', error);
            }
        }

        // Return success result
        return {
            success: true,
            redirectTo: '/welcome'
        };
    } catch (error: any) {
        console.error('Social login error:', error);

        // Return error result
        return {
            success: false,
            redirectTo: `/login/error?error=${encodeURIComponent(error.message || 'Authentication failed')}`,
            error: error.message || 'Authentication failed'
        };
    }
}
