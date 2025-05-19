import { Metadata } from 'next';
import Members from '@/components/screens/members';
import { getAllMembers } from '@/lib/admin-service';

export const metadata: Metadata = {
    title: 'Members | MintFlow',
    description: 'Manage team members in your MintFlow account',
};

// This is a server component in Next.js App Router
export default async function MembersPage() {
    try {
        // Fetch members data from the server
        const members = await getAllMembers();

        return <Members initialMembers={members} />;
    } catch (error) {
        console.error('Error fetching members data:', error);
        // If there's an error, render the component without initial data
        // The component will handle showing an error state
        return <Members />;
    }
}
