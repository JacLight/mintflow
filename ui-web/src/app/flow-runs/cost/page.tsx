import { Metadata } from 'next';
import Cost from '@/components/screens/cost';
import { getCostStats, getCostByPeriod } from '@/lib/metrics-service';

export const metadata: Metadata = {
    title: 'Cost | MintFlow',
    description: 'View your MintFlow cost statistics',
};

// This is a server component in Next.js App Router
export default async function CostPage() {
    // In a real implementation, we would fetch data from the API
    // For now, the component will handle data fetching internally

    // Example of how we could fetch data server-side:
    // const costStats = await getCostStats();
    // const costByPeriod = await getCostByPeriod('daily');
    // return <Cost costStats={costStats} costByPeriod={costByPeriod} />;

    return <Cost />;
}
