import { Metadata } from 'next';
import Executions from '@/components/screens/executions';
import { getFlowExecutions, getFlowExecutionStats } from '@/lib/executions-service';

export const metadata: Metadata = {
    title: 'Flow Runs | MintFlow',
    description: 'View and manage your flow executions',
};

// This is a server component in Next.js App Router
export default async function ExecutionsPage() {
    try {
        // Fetch executions data from the server
        const executions = await getFlowExecutions('active');
        const stats = await getFlowExecutionStats();

        // Pass the data to the client component
        return <Executions initialExecutions={executions} initialStats={stats} />;
    } catch (error) {
        console.error('Error fetching executions data:', error);
        // If there's an error, render the component without initial data
        // The component will handle showing an error state and fetching data client-side
        return <Executions />;
    }
}
