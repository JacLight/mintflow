import { Metadata } from 'next';
import ApiKeys from '@/components/screens/api-keys';
import { getAllApiKeys } from '@/lib/admin-service';

export const metadata: Metadata = {
    title: 'API Keys | MintFlow',
    description: 'Manage your API keys for MintFlow',
};

// This is a server component in Next.js App Router
export default async function ApiKeysPage() {
    // In a real implementation, we would fetch data from the API
    // For now, the component will handle data fetching internally

    // Example of how we could fetch data server-side:
    // const apiKeys = await getAllApiKeys();
    // return <ApiKeys initialApiKeys={apiKeys} />;

    return <ApiKeys />;
}
