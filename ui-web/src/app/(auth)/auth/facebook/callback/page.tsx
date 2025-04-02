import { redirect } from 'next/navigation';
import { processOAuthCallback } from '../../callback-action';
import { setAuthCookies } from '../../oauth-utils';

export default async function FacebookCallbackPage({
    searchParams,
}: {
    searchParams: { code?: string; state?: string; error?: string };
}) {
    const { code, state, error } = searchParams;

    // Handle missing parameters
    if (!code || !state) {
        return new Response('Missing required parameters', { status: 400 });
    }

    // Process the OAuth callback
    const result = await processOAuthCallback('facebook', code, state);
    await setAuthCookies(result);

    // Create a redirect response
    const redirectUrl = result.redirectTo || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    redirect(redirectUrl)
}
