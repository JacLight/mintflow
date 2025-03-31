import { Metadata } from 'next';
import Logs from '@/components/screens/logs';

export const metadata: Metadata = {
    title: 'Logs | MintFlow',
    description: 'View logs from your flow executions',
};

// This is a server component in Next.js App Router
export default async function LogsPage() {
    // In a real implementation, we would fetch data from the API
    // For now, the component will handle data fetching internally

    return <Logs />;
}
