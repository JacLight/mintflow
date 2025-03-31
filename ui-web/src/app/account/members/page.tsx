import { Metadata } from 'next';
import Members from '@/components/screens/members';
import { getAllMembers } from '@/lib/admin-service';

export const metadata: Metadata = {
    title: 'Members | MintFlow',
    description: 'Manage team members in your MintFlow account',
};

// This is a server component in Next.js App Router
export default async function MembersPage() {
    // In a real implementation, we would fetch data from the API
    // For now, the component will handle data fetching internally

    // Example of how we could fetch data server-side:
    // const members = await getAllMembers();
    // return <Members initialMembers={members} />;

    return <Members />;
}
