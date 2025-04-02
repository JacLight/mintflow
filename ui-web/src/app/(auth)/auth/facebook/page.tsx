import { redirect } from 'next/navigation';
import { getOAuthUrl } from '../oauth-utils';


export default function FacebookAuthPage({
    searchParams
}: {
    searchParams: { callbackUrl?: string } | any
}) {
    // Redirect to provider's authorization URL
    const authUrl = getOAuthUrl('facebook', '/auth/facebook/callback')
    return redirect(authUrl.toString());

}
