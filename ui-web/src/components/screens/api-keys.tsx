'use client';
import React, { useState, useEffect } from 'react';
import {
    Plus,
    Eye,
    EyeOff,
    Copy,
    Check,
    MoreVertical,
    ChevronDown,
    Search,
    AlertCircle,
    Info
} from 'lucide-react';

// Define the type for API key
interface ApiKeyData {
    id: string;
    name: string;
    prefix: string;
    secret: string;
    fullSecret: string;
    created: string;
    workspace: string;
    environment: string;
    lastUsed: string;
}

interface ApiKeysProps {
    initialApiKeys?: ApiKeyData[];
}

const ApiKeysPage = ({ initialApiKeys }: ApiKeysProps) => {
    const [selectedTab, setSelectedTab] = useState('active');
    const [copiedId, setCopiedId] = useState(null);
    const [showSecret, setShowSecret] = useState({});
    const [apiKeys, setApiKeys] = useState<ApiKeyData[]>(initialApiKeys || []);
    const [isLoading, setIsLoading] = useState(!initialApiKeys);
    const [error, setError] = useState(null);
    const [newKeyData, setNewKeyData] = useState(null);

    useEffect(() => {

    }, [initialApiKeys]);

    // Handle creating a new API key
    const handleCreateApiKey = async () => {
        try {
            const response = await fetch('/api/admin/api-keys', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: 'New API Key',
                    workspace: 'Default',
                    environment: 'Development'
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to create API key');
            }

            const newKey = await response.json();
            setNewKeyData(newKey);

            // Refresh the API keys list
            const keysResponse = await fetch('/api/admin/api-keys');
            if (keysResponse.ok) {
                const data = await keysResponse.json();
                const transformedData = data.map(key => ({
                    ...key,
                    secret: '••••••••••••••••',
                    fullSecret: key.fullKey || `${key.prefix}...`
                }));
                setApiKeys(transformedData);
            }
        } catch (err) {
            console.error('Error creating API key:', err);
            setError('Failed to create API key. Please try again later.');
        }
    };

    // Format timestamp for display
    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Handle copy to clipboard
    const handleCopy = (id, secret) => {
        navigator.clipboard.writeText(secret).then(() => {
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        });
    };

    // Toggle show/hide secret
    const toggleShowSecret = (id) => {
        setShowSecret(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Left sidebar assumed to be included in a parent component */}

            <div className="p-6 max-w-6xl">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-semibold">API keys</h1>
                    <div className="flex items-center">
                        <div className="relative mr-4">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search keys..."
                                className="pl-10 pr-4 py-2 border rounded-md w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="flex items-center border rounded-md px-3 py-2 bg-white mr-4">
                            <span className="text-sm mr-2">Workspace:</span>
                            <span className="text-sm font-medium">All workspaces</span>
                            <ChevronDown className="w-4 h-4 ml-2 text-gray-500" />
                        </div>
                        <button
                            className="flex items-center px-4 py-2 bg-black text-white rounded-md"
                            onClick={handleCreateApiKey}
                        >
                            <Plus className="w-4 h-4 mr-2" /> Create API Key
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-md shadow-sm mb-6">
                    <div className="flex border-b">
                        <button
                            className={`px-4 py-3 text-sm font-medium ${selectedTab === 'active' ? 'border-b-2 border-black' : 'text-gray-500'}`}
                            onClick={() => setSelectedTab('active')}
                        >
                            Active keys
                        </button>
                        <button
                            className={`px-4 py-3 text-sm font-medium ${selectedTab === 'deleted' ? 'border-b-2 border-black' : 'text-gray-500'}`}
                            onClick={() => setSelectedTab('deleted')}
                        >
                            Deleted keys
                        </button>
                    </div>

                    <div className="p-4">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-gray-500 text-sm">
                                    <th className="pb-2 font-medium">NAME</th>
                                    <th className="pb-2 font-medium">KEY</th>
                                    <th className="pb-2 font-medium">WORKSPACE</th>
                                    <th className="pb-2 font-medium">CREATED</th>
                                    <th className="pb-2 font-medium">LAST USED</th>
                                    <th className="pb-2 font-medium"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={6} className="py-4 text-center">Loading API keys...</td>
                                    </tr>
                                ) : error ? (
                                    <tr>
                                        <td colSpan={6} className="py-4 text-center text-red-500">{error}</td>
                                    </tr>
                                ) : apiKeys.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-4 text-center">No API keys found. Create your first API key to get started.</td>
                                    </tr>
                                ) : (
                                    apiKeys.map(key => (
                                        <tr key={key.id} className="border-t border-gray-100">
                                            <td className="py-3 pr-4">
                                                <div className="font-medium">{key.name}</div>
                                                <div className="flex items-center mt-1">
                                                    <span className={`text-xs px-2 py-0.5 rounded-full ${key.environment === 'Production'
                                                        ? 'bg-blue-100 text-blue-800'
                                                        : 'bg-green-100 text-green-800'
                                                        }`}>
                                                        {key.environment}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-3 pr-4">
                                                <div className="flex items-center">
                                                    <span className="font-mono text-sm">
                                                        {key.prefix}...{showSecret[key.id] ? key.fullSecret.substring(9) : key.secret}
                                                    </span>
                                                    <button
                                                        className="ml-2 text-gray-400 hover:text-gray-600"
                                                        onClick={() => toggleShowSecret(key.id)}
                                                        aria-label={showSecret[key.id] ? "Hide API key" : "Show API key"}
                                                    >
                                                        {showSecret[key.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                    </button>
                                                    <button
                                                        className="ml-2 text-gray-400 hover:text-gray-600"
                                                        onClick={() => handleCopy(key.id, showSecret[key.id] ? key.fullSecret : key.prefix)}
                                                        aria-label="Copy API key"
                                                    >
                                                        {copiedId === key.id ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="py-3 pr-4">
                                                <div className="flex items-center">
                                                    <div className={`w-3 h-3 rounded-full mr-2 ${key.workspace === 'Default' ? 'bg-purple-500' : 'bg-orange-700'
                                                        }`}></div>
                                                    <span>{key.workspace}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 pr-4 text-gray-500 text-sm">{formatDate(key.created)}</td>
                                            <td className="py-3 pr-4 text-gray-500 text-sm">{formatDate(key.lastUsed)}</td>
                                            <td className="py-3 text-right">
                                                <button
                                                    className="text-gray-400 hover:text-gray-600"
                                                    aria-label="More options"
                                                >
                                                    <MoreVertical className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-md p-4 mb-6">
                    <div className="flex">
                        <AlertCircle className="w-5 h-5 text-orange-500 mr-3 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-medium text-orange-800 mb-1">API Key Security</h3>
                            <p className="text-orange-700 text-sm">
                                Your API keys carry many privileges. Do not share your API keys in publicly accessible areas such as
                                GitHub, client-side code, or in your application. Rotate your keys periodically and restrict them to
                                specific IP addresses when possible.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-100 border border-gray-200 rounded-md p-4">
                    <div className="flex items-start">
                        <Info className="w-5 h-5 text-gray-500 mr-3 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-medium mb-1">Understanding API key types</h3>
                            <p className="text-gray-600 text-sm mb-3">
                                We recommend using different key types for different environments:
                            </p>
                            <ul className="text-gray-600 text-sm space-y-2">
                                <li className="flex items-start">
                                    <div className="w-4 h-4 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-xs mr-2 mt-0.5">P</div>
                                    <div>
                                        <span className="font-medium">Production keys</span> - Use in your production environment. These keys have
                                        no restrictions on rate limits or model access.
                                    </div>
                                </li>
                                <li className="flex items-start">
                                    <div className="w-4 h-4 rounded-full bg-green-100 text-green-800 flex items-center justify-center text-xs mr-2 mt-0.5">D</div>
                                    <div>
                                        <span className="font-medium">Development keys</span> - Use during development and testing. These keys may have
                                        reduced rate limits but are otherwise functionally identical to production keys.
                                    </div>
                                </li>
                            </ul>
                            <div className="mt-3">
                                <a href="#" className="text-blue-600 hover:underline text-sm">Learn more about API key best practices</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApiKeysPage;
