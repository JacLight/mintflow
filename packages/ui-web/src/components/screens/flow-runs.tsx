import React, { useState } from 'react';
import {
    Play,
    Pause,
    RefreshCw,
    Filter,
    Search,
    ChevronDown,
    Clock,
    AlertCircle,
    CheckCircle2,
    XCircle,
    MoreHorizontal,
    ArrowUpRight,
    BarChart3,
    Layers,
    CalendarClock,
    PlusCircle
} from 'lucide-react';

const RunningFlowsPage = () => {
    const [activeTab, setActiveTab] = useState('active');

    // Mock data for flows
    const flows = [
        {
            id: 'flow-123456',
            name: 'User Onboarding Flow',
            status: 'running',
            startTime: '2025-03-28T09:15:22Z',
            duration: '1h 24m',
            progress: 78,
            nextStep: 'Send welcome email',
            triggers: 142,
            errors: 0,
            type: 'scheduled'
        },
        {
            id: 'flow-789012',
            name: 'Payment Processing',
            status: 'paused',
            startTime: '2025-03-28T10:42:05Z',
            duration: '47m',
            progress: 52,
            nextStep: 'Validate transaction',
            triggers: 89,
            errors: 3,
            type: 'api'
        },
        {
            id: 'flow-345678',
            name: 'Data Sync: Google Analytics',
            status: 'error',
            startTime: '2025-03-28T08:30:18Z',
            duration: '2h 12m',
            progress: 43,
            nextStep: 'Transform data',
            triggers: 1,
            errors: 2,
            type: 'scheduled'
        },
        {
            id: 'flow-901234',
            name: 'Customer Notification Service',
            status: 'running',
            startTime: '2025-03-28T11:05:33Z',
            duration: '32m',
            progress: 91,
            nextStep: 'Log notification',
            triggers: 324,
            errors: 0,
            type: 'webhook'
        },
        {
            id: 'flow-567890',
            name: 'Automated Monthly Report',
            status: 'completed',
            startTime: '2025-03-28T07:00:00Z',
            duration: '23m',
            progress: 100,
            nextStep: 'None',
            triggers: 1,
            errors: 0,
            type: 'scheduled'
        }
    ];

    // Format timestamp
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

    // Get status icon
    const getStatusIcon = (status) => {
        switch (status) {
            case 'running':
                return <Play className="w-4 h-4 text-green-500 fill-green-500" />;
            case 'paused':
                return <Pause className="w-4 h-4 text-amber-500" />;
            case 'error':
                return <AlertCircle className="w-4 h-4 text-red-500" />;
            case 'completed':
                return <CheckCircle2 className="w-4 h-4 text-blue-500" />;
            default:
                return <Clock className="w-4 h-4 text-gray-500" />;
        }
    };

    // Get trigger icon
    const getTriggerIcon = (type) => {
        switch (type) {
            case 'scheduled':
                return <CalendarClock className="w-4 h-4 text-purple-500" />;
            case 'webhook':
                return <ArrowUpRight className="w-4 h-4 text-teal-500" />;
            case 'api':
                return <Layers className="w-4 h-4 text-blue-500" />;
            default:
                return <Layers className="w-4 h-4 text-gray-500" />;
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Left sidebar assumed to be included in a parent component */}

            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-semibold">Flow Executions</h1>
                    <div className="flex items-center">
                        <button className="flex items-center px-3 py-2 border rounded-md mr-3 text-sm">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Refresh
                        </button>
                        <div className="relative mr-3">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search flows..."
                                className="pl-10 pr-4 py-2 border rounded-md w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <button className="flex items-center px-3 py-2 border rounded-md mr-3 bg-white text-sm">
                            <Filter className="w-4 h-4 mr-2" />
                            Filter
                            <ChevronDown className="w-4 h-4 ml-2" />
                        </button>
                        <button className="flex items-center px-4 py-2 bg-black text-white rounded-md">
                            <PlusCircle className="w-4 h-4 mr-2" />
                            New Flow
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-md shadow-sm mb-6">
                    <div className="flex border-b">
                        <button
                            className={`px-4 py-3 text-sm font-medium ${activeTab === 'active' ? 'border-b-2 border-black' : 'text-gray-500'}`}
                            onClick={() => setActiveTab('active')}
                        >
                            Active <span className="ml-1 px-1.5 py-0.5 bg-green-100 text-green-800 rounded-full text-xs">4</span>
                        </button>
                        <button
                            className={`px-4 py-3 text-sm font-medium ${activeTab === 'completed' ? 'border-b-2 border-black' : 'text-gray-500'}`}
                            onClick={() => setActiveTab('completed')}
                        >
                            Completed <span className="ml-1 px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs">12</span>
                        </button>
                        <button
                            className={`px-4 py-3 text-sm font-medium ${activeTab === 'error' ? 'border-b-2 border-black' : 'text-gray-500'}`}
                            onClick={() => setActiveTab('error')}
                        >
                            Failed <span className="ml-1 px-1.5 py-0.5 bg-red-100 text-red-800 rounded-full text-xs">2</span>
                        </button>
                        <button
                            className={`px-4 py-3 text-sm font-medium ${activeTab === 'scheduled' ? 'border-b-2 border-black' : 'text-gray-500'}`}
                            onClick={() => setActiveTab('scheduled')}
                        >
                            Scheduled
                        </button>
                    </div>

                    <div className="p-4">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-gray-500 text-sm">
                                    <th className="pb-3 font-medium">STATUS</th>
                                    <th className="pb-3 font-medium">FLOW NAME</th>
                                    <th className="pb-3 font-medium">TRIGGER</th>
                                    <th className="pb-3 font-medium">STARTED</th>
                                    <th className="pb-3 font-medium">DURATION</th>
                                    <th className="pb-3 font-medium">PROGRESS</th>
                                    <th className="pb-3 font-medium">METRICS</th>
                                    <th className="pb-3 font-medium"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {flows.map(flow => (
                                    <tr key={flow.id} className="border-t border-gray-100 hover:bg-gray-50">
                                        <td className="py-4 pr-4">
                                            <div className="flex items-center">
                                                {getStatusIcon(flow.status)}
                                                <span className="ml-2 capitalize">{flow.status}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 pr-4">
                                            <div className="font-medium">{flow.name}</div>
                                            <div className="text-xs text-gray-500 mt-1">ID: {flow.id}</div>
                                        </td>
                                        <td className="py-4 pr-4">
                                            <div className="flex items-center">
                                                {getTriggerIcon(flow.type)}
                                                <span className="ml-2 capitalize">{flow.type}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 pr-4 text-sm">
                                            {formatTimestamp(flow.startTime)}
                                        </td>
                                        <td className="py-4 pr-4 text-sm">
                                            {flow.duration}
                                        </td>
                                        <td className="py-4 pr-4">
                                            <div className="flex items-center">
                                                <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                                                    <div
                                                        className={`h-2 rounded-full ${flow.status === 'error' ? 'bg-red-500' :
                                                            flow.status === 'paused' ? 'bg-amber-500' : 'bg-green-500'
                                                            }`}
                                                        style={{ width: `${flow.progress}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-sm">{flow.progress}%</span>
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                Next: {flow.nextStep}
                                            </div>
                                        </td>
                                        <td className="py-4 pr-4">
                                            <div className="flex items-center space-x-4">
                                                <div className="flex items-center">
                                                    <RefreshCw className="w-3 h-3 text-gray-500 mr-1" />
                                                    <span className="text-sm">{flow.triggers}</span>
                                                </div>
                                                {flow.errors > 0 && (
                                                    <div className="flex items-center">
                                                        <XCircle className="w-3 h-3 text-red-500 mr-1" />
                                                        <span className="text-sm">{flow.errors}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-4 text-right">
                                            <div className="flex items-center justify-end">
                                                <button className="p-1 text-gray-400 hover:text-gray-700 mr-1">
                                                    <BarChart3 className="w-4 h-4" />
                                                </button>
                                                <button className="p-1 text-gray-400 hover:text-gray-700 mr-1">
                                                    {flow.status === 'running' ? (
                                                        <Pause className="w-4 h-4" />
                                                    ) : flow.status === 'paused' ? (
                                                        <Play className="w-4 h-4" />
                                                    ) : (
                                                        <RefreshCw className="w-4 h-4" />
                                                    )}
                                                </button>
                                                <button className="p-1 text-gray-400 hover:text-gray-700">
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex items-center justify-between border-t p-4">
                        <div className="text-sm text-gray-500">
                            Showing 5 of 18 flows
                        </div>
                        <div className="flex items-center">
                            <button className="px-3 py-1 border rounded-md bg-black text-white mr-2">1</button>
                            <button className="px-3 py-1 border rounded-md mr-2">2</button>
                            <button className="px-3 py-1 border rounded-md">3</button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                    <div className="bg-white rounded-md shadow-sm p-4">
                        <h3 className="font-medium mb-3 flex items-center">
                            <Play className="w-4 h-4 text-green-500 fill-green-500 mr-2" />
                            Active Flows
                        </h3>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">Total active:</span>
                            <span className="font-medium">14</span>
                        </div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">Running:</span>
                            <span className="font-medium">8</span>
                        </div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">Paused:</span>
                            <span className="font-medium">4</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Waiting:</span>
                            <span className="font-medium">2</span>
                        </div>
                    </div>

                    <div className="bg-white rounded-md shadow-sm p-4">
                        <h3 className="font-medium mb-3 flex items-center">
                            <BarChart3 className="w-4 h-4 text-blue-500 mr-2" />
                            Flow Performance
                        </h3>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">Avg. duration:</span>
                            <span className="font-medium">1h 12m</span>
                        </div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">Success rate:</span>
                            <span className="font-medium">94.2%</span>
                        </div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">Total executions:</span>
                            <span className="font-medium">1,249</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Avg. steps:</span>
                            <span className="font-medium">8.3</span>
                        </div>
                    </div>

                    <div className="bg-white rounded-md shadow-sm p-4">
                        <h3 className="font-medium mb-3 flex items-center">
                            <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
                            Recent Errors
                        </h3>
                        <div className="space-y-3">
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-medium">Data Sync: Google Analytics</span>
                                    <span className="text-xs text-gray-500">32m ago</span>
                                </div>
                                <p className="text-xs text-red-600">API rate limit exceeded at step: Transform data</p>
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-medium">Payment Processing</span>
                                    <span className="text-xs text-gray-500">47m ago</span>
                                </div>
                                <p className="text-xs text-red-600">Connection timeout at step: Validate transaction</p>
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-medium">Customer Import</span>
                                    <span className="text-xs text-gray-500">1h 15m ago</span>
                                </div>
                                <p className="text-xs text-red-600">Invalid data format at step: Parse customer data</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RunningFlowsPage;