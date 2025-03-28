import React from 'react';
import { Info, ExternalLink } from 'lucide-react';

const RateLimits = () => {
    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Sidebar is assumed to be in a parent layout component */}

            <div className="p-6 max-w-5xl">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-2xl font-semibold flex items-center">
                            Rate limits
                            <span className="ml-2 text-sm bg-purple-100 text-purple-800 px-2 py-1 rounded-full">TIER 4</span>
                        </h1>
                        <p className="text-gray-600 mt-2 max-w-2xl">
                            Limits help us mitigate against misuse and manage API capacity. Rate limits restrict API
                            usage frequency over a certain period of time.
                        </p>
                    </div>
                    <div className="bg-gray-50 border p-4 rounded-md w-72">
                        <div className="text-sm font-semibold mb-1">CUSTOM LIMITS</div>
                        <p className="text-gray-600 text-sm mb-4">
                            Contact the Anthropic accounts team to learn more about custom rate limits.
                        </p>
                        <button className="bg-black text-white px-4 py-2 rounded-md w-full">
                            Contact sales
                        </button>
                    </div>
                </div>

                <div className="flex items-center mb-6 mt-8">
                    <div className="w-10 h-6 bg-gray-200 rounded-full relative mr-2 cursor-pointer">
                        <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full"></div>
                    </div>
                    <span className="text-gray-700">Show Legacy Models</span>
                </div>

                <div className="bg-white rounded-md shadow-sm overflow-hidden mb-6">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="text-left py-3 px-4 font-medium text-gray-700">MODEL</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-700">REQUESTS PER MINUTE</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-700">INPUT TOKENS PER MINUTE</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-700">OUTPUT TOKENS PER MINUTE</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-t">
                                <td className="py-3 px-4">Claude 3.7 Sonnet</td>
                                <td className="py-3 px-4">4,000</td>
                                <td className="py-3 px-4">200,000 <span className="text-gray-500 text-sm">excluding cache reads</span></td>
                                <td className="py-3 px-4">80,000</td>
                            </tr>
                            <tr className="border-t">
                                <td className="py-3 px-4">Claude 3.5 Sonnet 2024-10-22</td>
                                <td className="py-3 px-4">4,000</td>
                                <td className="py-3 px-4">400,000</td>
                                <td className="py-3 px-4">80,000</td>
                            </tr>
                            <tr className="border-t">
                                <td className="py-3 px-4">Claude 3.5 Haiku</td>
                                <td className="py-3 px-4">4,000</td>
                                <td className="py-3 px-4">400,000</td>
                                <td className="py-3 px-4">80,000</td>
                            </tr>
                            <tr className="border-t">
                                <td className="py-3 px-4">Claude 3.5 Sonnet 2024-06-20</td>
                                <td className="py-3 px-4">4,000</td>
                                <td className="py-3 px-4">400,000</td>
                                <td className="py-3 px-4">80,000</td>
                            </tr>
                            <tr className="border-t">
                                <td className="py-3 px-4">Claude 3 Haiku</td>
                                <td className="py-3 px-4">4,000</td>
                                <td className="py-3 px-4">400,000</td>
                                <td className="py-3 px-4">80,000</td>
                            </tr>
                            <tr className="border-t">
                                <td className="py-3 px-4">Claude 3 Opus</td>
                                <td className="py-3 px-4">4,000</td>
                                <td className="py-3 px-4">400,000</td>
                                <td className="py-3 px-4">80,000</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="bg-white rounded-md shadow-sm p-6 mb-10">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="font-medium">Batch requests</div>
                            <div className="text-sm text-gray-600">Limit per minute across all models</div>
                        </div>
                        <div className="text-xl font-semibold">4,000</div>
                    </div>
                </div>

                <h2 className="text-2xl font-semibold mb-4">Spend limits</h2>
                <p className="text-gray-600 mb-6">You can manage your spend by setting monthly spend limits.</p>

                <div className="grid grid-cols-2 gap-6">
                    <div className="bg-white rounded-md shadow-sm p-6">
                        <h3 className="font-medium mb-4">Monthly limit</h3>
                        <div className="w-full bg-gray-200 h-2 rounded-full mb-4">
                            <div className="bg-red-500 h-2 rounded-full w-1/3"></div>
                        </div>
                        <div className="flex items-center justify-between mb-4">
                            <div className="text-2xl font-semibold">$1,534.56</div>
                            <div className="text-gray-600">of $5,000</div>
                        </div>
                        <div className="text-sm text-gray-600">Resets on 1 Apr 2025</div>
                        <button className="mt-4 border border-gray-300 px-4 py-2 rounded-md">Change Limit</button>
                    </div>

                    <div className="bg-white rounded-md shadow-sm p-6">
                        <h3 className="font-medium mb-4">Email notification</h3>
                        <p className="text-gray-600 mb-6">Notify all admins when monthly spend reaches a certain amount</p>
                        <button className="bg-white border border-gray-300 px-4 py-2 rounded-md w-full">Add notification</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RateLimits;