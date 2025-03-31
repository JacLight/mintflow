'use client';
import React, { useState } from 'react';
import {
    CreditCard,
    Download,
    ChevronDown,
    ExternalLink,
    Bell,
    Calendar,
    Copy,
    Check,
    AlertCircle,
    Eye,
    EyeOff,
    Info,
    Edit,
    Plus,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

const BillingPage = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [viewCardDetails, setViewCardDetails] = useState(false);
    const [showAddPayment, setShowAddPayment] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);

    // Sample invoice data
    const invoices = [
        { id: 'INV-20250323', date: '2025-03-23', type: 'Credit grant', status: 'Expiring 3/24/2026', amount: 266.50, paid: true },
        { id: 'INV-20250318', date: '2025-03-18', type: 'Credit grant', status: 'Expiring 3/19/2026', amount: 266.50, paid: true },
        { id: 'INV-20250315', date: '2025-03-15', type: 'Credit grant', status: 'Expiring 3/16/2026', amount: 213.20, paid: true },
        { id: 'INV-20250312', date: '2025-03-12', type: 'Credit grant', status: 'Expiring 3/13/2026', amount: 266.50, paid: true },
        { id: 'INV-20250305', date: '2025-03-05', type: 'Credit grant', status: 'Expiring 3/6/2026', amount: 266.50, paid: true },
        { id: 'INV-20250301', date: '2025-03-01', type: 'Credit grant', status: 'Expiring 3/2/2026', amount: 266.50, paid: true },
        { id: 'INV-20250228', date: '2025-02-28', type: 'Monthly invoice', status: 'Paid', amount: 0.00, paid: true },
        { id: 'INV-20250227A', date: '2025-02-27', type: 'Credit grant', status: 'Expiring 2/28/2026', amount: 266.50, paid: true },
        { id: 'INV-20250227B', date: '2025-02-27', type: 'Credit grant', status: 'Expiring 2/28/2026', amount: 106.60, paid: true },
        { id: 'INV-20250224', date: '2025-02-24', type: 'Credit grant', status: 'Expiring 2/25/2026', amount: 106.60, paid: true },
        { id: 'INV-20240731', date: '2024-07-31', type: 'Free credits', status: 'Expired', amount: 5.00, paid: true },
    ];

    // Payment methods
    const paymentMethods = [
        { id: 'card-1', type: 'visa', lastFour: '0881', expiry: '09/26', name: 'J. Ajiboye', isDefault: true },
        { id: 'card-2', type: 'mastercard', lastFour: '4523', expiry: '11/27', name: 'J. Ajiboye', isDefault: false },
    ];

    // Format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    // Copy invoice ID to clipboard
    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Left sidebar assumed to be included in a parent component */}

            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-semibold">Billing</h1>
                    <div className="flex space-x-3">
                        <button className="px-3 py-2 border rounded-md flex items-center bg-white text-sm">
                            <Download className="w-4 h-4 mr-2" />
                            Export
                        </button>
                        <div className="relative">
                            <button
                                className="px-3 py-2 border rounded-md flex items-center bg-white text-sm"
                                onClick={() => setShowAddPayment(!showAddPayment)}
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Payment Method
                            </button>
                            {showAddPayment && (
                                <div className="absolute right-0 mt-2 w-72 bg-white border rounded-md shadow-lg z-10 p-4">
                                    <h3 className="font-medium mb-3">Add Payment Method</h3>
                                    <div className="mb-3">
                                        <label className="block text-sm text-gray-600 mb-1">Card Number</label>
                                        <input type="text" className="w-full border rounded-md p-2" placeholder="1234 5678 9012 3456" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 mb-3">
                                        <div>
                                            <label className="block text-sm text-gray-600 mb-1">Expiry Date</label>
                                            <input type="text" className="w-full border rounded-md p-2" placeholder="MM/YY" />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-600 mb-1">CVC</label>
                                            <input type="text" className="w-full border rounded-md p-2" placeholder="123" />
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label className="block text-sm text-gray-600 mb-1">Cardholder Name</label>
                                        <input type="text" className="w-full border rounded-md p-2" placeholder="J. Doe" />
                                    </div>
                                    <div className="flex justify-end">
                                        <button className="px-3 py-2 bg-gray-200 rounded-md text-sm mr-2" onClick={() => setShowAddPayment(false)}>
                                            Cancel
                                        </button>
                                        <button className="px-3 py-2 bg-black text-white rounded-md text-sm">
                                            Add Card
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-md shadow-sm mb-6">
                    <div className="flex border-b">
                        <button
                            className={`px-4 py-3 text-sm font-medium ${activeTab === 'overview' ? 'border-b-2 border-black' : 'text-gray-500'}`}
                            onClick={() => setActiveTab('overview')}
                        >
                            Overview
                        </button>
                        <button
                            className={`px-4 py-3 text-sm font-medium ${activeTab === 'payment' ? 'border-b-2 border-black' : 'text-gray-500'}`}
                            onClick={() => setActiveTab('payment')}
                        >
                            Payment Methods
                        </button>
                        <button
                            className={`px-4 py-3 text-sm font-medium ${activeTab === 'history' ? 'border-b-2 border-black' : 'text-gray-500'}`}
                            onClick={() => setActiveTab('history')}
                        >
                            Invoice History
                        </button>
                        <button
                            className={`px-4 py-3 text-sm font-medium ${activeTab === 'settings' ? 'border-b-2 border-black' : 'text-gray-500'}`}
                            onClick={() => setActiveTab('settings')}
                        >
                            Billing Settings
                        </button>
                    </div>

                    {activeTab === 'overview' && (
                        <div className="p-6">
                            {/* Credit Balance Card */}
                            <div className="bg-gray-100 rounded-md p-6 flex items-start justify-between mb-6">
                                <div>
                                    <div className="text-gray-600 mb-1">Credit balance</div>
                                    <div className="text-3xl font-semibold mb-2">US$23.19</div>
                                    <div className="text-sm text-gray-500">Remaining Balance</div>
                                </div>

                                <div className="flex-1 ml-8">
                                    <div className="flex items-center mb-4">
                                        <div className="mr-2 text-sm">Charged to</div>
                                        <div className="flex items-center border rounded-md px-3 py-2 bg-white mr-4">
                                            <CreditCard className="w-4 h-4 mr-2 text-blue-500" />
                                            <span className="text-sm">Visa •••• 0881</span>
                                            <button
                                                className="ml-2 text-gray-500"
                                                onClick={() => setViewCardDetails(!viewCardDetails)}
                                            >
                                                {viewCardDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                        <button className="bg-black text-white px-4 py-2 rounded-md text-sm">
                                            Buy credits
                                        </button>
                                    </div>

                                    <div className="flex items-center">
                                        <div className="relative w-5 h-5 mr-2">
                                            <div className="absolute inset-0 border-2 border-gray-300 rounded-full"></div>
                                        </div>
                                        <span className="text-sm text-gray-600">Auto reload is disabled. Enable auto reload to avoid API interruptions when credits are fully spent.</span>
                                        <button className="ml-4 bg-black text-white px-4 py-2 rounded-md text-sm">
                                            Edit
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Monthly Usage Card */}
                            <div className="bg-white border rounded-md p-6 mb-6">
                                <h2 className="text-lg font-medium mb-4">Monthly Usage</h2>
                                <div className="grid grid-cols-3 gap-6">
                                    <div>
                                        <div className="text-gray-600 text-sm mb-1">Current Bill</div>
                                        <div className="text-2xl font-semibold">$1,534.42</div>
                                        <div className="text-sm text-gray-500">for March 2025</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-600 text-sm mb-1">Month-to-date Cost</div>
                                        <div className="text-2xl font-semibold">$1,534.42</div>
                                        <div className="flex items-center text-sm">
                                            <span className="text-green-500 mr-1">↓ 12%</span>
                                            <span className="text-gray-500">vs. last month</span>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-gray-600 text-sm mb-1">Monthly Budget</div>
                                        <div className="text-2xl font-semibold">$5,000.00</div>
                                        <div className="flex items-center">
                                            <div className="w-full bg-gray-200 h-2 rounded-full">
                                                <div className="bg-green-500 h-2 rounded-full w-1/3"></div>
                                            </div>
                                        </div>
                                        <div className="flex justify-between text-sm text-gray-500 mt-1">
                                            <span>30.7% used</span>
                                            <span>Resets in 4 days</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Options Card */}
                            <div className="bg-gray-50 border rounded-md p-4 mb-6 flex items-center justify-between">
                                <div className="flex items-center">
                                    <ExternalLink className="w-5 h-5 text-red-500 mr-3" />
                                    <span className="text-sm">Pay after-the-fact with monthly invoicing by contacting the Anthropic accounts team.</span>
                                </div>
                                <button className="bg-white border border-gray-300 px-4 py-2 rounded-md text-sm">
                                    Contact Sales
                                </button>
                            </div>

                            {/* Recent Invoices */}
                            <h2 className="text-lg font-medium mb-4">Recent Invoices</h2>
                            <div className="bg-white border rounded-md overflow-hidden mb-4">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Date</th>
                                            <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Invoice ID</th>
                                            <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Type</th>
                                            <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Status</th>
                                            <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Amount</th>
                                            <th className="text-right py-3 px-4 font-medium text-gray-700 text-sm">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {invoices.slice(0, 5).map(invoice => (
                                            <tr key={invoice.id} className="border-t border-gray-100">
                                                <td className="py-3 px-4 text-sm">{formatDate(invoice.date)}</td>
                                                <td className="py-3 px-4 text-sm">
                                                    <div className="flex items-center">
                                                        <span>{invoice.id}</span>
                                                        <button
                                                            className="ml-2 text-gray-400 hover:text-gray-600"
                                                            onClick={() => copyToClipboard(invoice.id)}
                                                        >
                                                            {copySuccess ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 text-sm">{invoice.type}</td>
                                                <td className="py-3 px-4 text-sm">
                                                    <span className={`px-2 py-1 rounded-full text-xs ${invoice.status.includes('Expiring') ? 'bg-blue-100 text-blue-800' :
                                                        invoice.status === 'Paid' ? 'bg-green-100 text-green-800' :
                                                            'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {invoice.status}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-sm">${invoice.amount.toFixed(2)}</td>
                                                <td className="py-3 px-4 text-right">
                                                    <button className="text-blue-600 hover:text-blue-800 text-sm">
                                                        {invoice.type === 'Monthly invoice' ? 'Download' : 'View'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="text-sm text-gray-500">
                                    Showing 5 of {invoices.length} invoices
                                </div>
                                <button className="text-blue-600 hover:text-blue-800 text-sm">
                                    View all invoices
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'payment' && (
                        <div className="p-6">
                            <h2 className="text-lg font-medium mb-4">Payment Methods</h2>
                            <div className="space-y-4 mb-6">
                                {paymentMethods.map(method => (
                                    <div key={method.id} className="border rounded-md p-4 flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center mr-4">
                                                {method.type === 'visa' ? (
                                                    <span className="text-blue-700 font-bold text-sm">VISA</span>
                                                ) : (
                                                    <span className="font-bold text-sm">MC</span>
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-medium">{method.type.charAt(0).toUpperCase() + method.type.slice(1)} •••• {method.lastFour}</div>
                                                <div className="text-sm text-gray-500">Expires {method.expiry}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center">
                                            {method.isDefault && (
                                                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mr-4">
                                                    Default
                                                </span>
                                            )}
                                            <button className="text-sm text-blue-600 hover:text-blue-800 mr-3">Edit</button>
                                            {!method.isDefault && (
                                                <button className="text-sm text-blue-600 hover:text-blue-800 mr-3">Set as default</button>
                                            )}
                                            <button className="text-sm text-red-600 hover:text-red-800">Remove</button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                                <div className="flex">
                                    <Info className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h3 className="font-medium text-blue-800 mb-1">Automatic Credit Purchase</h3>
                                        <p className="text-blue-700 text-sm mb-3">
                                            Set up automatic credit purchases to ensure uninterrupted API access. Your default payment method will be charged automatically when:
                                        </p>
                                        <ul className="text-blue-700 text-sm space-y-1 list-disc pl-5 mb-3">
                                            <li>Your credit balance falls below a threshold you set</li>
                                            <li>You've used a percentage of your current credits</li>
                                            <li>A scheduled interval is reached (weekly, monthly)</li>
                                        </ul>
                                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                            Set up auto-reload →
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'history' && (
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-medium">Invoice History</h2>
                                <div className="flex items-center">
                                    <div className="flex items-center border rounded-md px-3 py-2 bg-white mr-3">
                                        <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                                        <span className="text-sm">Last 12 months</span>
                                        <ChevronDown className="w-4 h-4 ml-2 text-gray-500" />
                                    </div>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Search invoices..."
                                            className="pl-3 pr-4 py-2 border rounded-md w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white border rounded-md overflow-hidden mb-4">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Date</th>
                                            <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Invoice ID</th>
                                            <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Type</th>
                                            <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Status</th>
                                            <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Amount</th>
                                            <th className="text-right py-3 px-4 font-medium text-gray-700 text-sm">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {invoices.map(invoice => (
                                            <tr key={invoice.id} className="border-t border-gray-100">
                                                <td className="py-3 px-4 text-sm">{formatDate(invoice.date)}</td>
                                                <td className="py-3 px-4 text-sm">
                                                    <div className="flex items-center">
                                                        <span>{invoice.id}</span>
                                                        <button
                                                            className="ml-2 text-gray-400 hover:text-gray-600"
                                                            onClick={() => copyToClipboard(invoice.id)}
                                                        >
                                                            {copySuccess ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 text-sm">{invoice.type}</td>
                                                <td className="py-3 px-4 text-sm">
                                                    <span className={`px-2 py-1 rounded-full text-xs ${invoice.status.includes('Expiring') ? 'bg-blue-100 text-blue-800' :
                                                        invoice.status === 'Paid' ? 'bg-green-100 text-green-800' :
                                                            'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {invoice.status}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-sm">${invoice.amount.toFixed(2)}</td>
                                                <td className="py-3 px-4 text-right">
                                                    <button className="text-blue-600 hover:text-blue-800 text-sm">
                                                        {invoice.type === 'Monthly invoice' ? 'Download' : 'View'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-500">
                                    Showing {invoices.length} of {invoices.length} invoices
                                </div>
                                <div className="flex items-center">
                                    <button className="w-8 h-8 flex items-center justify-center rounded-md border mr-2 text-gray-400">
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <button className="w-8 h-8 flex items-center justify-center rounded-md border bg-black text-white mr-2">
                                        1
                                    </button>
                                    <button className="w-8 h-8 flex items-center justify-center rounded-md border mr-2 text-gray-400">
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="p-6">
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-lg font-medium mb-4">Billing Contact</h2>
                                    <div className="bg-white border rounded-md p-4 flex items-center justify-between">
                                        <div>
                                            <div className="font-medium">Jacob Ajiboye</div>
                                            <div className="text-sm text-gray-500">imolewolede@gmail.com</div>
                                        </div>
                                        <button className="text-blue-600 hover:text-blue-800 text-sm">Change</button>
                                    </div>
                                </div>

                                <div>
                                    <h2 className="text-lg font-medium mb-4">Billing Address</h2>
                                    <div className="bg-white border rounded-md p-4 flex items-center justify-between">
                                        <div>
                                            <div className="font-medium">appmint</div>
                                            <div className="text-sm text-gray-500">8259 Bristlegrass Way</div>
                                            <div className="text-sm text-gray-500">Dallas, TX 75252</div>
                                            <div className="text-sm text-gray-500">United States</div>
                                        </div>
                                        <button className="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
                                    </div>
                                </div>

                                <div>
                                    <h2 className="text-lg font-medium mb-4">Spending Notifications</h2>
                                    <div className="bg-white border rounded-md p-4">
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <div className="font-medium">Email Notifications</div>
                                                <div className="text-sm text-gray-500">Get notified when your spending reaches a threshold</div>
                                            </div>
                                            <div className="flex items-center">
                                                <div className="relative w-12 h-6 transition-colors duration-200 ease-in-out bg-green-500 rounded-full">
                                                    <div className="absolute right-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ease-in-out"></div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="border-t pt-4">
                                            <div className="font-medium mb-3">Notification Thresholds</div>
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                                                    <div className="flex items-center">
                                                        <Bell className="w-4 h-4 text-amber-500 mr-2" />
                                                        <span className="text-sm">75% of monthly budget ($3,750.00)</span>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <button className="text-sm text-blue-600 hover:text-blue-800 mr-3">Edit</button>
                                                        <button className="text-sm text-red-600 hover:text-red-800">Remove</button>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                                                    <div className="flex items-center">
                                                        <Bell className="w-4 h-4 text-red-500 mr-2" />
                                                        <span className="text-sm">90% of monthly budget ($4,500.00)</span>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <button className="text-sm text-blue-600 hover:text-blue-800 mr-3">Edit</button>
                                                        <button className="text-sm text-red-600 hover:text-red-800">Remove</button>
                                                    </div>
                                                </div>
                                            </div>
                                            <button className="mt-4 flex items-center text-sm text-blue-600 hover:text-blue-800">
                                                <Plus className="w-4 h-4 mr-2" />
                                                Add threshold
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h2 className="text-lg font-medium mb-4">Tax Information</h2>
                                    <div className="bg-white border rounded-md p-4 flex items-center justify-between">
                                        <div>
                                            <div className="font-medium">Tax ID: Not provided</div>
                                            <div className="text-sm text-gray-500">Adding your tax ID may exempt you from certain taxes</div>
                                        </div>
                                        <button className="text-blue-600 hover:text-blue-800 text-sm">Add tax ID</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BillingPage;