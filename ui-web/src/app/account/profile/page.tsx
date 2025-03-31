import { Metadata } from 'next';
import Profile from '@/components/screens/profile';
import { getProfile } from '@/lib/admin-service';

export const metadata: Metadata = {
    title: 'Profile | MintFlow',
    description: 'Manage your MintFlow profile',
};

// This is a server component in Next.js App Router
export default async function ProfilePage() {
    // In a real implementation, we would fetch data from the API
    // For now, the component will handle data fetching internally

    // Example of how we could fetch data server-side:
    // const profile = await getProfile();
    // return <Profile initialProfile={profile} />;

    return <Profile />;
}
