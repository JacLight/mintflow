import { Metadata } from 'next';
import Privacy from '@/components/screens/privacy';
import { getPrivacySettings } from '@/lib/admin-service';

export const metadata: Metadata = {
    title: 'Privacy Controls | MintFlow',
    description: 'Manage privacy settings for your MintFlow account',
};

// This is a server component in Next.js App Router
export default async function PrivacyPage() {
    // In a real implementation, we would fetch data from the API
    // For now, the component will handle data fetching internally

    // Example of how we could fetch data server-side:
    // const privacySettings = await getPrivacySettings();
    // return <Privacy initialSettings={privacySettings} />;

    return <Privacy />;
}
