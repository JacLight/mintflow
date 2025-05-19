import { Metadata } from 'next';
import Workspaces from '@/components/screens/workspaces';
import { getAllWorkspaces } from '@/lib/admin-service';

export const metadata: Metadata = {
    title: 'Workspaces | MintFlow',
    description: 'Manage workspaces in your MintFlow account',
};

// This is a server component in Next.js App Router
export default async function WorkspacesPage() {
    try {
        // Fetch workspaces data from the server
        const workspaces = await getAllWorkspaces();

        return <Workspaces initialWorkspaces={workspaces} />;
    } catch (error) {
        console.error('Error fetching workspaces data:', error);
        // If there's an error, render the component without initial data
        // The component will handle showing an error state
        return <Workspaces />;
    }
}
