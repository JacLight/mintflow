import React from 'react';
import { Copy, Building, ChevronDown } from 'lucide-react';

const OrganizationProfile = () => {
    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Sidebar is assumed to be in a parent layout component */}

            <div className="p-6 max-w-4xl">
                <h1 className="text-2xl font-semibold mb-6">Organization</h1>

                <div className="bg-white rounded-md shadow-sm p-6 mb-6">
                    <h2 className="text-lg font-medium mb-4">Organization name</h2>
                    <input
                        type="text"
                        className="w-full border rounded-md p-2 mb-6"
                        value="appmint"
                    />

                    <h2 className="text-lg font-medium mb-4">Primary business address</h2>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <input
                            type="text"
                            className="border rounded-md p-2"
                            value="8259 Bristlegrass Way"
                        />
                        <input
                            type="text"
                            className="border rounded-md p-2"
                            placeholder="Line 2"
                        />
                    </div>

                    <div className="grid grid-cols-4 gap-4 mb-6">
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Country</label>
                            <div className="flex items-center justify-between border rounded-md p-2 w-full">
                                <span>United States</span>
                                <ChevronDown className="w-4 h-4 text-gray-500" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">State or province</label>
                            <input
                                type="text"
                                className="w-full border rounded-md p-2"
                                value="TX"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">City</label>
                            <input
                                type="text"
                                className="w-full border rounded-md p-2"
                                value="Dallas"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Postal code</label>
                            <input
                                type="text"
                                className="w-full border rounded-md p-2"
                                value="75252"
                            />
                        </div>
                    </div>

                    <div className="flex items-center text-sm text-gray-600 mb-2">
                        <span>Organization ID: 09113f5e-4425-4487-89f6-8685aa2b9e80</span>
                        <button className="ml-2 text-gray-500">
                            <Copy className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrganizationProfile;