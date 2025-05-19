import { Metadata } from 'next';
import Limits from '@/components/screens/limits';
import { getLimits } from '@/lib/admin-service';

export const metadata: Metadata = {
    title: 'Limits | MintFlow',
    description: 'View and manage account limits for your MintFlow account',
};

// This is a server component in Next.js App Router
export default async function LimitsPage() {
    try {
        // Fetch limits data from the server
        const limits = await getLimits();

        return <Limits initialLimits={limits} />;
    } catch (error) {
        console.error('Error fetching limits data:', error);
        // If there's an error, render the component without initial data
        // The component will handle showing an error state
        return <Limits />;
    }
}
