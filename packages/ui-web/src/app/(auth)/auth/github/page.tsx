import { redirect } from 'next/navigation';
import { getOAuthUrl } from '../oauth-utils';

export default function GitHubAuthPage({
    searchParams
}: {
    searchParams: { callbackUrl?: string } | any
}) {
    const authUrl = getOAuthUrl('github', '/auth/github/callback')
    return redirect(authUrl.toString());
}
