'use client';
import React, { useState, useEffect } from 'react';
import { Copy, Building, ChevronDown } from 'lucide-react';
import { Profile as ProfileType, getProfile } from '@/lib/admin-service';

interface OrganizationProfileProps {
    initialProfile?: ProfileType;
}

const OrganizationProfile = ({ initialProfile }: OrganizationProfileProps) => {
    const [profile, setProfile] = useState<ProfileType | null>(initialProfile || null);
    const [isLoading, setIsLoading] = useState(!initialProfile);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // If initialProfile is provided, we don't need to fetch data
        if (initialProfile) {
            return;
        }

        const fetchProfile = async () => {
            try {
                setIsLoading(true);
                // Use the admin-service function instead of direct fetch
                const data = await getProfile();
                setProfile(data);
                setError(null);
            } catch (err) {
                console.error('Error fetching profile data:', err);
                setError('Failed to load profile data. Please try again later.');
                // Set profile to null instead of using mock data
                setProfile(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, [initialProfile]);

    // Default organization name to display while loading or if data is not available
    const organizationName = isLoading ? 'Loading...' : (profile?.name || 'Organization name not available');

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Sidebar is assumed to be in a parent layout component */}

            <div className="p-6 max-w-4xl">
                <h1 className="text-2xl font-semibold mb-6">Organization</h1>

                <div className="bg-white rounded-md shadow-sm p-6 mb-6">
                    <h2 className="text-lg font-medium mb-4">Organization name</h2>
                    <input
                        type="text"
                        className="w-full border rounded-md p-2 mb-6"
                        value={organizationName}
                        readOnly={isLoading}
                        aria-label="Organization name"
                    />

                    <h2 className="text-lg font-medium mb-4">Primary business address</h2>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <input
                            type="text"
                            className="border rounded-md p-2"
                            placeholder="Address line 1"
                            aria-label="Address line 1"
                        />
                        <input
                            type="text"
                            className="border rounded-md p-2"
                            placeholder="Line 2"
                            aria-label="Address line 2"
                        />
                    </div>

                    <div className="grid grid-cols-4 gap-4 mb-6">
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Country</label>
                            <div className="flex items-center justify-between border rounded-md p-2 w-full">
                                <span>United States</span>
                                <ChevronDown className="w-4 h-4 text-gray-500" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">State or province</label>
                            <input
                                type="text"
                                className="w-full border rounded-md p-2"
                                placeholder="State"
                                aria-label="State or province"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">City</label>
                            <input
                                type="text"
                                className="w-full border rounded-md p-2"
                                placeholder="City"
                                aria-label="City"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Postal code</label>
                            <input
                                type="text"
                                className="w-full border rounded-md p-2"
                                placeholder="Postal code"
                                aria-label="Postal code"
                            />
                        </div>
                    </div>

                    <div className="flex items-center text-sm text-gray-600 mb-2">
                        <span>Organization ID: {isLoading ? 'Loading...' : (profile?.id || 'ID not available')}</span>
                        <button
                            className="ml-2 text-gray-500"
                            aria-label="Copy organization ID"
                        >
                            <Copy className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrganizationProfile;
