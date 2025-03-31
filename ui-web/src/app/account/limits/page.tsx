import { Metadata } from 'next';
import Limits from '@/components/screens/limits';
import { getLimits } from '@/lib/admin-service';

export const metadata: Metadata = {
    title: 'Limits | MintFlow',
    description: 'View and manage account limits for your MintFlow account',
};

// This is a server component in Next.js App Router
export default async function LimitsPage() {
    // In a real implementation, we would fetch data from the API
    // For now, the component will handle data fetching internally

    // Example of how we could fetch data server-side:
    // const limits = await getLimits();
    // return <Limits initialLimits={limits} />;

    return <Limits />;
}
