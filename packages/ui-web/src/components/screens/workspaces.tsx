'use client';
import React, { useState, useEffect } from 'react';
import {
    Plus,
    ChevronRight,
    Info,
    MoreVertical
} from 'lucide-react';
import { Workspace, getAllWorkspaces } from '@/lib/admin-service';

interface WorkspacesPageProps {
    initialWorkspaces?: Workspace[];
}

const WorkspacesPage = ({ initialWorkspaces }: WorkspacesPageProps) => {
    const [workspaces, setWorkspaces] = useState<Workspace[]>(initialWorkspaces || []);
    const [isLoading, setIsLoading] = useState(!initialWorkspaces);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // If initialWorkspaces is provided, we don't need to fetch data
        if (initialWorkspaces) {
            return;
        }

        const fetchWorkspaces = async () => {
            try {
                setIsLoading(true);
                // Use the admin-service function instead of direct fetch
                const data = await getAllWorkspaces();
                setWorkspaces(data);
                setError(null);
            } catch (err) {
                console.error('Error fetching workspaces data:', err);
                setError('Failed to load workspaces data. Please try again later.');
                // Set workspaces to empty array instead of using mock data
                setWorkspaces([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchWorkspaces();
    }, [initialWorkspaces]);

    // Format date for display
    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
        });
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Left sidebar assumed to be included in a parent component */}

            <div className="p-6 max-w-5xl">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center">
                        <h1 className="text-2xl font-semibold">Workspaces</h1>
                        <span className="ml-2 text-sm bg-gray-100 px-2 py-1 rounded-full">{workspaces.length}</span>
                        <button
                            className="ml-2"
                            aria-label="Information about workspaces"
                        >
                            <Info className="w-4 h-4 text-gray-400" />
                        </button>
                    </div>
                    <button
                        className="flex items-center px-4 py-2 bg-black text-white rounded-md"
                        aria-label="Add new workspace"
                    >
                        <Plus className="w-4 h-4 mr-2" /> Add Workspace
                    </button>
                </div>

                <div className="bg-white rounded-md shadow-sm overflow-hidden">
                    {isLoading ? (
                        <div className="text-center py-8">Loading workspaces data...</div>
                    ) : error ? (
                        <div className="text-center py-8 text-red-500">{error}</div>
                    ) : workspaces.length === 0 ? (
                        <div className="text-center py-8">No workspaces found. Create your first workspace to get started.</div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="text-left py-3 px-4 font-medium text-gray-700">NAME</th>
                                    <th className="text-left py-3 px-4 font-medium text-gray-700">CREATED AT</th>
                                    <th className="text-left py-3 px-4 font-medium text-gray-700">API KEYS</th>
                                    <th className="py-3 px-4"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {workspaces.map(workspace => (
                                    <tr key={workspace.id} className="border-t">
                                        <td className="py-4 px-4 flex items-center">
                                            <div className={`w-4 h-4 rounded ${workspace.name === 'Default' ? 'bg-purple-500' : 'bg-orange-700'} mr-3`}></div>
                                            <div>
                                                <div className="font-medium">{workspace.name}</div>
                                                <div className="flex items-center mt-1">
                                                    {workspace.name === 'Default' ? (
                                                        <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full text-gray-600">Default workspace</span>
                                                    ) : (
                                                        <>
                                                            <span className="text-xs px-2 py-0.5 bg-blue-100 rounded-full text-blue-800 mr-2">Production</span>
                                                            <span className="text-xs px-2 py-0.5 bg-green-100 rounded-full text-green-800">Active</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 text-gray-500">{formatDate(workspace.createdAt)}</td>
                                        <td className="py-4 px-4 text-gray-500">{workspace.memberCount || 0} members</td>
                                        <td className="py-4 px-4 text-right">
                                            <div className="flex items-center justify-end">
                                                <button
                                                    className="text-gray-400 hover:text-gray-600 mr-2"
                                                    aria-label={`More options for ${workspace.name} workspace`}
                                                >
                                                    <MoreVertical className="w-5 h-5" />
                                                </button>
                                                <button
                                                    className="text-gray-400 hover:text-gray-600"
                                                    aria-label={`View details for ${workspace.name} workspace`}
                                                >
                                                    <ChevronRight className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                <div className="mt-8 p-6 bg-gray-100 border border-gray-200 rounded-md">
                    <h2 className="font-medium mb-2">About workspaces</h2>
                    <p className="text-gray-600 text-sm mb-4">
                        Workspaces help you organize your API keys and usage. You can create separate workspaces for different
                        projects, environments, or teams. Each workspace can have its own API keys and usage tracking.
                    </p>
                    <h3 className="font-medium text-sm mt-4 mb-2">Benefits of using workspaces:</h3>
                    <ul className="text-gray-600 text-sm list-disc pl-5 space-y-1">
                        <li>Isolate production and development environments</li>
                        <li>Track usage and costs per project</li>
                        <li>Control access permissions at the workspace level</li>
                        <li>Set separate rate limits and quotas per workspace</li>
                    </ul>
                    <div className="mt-4">
                        <a href="#" className="text-blue-600 hover:underline text-sm">Learn more about workspaces</a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WorkspacesPage;
