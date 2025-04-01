import { processOAuthCallback } from '../../callback-action';

export default async function GoogleCallbackPage({
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
    return processOAuthCallback('google', code, state);
}
