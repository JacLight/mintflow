import { Metadata } from 'next';
import Executions from '@/components/screens/executions';

export const metadata: Metadata = {
    title: 'Flow Runs | MintFlow',
    description: 'View and manage your flow executions',
};

// This is a server component in Next.js App Router
export default async function ExecutionsPage() {
    // In a real implementation, we would fetch data from the API
    // For now, the component will handle data fetching internally

    return <Executions />;
}
