import { Metadata } from 'next';
import Cost from '@/components/screens/cost';
import { getCostStats, getCostByPeriod } from '@/lib/metrics-service';

export const metadata: Metadata = {
    title: 'Cost | MintFlow',
    description: 'View your MintFlow cost statistics',
};

// This is a server component in Next.js App Router
export default async function CostPage() {
    try {
        // Fetch cost data from the server
        const costStats = await getCostStats();
        const costByPeriod = await getCostByPeriod('daily');

        return <Cost initialCostStats={costStats} initialCostByPeriod={costByPeriod} />;
    } catch (error) {
        console.error('Error fetching cost data:', error);
        // If there's an error, render the component without initial data
        // The component will handle showing an error state
        return <Cost />;
    }
}
