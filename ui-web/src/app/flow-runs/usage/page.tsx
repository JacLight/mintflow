import { Metadata } from 'next';
import Usage from '@/components/screens/usage';
import { getUsageStats, getUsageByPeriod } from '@/lib/metrics-service';

export const metadata: Metadata = {
    title: 'Usage | MintFlow',
    description: 'View your MintFlow usage statistics',
};

// This is a server component in Next.js App Router
export default async function UsagePage() {
    // In a real implementation, we would fetch data from the API
    // For now, the component will handle data fetching internally

    // Example of how we could fetch data server-side:
    // const usageStats = await getUsageStats();
    // const usageByPeriod = await getUsageByPeriod('daily');
    // return <Usage usageStats={usageStats} usageByPeriod={usageByPeriod} />;

    return <Usage />;
}
