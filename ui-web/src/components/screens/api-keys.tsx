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
import { ApiKey, createApiKey, getAllApiKeys } from '@/lib/admin-service';

// Define the type for API key - matches the transformed data from the server
interface ApiKeyData {
    id: string;
    name: string;
    prefix: string;
    secret: string;
    fullSecret: string;
    created: string;
    workspace: string;
    environment: string;
    lastUsed?: string; // Make optional to match ApiKey type
}

// Ensure the ApiKey type from admin-service matches our ApiKeyData interface
declare module '@/lib/admin-service' {
    interface ApiKey extends ApiKeyData { }
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
    const [error, setError] = useState<string | null>(null);
    const [newKeyData, setNewKeyData] = useState(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newKeyName, setNewKeyName] = useState('');
    const [newKeyExpiration, setNewKeyExpiration] = useState('');

    useEffect(() => {
        // If initialApiKeys is provided, we don't need to fetch data
        if (initialApiKeys) {
            return;
        }

        const fetchApiKeys = async () => {
            try {
                setIsLoading(true);

                // Use the admin-service function instead of direct fetch
                const data = await getAllApiKeys();
                setApiKeys(data);
                setError(null);
            } catch (err) {
                console.error('Error fetching API keys:', err);
                setError('Failed to load API keys. Please try again later.');
                setApiKeys([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchApiKeys();
    }, [initialApiKeys]);

    // Handle creating a new API key
    const handleCreateApiKey = async () => {
        try {
            if (!newKeyName.trim()) {
                setError('API key name is required');
                return;
            }

            setIsLoading(true);

            // Use the admin-service function instead of direct fetch
            const newKey = await createApiKey({
                name: newKeyName.trim(),
                workspace: 'Default',
                environment: 'Development'
                // Note: expiration is not supported in the current API
            });

            // Successfully created the key
            setNewKeyData(newKey);
            setShowCreateForm(false);
            setNewKeyName('');
            setNewKeyExpiration('');
            setError(null);

            // Refresh the API keys list
            const data = await getAllApiKeys();
            setApiKeys(data);
        } catch (err) {
            console.error('Error creating API key:', err);
            setError('Failed to create API key. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle form submission
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleCreateApiKey();
    };

    // Format timestamp for display
    const formatDate = (timestamp?: string) => {
        if (!timestamp) return '-';
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
                            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                            onClick={() => setShowCreateForm(true)}
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

            {/* Create API Key Modal */}
            {showCreateForm && !newKeyData && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                    onClick={(e) => {
                        // Close modal when clicking outside
                        if (e.target === e.currentTarget) {
                            setShowCreateForm(false);
                        }
                    }}
                >
                    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-semibold mb-4">Create New API Key</h2>

                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label htmlFor="keyName" className="block text-sm font-medium text-gray-700 mb-1">
                                    Key Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="keyName"
                                    type="text"
                                    className="w-full border rounded-md p-2"
                                    value={newKeyName}
                                    onChange={(e) => setNewKeyName(e.target.value)}
                                    placeholder="Enter a name for this API key"
                                    required
                                />
                            </div>

                            <div className="mb-6">
                                <label htmlFor="keyExpiration" className="block text-sm font-medium text-gray-700 mb-1">
                                    Expiration Date
                                </label>
                                <input
                                    id="keyExpiration"
                                    type="date"
                                    className="w-full border rounded-md p-2"
                                    value={newKeyExpiration}
                                    onChange={(e) => setNewKeyExpiration(e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    If no date is selected, the key will not expire
                                </p>
                            </div>

                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    className="px-4 py-2 border rounded-md"
                                    onClick={() => setShowCreateForm(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                                >
                                    Create Key
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* New API Key Created Modal */}
            {newKeyData && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50"
                    onClick={(e) => {
                        // Close modal when clicking outside
                        if (e.target === e.currentTarget) {
                            setNewKeyData(null);
                        }
                    }}
                >
                    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-semibold mb-4">API Key Created</h2>

                        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
                            <div className="flex">
                                <AlertCircle className="w-5 h-5 text-yellow-500 mr-3 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="font-medium text-yellow-800 mb-1">Important</h3>
                                    <p className="text-yellow-700 text-sm">
                                        This is the only time your full API key will be displayed. Please copy it now and store it securely.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                API Key
                            </label>
                            <div className="flex items-center">
                                <input
                                    type="text"
                                    className="w-full border rounded-md p-2 font-mono bg-gray-50"
                                    value={newKeyData.fullKey || ''}
                                    readOnly
                                    aria-label="Your new API key"
                                    placeholder="API key will appear here"
                                />
                                <button
                                    className="ml-2 text-gray-400 hover:text-gray-600"
                                    onClick={() => {
                                        navigator.clipboard.writeText(newKeyData.fullKey || '');
                                        setCopiedId('new-key');
                                        setTimeout(() => setCopiedId(null), 2000);
                                    }}
                                    aria-label="Copy API key"
                                >
                                    {copiedId === 'new-key' ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="button"
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                                onClick={() => setNewKeyData(null)}
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ApiKeysPage;
