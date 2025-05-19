import { Metadata } from 'next';
import Privacy from '@/components/screens/privacy';
import { getPrivacySettings } from '@/lib/admin-service';

export const metadata: Metadata = {
    title: 'Privacy Controls | MintFlow',
    description: 'Manage privacy settings for your MintFlow account',
};

// This is a server component in Next.js App Router
export default async function PrivacyPage() {
    try {
        // Fetch privacy settings data from the server
        const privacySettings = await getPrivacySettings();

        return <Privacy initialSettings={privacySettings} />;
    } catch (error) {
        console.error('Error fetching privacy settings data:', error);
        // If there's an error, render the component without initial data
        // The component will handle showing an error state
        return <Privacy />;
    }
}
