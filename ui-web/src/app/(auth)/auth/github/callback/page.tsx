import { redirect } from 'next/navigation';
import { processOAuthCallback } from '../../callback-action';

export default async function GitHubCallbackPage({
    searchParams,
}: {
    searchParams: { code?: string; state?: string; error?: string };
}) {
    const { code, state, error } = searchParams;

    if (!code || !state) {
        return new Response('Missing required parameters', { status: 400 });
    }

    const result = await processOAuthCallback('github', code, state);
    const redirectUrl = result.redirectTo || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    redirect(redirectUrl)
}
