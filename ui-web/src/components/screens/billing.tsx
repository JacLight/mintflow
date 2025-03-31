'use client';
import React, { useState, useEffect } from 'react';
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
import { BillingInfo, Invoice, getBillingInfo, getInvoices } from '@/lib/admin-service';

interface BillingPageProps {
    initialBillingInfo?: BillingInfo;
    initialInvoices?: Invoice[];
}

// Enhanced invoice type with display type
interface EnhancedInvoice extends Invoice {
    type: string;
}

const BillingPage = ({ initialBillingInfo, initialInvoices }: BillingPageProps) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [viewCardDetails, setViewCardDetails] = useState(false);
    const [showAddPayment, setShowAddPayment] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);
    const [billingInfo, setBillingInfo] = useState<BillingInfo | null>(initialBillingInfo || null);
    const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices || []);
    const [isLoading, setIsLoading] = useState(!initialBillingInfo || !initialInvoices);
    const [error, setError] = useState<string | null>(null);

    // Fetch billing data if not provided as props
    useEffect(() => {
        if (initialBillingInfo && initialInvoices) {
            return;
        }

        const fetchBillingData = async () => {
            try {
                setIsLoading(true);

                // Fetch billing info
                if (!initialBillingInfo) {
                    const billingInfoData = await getBillingInfo();
                    setBillingInfo(billingInfoData);
                }

                // Fetch invoices
                if (!initialInvoices) {
                    const invoicesData = await getInvoices();
                    setInvoices(invoicesData);
                }

                setError(null);
            } catch (err) {
                console.error('Error fetching billing data:', err);
                setError('Failed to load billing data. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchBillingData();
    }, [initialBillingInfo, initialInvoices]);

    // Get payment methods from billing info
    const paymentMethods = billingInfo?.paymentMethod ? [
        {
            id: 'card-1',
            type: billingInfo.paymentMethod.brand.toLowerCase(),
            lastFour: billingInfo.paymentMethod.last4,
            expiry: `${billingInfo.paymentMethod.expiryMonth.toString().padStart(2, '0')}/${billingInfo.paymentMethod.expiryYear.toString().slice(-2)}`,
            name: billingInfo.billingAddress?.name || 'Card Holder',
            isDefault: true
        }
    ] : [];

    // Format date
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    // Copy invoice ID to clipboard
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
    };

    // Add type property to invoices for display purposes
    const enhancedInvoices: EnhancedInvoice[] = invoices.map(invoice => ({
        ...invoice,
        type: invoice.id.includes('INV') ? 'Monthly invoice' : 'Credit grant'
    }));

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-semibold">Billing</h1>
                    <div className="flex space-x-3">
                        <button className="px-3 py-2 border rounded-md flex items-center bg-white text-sm">
                            <Download className="w-4 h-4 mr-2" />
                            Export
                        </button>
                        <button
                            className="px-3 py-2 border rounded-md flex items-center bg-white text-sm"
                            onClick={() => setShowAddPayment(!showAddPayment)}
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Payment Method
                        </button>
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

                    <div className="p-6">
                        {isLoading ? (
                            <div className="text-center py-8">Loading billing data...</div>
                        ) : error ? (
                            <div className="text-center py-8 text-red-500">{error}</div>
                        ) : (
                            <>
                                {/* Content based on active tab */}
                                {activeTab === 'overview' && (
                                    <div>
                                        <div className="bg-gray-100 rounded-md p-6 flex items-start justify-between mb-6">
                                            <div>
                                                <div className="text-gray-600 mb-1">Credit balance</div>
                                                <div className="text-3xl font-semibold mb-2">
                                                    {billingInfo?.plan ? `${billingInfo.plan}` : 'US$23.19'}
                                                </div>
                                                <div className="text-sm text-gray-500">Remaining Balance</div>
                                            </div>
                                        </div>

                                        <h2 className="text-lg font-medium mb-4">Recent Invoices</h2>
                                        <div className="bg-white border rounded-md overflow-hidden mb-4">
                                            <table className="w-full">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Date</th>
                                                        <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Invoice ID</th>
                                                        <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Status</th>
                                                        <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Amount</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {enhancedInvoices.slice(0, 5).map(invoice => (
                                                        <tr key={invoice.id} className="border-t border-gray-100">
                                                            <td className="py-3 px-4 text-sm">{formatDate(invoice.date)}</td>
                                                            <td className="py-3 px-4 text-sm">{invoice.id}</td>
                                                            <td className="py-3 px-4 text-sm">{invoice.status}</td>
                                                            <td className="py-3 px-4 text-sm">${invoice.amount.toFixed(2)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'payment' && (
                                    <div>
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
                                                </div>
                                            ))}
                                            {paymentMethods.length === 0 && (
                                                <div className="text-center py-8 text-gray-500">
                                                    No payment methods found. Add a payment method to get started.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'history' && (
                                    <div>
                                        <h2 className="text-lg font-medium mb-4">Invoice History</h2>
                                        <div className="bg-white border rounded-md overflow-hidden mb-4">
                                            <table className="w-full">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Date</th>
                                                        <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Invoice ID</th>
                                                        <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Status</th>
                                                        <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Amount</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {enhancedInvoices.map(invoice => (
                                                        <tr key={invoice.id} className="border-t border-gray-100">
                                                            <td className="py-3 px-4 text-sm">{formatDate(invoice.date)}</td>
                                                            <td className="py-3 px-4 text-sm">{invoice.id}</td>
                                                            <td className="py-3 px-4 text-sm">{invoice.status}</td>
                                                            <td className="py-3 px-4 text-sm">${invoice.amount.toFixed(2)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'settings' && (
                                    <div>
                                        <h2 className="text-lg font-medium mb-4">Billing Contact</h2>
                                        <div className="bg-white border rounded-md p-4 flex items-center justify-between">
                                            <div>
                                                <div className="font-medium">
                                                    {billingInfo?.billingAddress?.name || 'Jacob Ajiboye'}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {'imolewolede@gmail.com'}
                                                </div>
                                            </div>
                                            <button className="text-blue-600 hover:text-blue-800 text-sm">Change</button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BillingPage;
