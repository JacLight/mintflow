import { Metadata } from 'next';
import ApiKeys from '@/components/screens/api-keys';
import { getAllApiKeys } from '@/lib/admin-service';

export const metadata: Metadata = {
    title: 'API Keys | MintFlow',
    description: 'Manage your API keys for MintFlow',
};

// This is a server component in Next.js App Router
export default async function ApiKeysPage() {
    // Fetch API keys from the server
    try {
        const apiKeys = await getAllApiKeys();

        // Transform the data to match the UI component's expectations
        const transformedApiKeys = apiKeys.map(key => ({
            id: key.apiKeyId,
            name: key.name,
            prefix: key.apiKeyId.substring(0, 8), // Use first 8 chars of ID as prefix
            secret: '••••••••••••••••',
            fullSecret: key.fullKey || `${key.apiKeyId.substring(0, 8)}...`,
            created: key.createdAt,
            workspace: key.workspace,
            environment: key.environment,
            lastUsed: key.lastUsed || key.createdAt
        }));

        return <ApiKeys initialApiKeys={transformedApiKeys} />;
    } catch (error) {
        console.error('Error fetching API keys:', error);

        // If there's an error, render the component without initial data
        // The component will handle showing an error state and fetch data client-side
        return <ApiKeys />;
    }
}
