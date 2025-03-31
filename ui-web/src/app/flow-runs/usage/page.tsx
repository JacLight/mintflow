import { Metadata } from 'next';
import Usage from '@/components/screens/usage';
import { getUsageStats, getUsageByPeriod } from '@/lib/metrics-service';

export const metadata: Metadata = {
    title: 'Usage | MintFlow',
    description: 'View your MintFlow usage statistics',
};

// This is a server component in Next.js App Router
export default async function UsagePage() {
    try {
        // Fetch usage data from the server
        const usageStats = await getUsageStats();
        const usageByPeriod = await getUsageByPeriod('daily');

        return <Usage initialUsageStats={usageStats} initialUsageByPeriod={usageByPeriod} />;
    } catch (error) {
        console.error('Error fetching usage data:', error);
        // If there's an error, render the component without initial data
        // The component will handle showing an error state
        return <Usage />;
    }
}
