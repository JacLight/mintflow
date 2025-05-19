import { redirect } from 'next/navigation';
import { getOAuthUrl } from '../oauth-utils';

export default function GoogleAuthPage({
    searchParams
}: {
    searchParams: { callbackUrl?: string } | any
}) {
    const authUrl = getOAuthUrl('google', '/auth/google/callback')
    return redirect(authUrl.toString());
}
