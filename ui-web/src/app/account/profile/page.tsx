import { Metadata } from 'next';
import Profile from '@/components/screens/profile';
import { getProfile } from '@/lib/admin-service';

export const metadata: Metadata = {
    title: 'Profile | MintFlow',
    description: 'Manage your MintFlow profile',
};

// This is a server component in Next.js App Router
export default async function ProfilePage() {
    try {
        // Fetch profile data from the server
        const profile = await getProfile();

        return <Profile initialProfile={profile} />;
    } catch (error) {
        console.error('Error fetching profile data:', error);
        // If there's an error, render the component without initial data
        // The component will handle showing an error state
        return <Profile />;
    }
}
