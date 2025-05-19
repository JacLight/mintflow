'use client';
import React, { useState, useEffect } from 'react';
import { Calendar, ChevronDown, Download, ChevronRight } from 'lucide-react';
import { UsageStats, UsageByPeriod, getUsageStats, getUsageByPeriod } from '@/lib/metrics-service';

// Extend the UsageStats interface to include requestsByUser
interface ExtendedUsageStats extends UsageStats {
    requestsByUser?: Record<string, number>;
}

interface UsageDashboardProps {
    initialUsageStats?: ExtendedUsageStats;
    initialUsageByPeriod?: UsageByPeriod;
}

const UsageDashboard = ({ initialUsageStats, initialUsageByPeriod }: UsageDashboardProps) => {
    const [usageData, setUsageData] = useState<ExtendedUsageStats>(initialUsageStats || {
        totalRequests: 0,
        totalTokens: 0,
        requestsByModel: {},
        tokensByModel: {},
        requestsByUser: {}
    });
    const [usageByPeriod, setUsageByPeriod] = useState<UsageByPeriod | null>(initialUsageByPeriod || null);
    const [isLoading, setIsLoading] = useState(!initialUsageStats);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // If initialUsageStats is provided, we don't need to fetch data
        if (initialUsageStats && initialUsageByPeriod) {
            return;
        }

        const fetchUsageData = async () => {
            try {
                setIsLoading(true);

                // Use the metrics-service functions instead of direct fetch
                const data = await getUsageStats();
                setUsageData(data);

                // Also fetch usage by period
                const periodData = await getUsageByPeriod('daily');
                setUsageByPeriod(periodData);

                setError(null);
            } catch (err) {
                console.error('Error fetching usage data:', err);
                setError('Failed to load usage data. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchUsageData();
    }, [initialUsageStats, initialUsageByPeriod]);

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Left sidebar assumed to be included in a parent component */}

            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <div className="text-2xl font-semibold">Usage</div>
                    <div className="flex items-center">
                        <button
                            className="text-blue-600 mr-4 text-sm"
                            aria-label="View legacy dashboard"
                        >
                            View legacy dashboard
                        </button>
                        <div className="flex items-center mr-4">
                            <span className="text-gray-600 mr-2 text-sm">Default project</span>
                            <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
                        </div>
                        <div className="flex items-center border rounded-md px-3 py-1 text-sm">
                            <Calendar className="w-4 h-4 mr-2" />
                            <span>03/13/25 - 03/28/25</span>
                            <ChevronDown className="w-4 h-4 ml-2" />
                        </div>
                        <button
                            className="ml-4 border rounded-md px-3 py-1 flex items-center text-sm"
                            aria-label="Export usage data"
                        >
                            <Download className="w-4 h-4 mr-1" />
                            Export
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-md shadow-sm p-4">
                        <div className="text-gray-600 mb-2 text-sm">Total Spend</div>
                        {isLoading ? (
                            <div className="text-2xl font-semibold mb-1">Loading...</div>
                        ) : (
                            <>
                                <div className="text-2xl font-semibold mb-1">
                                    ${(usageByPeriod?.data?.reduce((sum, day) => sum + (day.tokens * 0.00001), 0) || 0).toFixed(2)}
                                </div>
                                <div className="text-green-500 text-sm">
                                    ${(usageByPeriod?.data?.slice(-7)?.reduce((sum, day) => sum + (day.tokens * 0.00001), 0) || 0).toFixed(2)} last 7 days
                                </div>
                            </>
                        )}
                        <div className="mt-4 h-24 bg-gray-50 relative">
                            {/* Dynamic chart based on real data */}
                            {!isLoading && usageByPeriod?.data?.map((day, index) => (
                                <div
                                    key={index}
                                    className="absolute bottom-0 bg-purple-500"
                                    style={{
                                        left: `${(index / (usageByPeriod.data.length || 1)) * 100}%`,
                                        width: '4px',
                                        height: `${(day.tokens / (Math.max(...usageByPeriod.data.map(d => d.tokens)) || 1)) * 100}%`,
                                        minHeight: '1px'
                                    }}
                                ></div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-md shadow-sm p-4">
                        <div className="text-gray-600 mb-2 text-sm">Current Month Budget</div>
                        {isLoading ? (
                            <div className="text-xl font-semibold mb-1">Loading...</div>
                        ) : (
                            <>
                                <div className="text-xl font-semibold mb-1">
                                    ${(usageByPeriod?.data?.reduce((sum, day) => sum + (day.tokens * 0.00001), 0) || 0).toFixed(2)} / $400
                                </div>
                                <div className="mb-2">
                                    <div className="w-full bg-gray-200 h-2 rounded-full">
                                        <div
                                            className="bg-green-500 h-2 rounded-full"
                                            style={{
                                                width: `${Math.min(((usageByPeriod?.data?.reduce((sum, day) => sum + (day.tokens * 0.00001), 0) || 0) / 400) * 100, 100)}%`
                                            }}
                                        ></div>
                                    </div>
                                </div>
                                <div className="text-gray-600 text-sm">
                                    Resets in {new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() - new Date().getDate()} days
                                    <a href="#" className="text-blue-600 ml-2">Edit budget</a>
                                </div>
                            </>
                        )}
                        <div className="mt-6"></div>
                    </div>

                    <div className="bg-white rounded-md shadow-sm p-4">
                        <div className="text-gray-600 mb-2 text-sm">Total tokens</div>
                        <div className="text-2xl font-semibold mb-2">
                            {isLoading ? 'Loading...' : usageData.totalTokens.toLocaleString()}
                        </div>
                        <div className="h-12 bg-gray-50 relative mt-2 mb-3">
                            {/* Simplified line chart */}
                            <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-300"></div>
                            <div className="absolute bottom-0 left-1/3 w-1 h-3/4 bg-red-500"></div>
                            <div className="absolute bottom-0 right-1/3 w-1 h-1/2 bg-red-500"></div>
                        </div>
                        <div className="text-gray-600 mb-2 text-sm">Total requests</div>
                        <div className="text-xl font-semibold">
                            {isLoading ? 'Loading...' : usageData.totalRequests.toLocaleString()}
                        </div>
                    </div>
                </div>

                <div className="flex mb-4 border-b">
                    <button className="px-4 py-2 border-b-2 border-gray-800 font-medium text-sm">API capabilities</button>
                    <button className="px-4 py-2 text-gray-600 text-sm">Spend categories</button>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-6">
                    <div className="bg-white rounded-md shadow-sm p-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-medium">Chat Completions</h3>
                            <ChevronRight className="w-4 h-4" />
                        </div>
                        <div className="flex items-center mb-2 text-sm">
                            <div className="w-3 h-3 bg-purple-600 mr-2 rounded"></div>
                            <span>
                                {isLoading ? 'Loading...' :
                                    (usageData.requestsByModel?.['chat'] || 0).toLocaleString()} requests
                            </span>
                            <div className="w-3 h-3 bg-blue-300 mx-2 rounded"></div>
                            <span>
                                {isLoading ? 'Loading...' :
                                    (usageData.tokensByModel?.['chat'] || 0).toLocaleString()} tokens
                            </span>
                        </div>
                        <div className="text-gray-600 text-sm">
                            {isLoading ? '' :
                                `${((usageData.requestsByModel?.['chat'] || 0) /
                                    (usageData.totalRequests || 1) * 100).toFixed(1)}% of total requests`}
                        </div>
                        <div className="h-32 bg-gray-50 relative mt-4">
                            {/* Dynamic chart based on real data */}
                            <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-300"></div>
                            {!isLoading && usageByPeriod?.data?.map((day, index) => (
                                <div
                                    key={index}
                                    className="absolute bottom-0 bg-purple-600"
                                    style={{
                                        left: `${(index / (usageByPeriod.data.length || 1)) * 100}%`,
                                        width: '4px',
                                        height: `${((day.requestsByModel?.['chat'] || 0) /
                                            (Math.max(...usageByPeriod.data.map(d => d.requestsByModel?.['chat'] || 0)) || 1)) * 100}%`,
                                        minHeight: '1px'
                                    }}
                                ></div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-md shadow-sm p-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-medium">Images</h3>
                            <ChevronRight className="w-4 h-4" />
                        </div>
                        <div className="flex items-center mb-2 text-sm">
                            <div className="w-3 h-3 bg-purple-600 mr-2 rounded"></div>
                            <span>
                                {isLoading ? 'Loading...' :
                                    (usageData.requestsByModel?.['image'] || 0).toLocaleString()} requests
                            </span>
                            <div className="w-3 h-3 bg-blue-300 mx-2 rounded"></div>
                            <span>
                                {isLoading ? 'Loading...' :
                                    (usageData.tokensByModel?.['image'] || 0).toLocaleString()} images
                            </span>
                        </div>
                        <div className="text-gray-600 text-sm">
                            {isLoading ? '' :
                                `${((usageData.requestsByModel?.['image'] || 0) /
                                    (usageData.totalRequests || 1) * 100).toFixed(1)}% of total requests`}
                        </div>
                        <div className="h-32 bg-gray-50 relative mt-4">
                            <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-300"></div>
                            {!isLoading && usageByPeriod?.data?.map((day, index) => (
                                <div
                                    key={index}
                                    className="absolute bottom-0 bg-purple-600"
                                    style={{
                                        left: `${(index / (usageByPeriod.data.length || 1)) * 100}%`,
                                        width: '4px',
                                        height: `${((day.requestsByModel?.['image'] || 0) /
                                            (Math.max(...usageByPeriod.data.map(d => d.requestsByModel?.['image'] || 0)) || 1)) * 100}%`,
                                        minHeight: '1px'
                                    }}
                                ></div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-6">
                    <div className="bg-white rounded-md shadow-sm p-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-medium">Web Searches</h3>
                            <ChevronRight className="w-4 h-4" />
                        </div>
                        <div className="flex items-center mb-2 text-sm">
                            <div className="w-3 h-3 bg-purple-600 mr-2 rounded"></div>
                            <span>
                                {isLoading ? 'Loading...' :
                                    (usageData.requestsByModel?.['web_search'] || 0).toLocaleString()} requests
                            </span>
                        </div>
                        <div className="text-gray-600 text-sm">
                            {isLoading ? '' :
                                `${((usageData.requestsByModel?.['web_search'] || 0) /
                                    (usageData.totalRequests || 1) * 100).toFixed(1)}% of total requests`}
                        </div>
                        <div className="h-32 bg-gray-50 relative mt-4">
                            <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-300"></div>
                            {!isLoading && usageByPeriod?.data?.map((day, index) => (
                                <div
                                    key={index}
                                    className="absolute bottom-0 bg-purple-600"
                                    style={{
                                        left: `${(index / (usageByPeriod.data.length || 1)) * 100}%`,
                                        width: '4px',
                                        height: `${((day.requestsByModel?.['web_search'] || 0) /
                                            (Math.max(...usageByPeriod.data.map(d => d.requestsByModel?.['web_search'] || 0)) || 1)) * 100}%`,
                                        minHeight: '1px'
                                    }}
                                ></div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-md shadow-sm p-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-medium">File Searches</h3>
                            <ChevronRight className="w-4 h-4" />
                        </div>
                        <div className="flex items-center mb-2 text-sm">
                            <div className="w-3 h-3 bg-purple-600 mr-2 rounded"></div>
                            <span>
                                {isLoading ? 'Loading...' :
                                    (usageData.requestsByModel?.['file_search'] || 0).toLocaleString()} requests
                            </span>
                        </div>
                        <div className="text-gray-600 text-sm">
                            {isLoading ? '' :
                                `${((usageData.requestsByModel?.['file_search'] || 0) /
                                    (usageData.totalRequests || 1) * 100).toFixed(1)}% of total requests`}
                        </div>
                        <div className="h-32 bg-gray-50 relative mt-4">
                            <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-300"></div>
                            {!isLoading && usageByPeriod?.data?.map((day, index) => (
                                <div
                                    key={index}
                                    className="absolute bottom-0 bg-purple-600"
                                    style={{
                                        left: `${(index / (usageByPeriod.data.length || 1)) * 100}%`,
                                        width: '4px',
                                        height: `${((day.requestsByModel?.['file_search'] || 0) /
                                            (Math.max(...usageByPeriod.data.map(d => d.requestsByModel?.['file_search'] || 0)) || 1)) * 100}%`,
                                        minHeight: '1px'
                                    }}
                                ></div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* User section with real data */}
                {!isLoading && (
                    <div className="grid grid-cols-3 gap-4 mt-8">
                        <div className="flex items-center">
                            <button className="px-4 py-1 bg-gray-100 rounded-md text-sm mr-2">Users</button>
                            <button className="px-4 py-1 text-gray-600 text-sm mr-2">Services</button>
                            <button className="px-4 py-1 text-gray-600 text-sm">API Keys</button>
                        </div>
                        <div></div>
                        {/* This would be populated from user data from the API */}
                        {Object.entries(usageData.requestsByUser || {}).map(([user, count], index) => (
                            <div key={index} className="flex items-center">
                                <div className="w-6 h-6 bg-purple-600 rounded-full mr-2 text-white flex items-center justify-center text-xs">
                                    {user.charAt(0).toUpperCase()}
                                </div>
                                <span>{user}</span>
                                <span className="ml-auto text-sm">{(count as number).toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UsageDashboard;
