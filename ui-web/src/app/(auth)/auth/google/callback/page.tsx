import { processOAuthCallback } from '../../callback-action';

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
    return processOAuthCallback('google', code, state);
}
