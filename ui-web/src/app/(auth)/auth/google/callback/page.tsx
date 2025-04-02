import { redirect } from 'next/navigation';
import { processOAuthCallback } from '../../callback-action';
import { setAuthCookies } from '../../oauth-utils';

export default async function GoogleCallbackPage({
    searchParams,
}: {
    searchParams: { code?: string; state?: string; error?: string };
}) {
    // Properly await searchParams to fix the NextJS error
    const params = await Promise.resolve(searchParams);
    const code = params.code;
    const state = params.state;
    const error = params.error;

    // Handle missing parameters
    if (!code || !state) {
        return new Response('Missing required parameters', { status: 400 });
    }

    // Process the OAuth callback
    const result = await processOAuthCallback('google', code, state);
    // await setAuthCookies(result);

    const redirectUrl = result.redirectTo || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    redirect(redirectUrl)
}
