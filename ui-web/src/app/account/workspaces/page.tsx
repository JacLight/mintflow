import { Metadata } from 'next';
import Workspaces from '@/components/screens/workspaces';
import { getAllWorkspaces } from '@/lib/admin-service';

export const metadata: Metadata = {
    title: 'Workspaces | MintFlow',
    description: 'Manage workspaces in your MintFlow account',
};

// This is a server component in Next.js App Router
export default async function WorkspacesPage() {
    // In a real implementation, we would fetch data from the API
    // For now, the component will handle data fetching internally

    // Example of how we could fetch data server-side:
    // const workspaces = await getAllWorkspaces();
    // return <Workspaces initialWorkspaces={workspaces} />;

    return <Workspaces />;
}
