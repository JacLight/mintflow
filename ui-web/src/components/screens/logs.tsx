'use client';
import React, { useState } from 'react';
import {
    Search,
    Calendar,
    ChevronDown,
    Download,
    Filter,
    AlertCircle,
    Info,
    ArrowDownCircle,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

const LogsPage = () => {
    const [selectedTab, setSelectedTab] = useState('all');

    // Mock data for logs
    const logs = [
        { id: 1, timestamp: '2025-03-28T15:21:35Z', type: 'info', message: 'User authentication successful', details: 'IP: 192.168.1.1, User: admin@appmint.com' },
        { id: 2, timestamp: '2025-03-28T14:47:12Z', type: 'warning', message: 'API rate limit approaching', details: 'Current usage: 85% of limit' },
        { id: 3, timestamp: '2025-03-28T14:32:08Z', type: 'error', message: 'Failed to process payment', details: 'Transaction ID: TX-987654, Error: Insufficient funds' },
        { id: 4, timestamp: '2025-03-28T12:15:23Z', type: 'info', message: 'New workspace created', details: 'Workspace: Analytics Dashboard, Creator: jacob@appmint.com' },
        { id: 5, timestamp: '2025-03-28T10:04:17Z', type: 'warning', message: 'High CPU usage detected', details: 'Server: app-server-03, Usage: 92%' },
        { id: 6, timestamp: '2025-03-27T22:36:52Z', type: 'info', message: 'System backup completed', details: 'Backup size: 2.4GB, Duration: 12 minutes' },
        { id: 7, timestamp: '2025-03-27T17:19:41Z', type: 'error', message: 'Database connection timeout', details: 'Service: user-management, Attempts: 3' }
    ];

    // Format timestamp for display
    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    // Get icon for log type
    const getLogIcon = (type) => {
        switch (type) {
            case 'error':
                return <AlertCircle className="w-4 h-4 text-red-500" />;
            case 'warning':
                return <AlertCircle className="w-4 h-4 text-yellow-500" />;
            case 'info':
                return <Info className="w-4 h-4 text-blue-500" />;
            default:
                return <Info className="w-4 h-4 text-gray-500" />;
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Left sidebar assumed to be included in a parent component */}

            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-semibold">Logs</h1>
                    <div className="flex items-center">
                        <div className="relative mr-4">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search logs..."
                                className="pl-10 pr-4 py-2 border rounded-md w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="flex items-center border rounded-md px-3 py-2 bg-white mr-2">
                            <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                            <span className="text-sm">Last 24 hours</span>
                            <ChevronDown className="w-4 h-4 ml-2 text-gray-500" />
                        </div>
                        <button className="flex items-center border rounded-md px-3 py-2 bg-white mr-2">
                            <Filter className="w-4 h-4 mr-2 text-gray-500" />
                            <span className="text-sm">Filter</span>
                        </button>
                        <button className="flex items-center border rounded-md px-3 py-2 bg-white">
                            <Download className="w-4 h-4 mr-2 text-gray-500" />
                            <span className="text-sm">Export</span>
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-md shadow-sm mb-6">
                    <div className="flex border-b">
                        <button
                            className={`px-4 py-3 text-sm font-medium ${selectedTab === 'all' ? 'border-b-2 border-black' : 'text-gray-500'}`}
                            onClick={() => setSelectedTab('all')}
                        >
                            All logs
                        </button>
                        <button
                            className={`px-4 py-3 text-sm font-medium ${selectedTab === 'api' ? 'border-b-2 border-black' : 'text-gray-500'}`}
                            onClick={() => setSelectedTab('api')}
                        >
                            API logs
                        </button>
                        <button
                            className={`px-4 py-3 text-sm font-medium ${selectedTab === 'auth' ? 'border-b-2 border-black' : 'text-gray-500'}`}
                            onClick={() => setSelectedTab('auth')}
                        >
                            Authentication
                        </button>
                        <button
                            className={`px-4 py-3 text-sm font-medium ${selectedTab === 'system' ? 'border-b-2 border-black' : 'text-gray-500'}`}
                            onClick={() => setSelectedTab('system')}
                        >
                            System
                        </button>
                        <button
                            className={`px-4 py-3 text-sm font-medium ${selectedTab === 'billing' ? 'border-b-2 border-black' : 'text-gray-500'}`}
                            onClick={() => setSelectedTab('billing')}
                        >
                            Billing
                        </button>
                    </div>

                    <div className="p-4">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-gray-500 text-sm">
                                    <th className="pb-2 font-medium">Time</th>
                                    <th className="pb-2 font-medium">Type</th>
                                    <th className="pb-2 font-medium">Message</th>
                                    <th className="pb-2 font-medium">Details</th>
                                    <th className="pb-2 font-medium"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map(log => (
                                    <tr key={log.id} className="border-t border-gray-100">
                                        <td className="py-3 pr-4 text-sm text-gray-600">
                                            {formatTimestamp(log.timestamp)}
                                        </td>
                                        <td className="py-3 pr-4 text-sm">
                                            <div className="flex items-center">
                                                {getLogIcon(log.type)}
                                                <span className="ml-2 capitalize">{log.type}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 pr-4 text-sm">{log.message}</td>
                                        <td className="py-3 pr-4 text-sm text-gray-500">{log.details}</td>
                                        <td className="py-3 text-right">
                                            <button className="text-gray-400 hover:text-gray-600">
                                                <ArrowDownCircle className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex items-center justify-between border-t p-4">
                        <div className="text-sm text-gray-500">
                            Showing 1-7 of 124 logs
                        </div>
                        <div className="flex items-center">
                            <button className="w-8 h-8 flex items-center justify-center rounded-md border mr-2 text-gray-400">
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button className="w-8 h-8 flex items-center justify-center rounded-md border bg-black text-white mr-2">
                                1
                            </button>
                            <button className="w-8 h-8 flex items-center justify-center rounded-md border mr-2">
                                2
                            </button>
                            <button className="w-8 h-8 flex items-center justify-center rounded-md border mr-2">
                                3
                            </button>
                            <span className="mx-2">...</span>
                            <button className="w-8 h-8 flex items-center justify-center rounded-md border mr-2">
                                12
                            </button>
                            <button className="w-8 h-8 flex items-center justify-center rounded-md border">
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-100 border border-gray-200 rounded-md p-4 text-sm">
                    <p className="font-medium mb-2">Retention policy</p>
                    <p className="text-gray-600">
                        Logs are retained for 30 days. For extended log retention, consider using our log export
                        feature or contact support to discuss enterprise log management options.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LogsPage;