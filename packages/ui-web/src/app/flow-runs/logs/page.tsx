import { Metadata } from 'next';
import Logs from '@/components/screens/logs';
import { getLogs, getLogRetentionPolicy } from '@/lib/logs-service';

export const metadata: Metadata = {
    title: 'Logs | MintFlow',
    description: 'View logs from your flow executions',
};

// This is a server component in Next.js App Router
export default async function LogsPage() {
    try {
        // Fetch logs data from the server
        const logsData = await getLogs({ page: 1, limit: 20 });
        const retentionPolicy = await getLogRetentionPolicy();

        // Pass the data to the client component
        return <Logs initialLogs={logsData} initialRetentionPolicy={retentionPolicy} />;
    } catch (error) {
        console.error('Error fetching logs data:', error);
        // If there's an error, render the component without initial data
        // The component will handle showing an error state
        return <Logs />;
    }
}
