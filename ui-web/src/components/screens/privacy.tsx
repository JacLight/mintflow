'use client';
import React, { useState, useEffect } from 'react';
import { ExternalLink, Info } from 'lucide-react';
import { PrivacySettings, getPrivacySettings } from '@/lib/admin-service';

interface PrivacyControlsProps {
    initialSettings?: PrivacySettings;
}

const PrivacyControls = ({ initialSettings }: PrivacyControlsProps) => {
    const [settings, setSettings] = useState<PrivacySettings | null>(initialSettings || null);
    const [isLoading, setIsLoading] = useState(!initialSettings);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // If initialSettings is provided, we don't need to fetch data
        if (initialSettings) {
            return;
        }

        const fetchPrivacySettings = async () => {
            try {
                setIsLoading(true);
                // Use the admin-service function instead of direct fetch
                const data = await getPrivacySettings();
                setSettings(data);
                setError(null);
            } catch (err) {
                console.error('Error fetching privacy settings:', err);
                setError('Failed to load privacy settings. Please try again later.');
                // Set settings to null instead of using mock data
                setSettings(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPrivacySettings();
    }, [initialSettings]);

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Sidebar is assumed to be in a parent layout component */}

            <div className="p-6 max-w-4xl">
                <h1 className="text-2xl font-semibold mb-6">Data retention period</h1>

                <p className="text-gray-700 mb-4">
                    The data retention period only applies to inputs and outputs sent via the Anthropic API, and not to Workbench,
                    Claude.ai, or any other Anthropic products. Please also see Anthropic's{' '}
                    <a href="#" className="text-red-500 hover:underline">Privacy Policy</a> and{' '}
                    <a href="#" className="text-red-500 hover:underline">Commercial Terms</a>.
                </p>

                <div className="flex items-center justify-between bg-gray-100 p-4 rounded-md mb-6">
                    <div className="font-medium">
                        {isLoading ? 'Loading...' : settings ? `${settings.dataRetention.logs} day retention period` : 'Retention period not available'}
                    </div>
                    <a
                        href="#"
                        className="flex items-center text-gray-700 hover:text-gray-900"
                        aria-label="Contact support for data retention settings"
                    >
                        Contact Support <ExternalLink className="w-4 h-4 ml-1" />
                    </a>
                </div>

                <h2 className="text-xl font-semibold mb-4 mt-8">Allow user feedback</h2>

                <div className="bg-white p-4 rounded-md shadow-sm mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="mb-2">Allow users to send feedback on model response to Anthropic. Reports include the full prompt, response, and feedback for future improvements to our models.</p>
                        </div>
                        <div>
                            <div className={`w-12 h-6 ${settings?.dataSharingConsent ? 'bg-green-500' : 'bg-gray-200'} rounded-full relative`}>
                                <div className={`absolute ${settings?.dataSharingConsent ? 'right-1' : 'left-1'} top-1 bg-white w-4 h-4 rounded-full`}></div>
                            </div>
                        </div>
                    </div>
                </div>

                <h2 className="text-xl font-semibold mb-4 mt-8">Allow downloading batch results in console</h2>

                <div className="bg-white p-4 rounded-md shadow-sm mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="mb-2">Any user with an API key can still download batches via the API.</p>
                        </div>
                        <div>
                            <select
                                className="border rounded-md p-2 w-48"
                                aria-label="Select workspaces for batch download permissions"
                            >
                                <option>All workspaces</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivacyControls;
