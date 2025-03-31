'use client';
import React, { useState, useEffect } from 'react';
import {
    Plus,
    ChevronRight,
    Info,
    MoreVertical
} from 'lucide-react';
import { Workspace } from '@/lib/admin-service';

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
                const response = await fetch('/api/admin/workspaces');
                if (!response.ok) {
                    throw new Error('Failed to fetch workspaces data');
                }
                const data = await response.json();
                setWorkspaces(data);
                setError(null);
            } catch (err) {
                console.error('Error fetching workspaces data:', err);
                setError('Failed to load workspaces data. Please try again later.');
                // Fallback to mock data
                setWorkspaces([
                    {
                        id: 'workspace_01',
                        name: 'Default',
                        createdAt: '',
                        memberCount: 1
                    },
                    {
                        id: 'workspace_02',
                        name: 'Claude Code',
                        createdAt: '2025-02-26T16:39:00Z',
                        memberCount: 2
                    }
                ]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchWorkspaces();
    }, [initialWorkspaces]);
    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Left sidebar assumed to be included in a parent component */}

            <div className="p-6 max-w-5xl">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center">
                        <h1 className="text-2xl font-semibold">Workspaces</h1>
                        <span className="ml-2 text-sm bg-gray-100 px-2 py-1 rounded-full">2</span>
                        <button className="ml-2">
                            <Info className="w-4 h-4 text-gray-400" />
                        </button>
                    </div>
                    <button className="flex items-center px-4 py-2 bg-black text-white rounded-md">
                        <Plus className="w-4 h-4 mr-2" /> Add Workspace
                    </button>
                </div>

                <div className="bg-white rounded-md shadow-sm overflow-hidden">
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
                            <tr className="border-t">
                                <td className="py-4 px-4 flex items-center">
                                    <div className="w-4 h-4 rounded bg-purple-500 mr-3"></div>
                                    <div>
                                        <div className="font-medium">Default</div>
                                        <div className="flex items-center mt-1">
                                            <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full text-gray-600">Default workspace</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4 px-4 text-gray-500">-</td>
                                <td className="py-4 px-4 text-gray-500">0 keys</td>
                                <td className="py-4 px-4 text-right">
                                    <div className="flex items-center justify-end">
                                        <button className="text-gray-400 hover:text-gray-600 mr-2">
                                            <MoreVertical className="w-5 h-5" />
                                        </button>
                                        <button className="text-gray-400 hover:text-gray-600">
                                            <ChevronRight className="w-5 h-5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                            <tr className="border-t">
                                <td className="py-4 px-4 flex items-center">
                                    <div className="w-4 h-4 rounded bg-orange-700 mr-3"></div>
                                    <div>
                                        <div className="font-medium">Claude Code</div>
                                        <div className="flex items-center mt-1">
                                            <span className="text-xs px-2 py-0.5 bg-blue-100 rounded-full text-blue-800 mr-2">Production</span>
                                            <span className="text-xs px-2 py-0.5 bg-green-100 rounded-full text-green-800">Active</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4 px-4 text-gray-500">Feb 26, 2025, 4:39 PM</td>
                                <td className="py-4 px-4 text-gray-500">1 key</td>
                                <td className="py-4 px-4 text-right">
                                    <div className="flex items-center justify-end">
                                        <button className="text-gray-400 hover:text-gray-600 mr-2">
                                            <MoreVertical className="w-5 h-5" />
                                        </button>
                                        <button className="text-gray-400 hover:text-gray-600">
                                            <ChevronRight className="w-5 h-5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
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
