import React from 'react';
import { Calendar, ChevronDown, Download, ChevronRight } from 'lucide-react';

const UsageDashboard = () => {
    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Left sidebar assumed to be included in a parent component */}

            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <div className="text-2xl font-semibold">Usage</div>
                    <div className="flex items-center">
                        <button className="text-blue-600 mr-4 text-sm">View legacy dashboard</button>
                        <div className="flex items-center mr-4">
                            <span className="text-gray-600 mr-2 text-sm">Default project</span>
                            <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
                        </div>
                        <div className="flex items-center border rounded-md px-3 py-1 text-sm">
                            <Calendar className="w-4 h-4 mr-2" />
                            <span>03/13/25 - 03/28/25</span>
                            <ChevronDown className="w-4 h-4 ml-2" />
                        </div>
                        <button className="ml-4 border rounded-md px-3 py-1 flex items-center text-sm">
                            <Download className="w-4 h-4 mr-1" />
                            Export
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-md shadow-sm p-4">
                        <div className="text-gray-600 mb-2 text-sm">Total Spend</div>
                        <div className="text-2xl font-semibold mb-1">$7.01</div>
                        <div className="text-green-500 text-sm">$6.52</div>
                        <div className="mt-4 h-24 bg-gray-50 relative">
                            {/* Simplified chart - in a real app you'd use a chart library */}
                            <div className="absolute bottom-0 left-1/4 w-6 h-4/5 bg-purple-500"></div>
                        </div>
                    </div>

                    <div className="bg-white rounded-md shadow-sm p-4">
                        <div className="text-gray-600 mb-2 text-sm">March budget</div>
                        <div className="text-xl font-semibold mb-1">$8.53 / $400</div>
                        <div className="mb-2">
                            <div className="w-full bg-gray-200 h-2 rounded-full">
                                <div className="bg-green-500 h-2 rounded-full w-5"></div>
                            </div>
                        </div>
                        <div className="text-gray-600 text-sm">
                            Resets in 4 days <a href="#" className="text-blue-600">Edit budget</a>
                        </div>
                        <div className="mt-6"></div>
                    </div>

                    <div className="bg-white rounded-md shadow-sm p-4">
                        <div className="text-gray-600 mb-2 text-sm">Total tokens</div>
                        <div className="text-2xl font-semibold mb-2">769,404</div>
                        <div className="h-12 bg-gray-50 relative mt-2 mb-3">
                            {/* Simplified line chart */}
                            <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-300"></div>
                            <div className="absolute bottom-0 left-1/3 w-1 h-3/4 bg-red-500"></div>
                            <div className="absolute bottom-0 right-1/3 w-1 h-1/2 bg-red-500"></div>
                        </div>
                        <div className="text-gray-600 mb-2 text-sm">Total requests</div>
                        <div className="text-xl font-semibold">272</div>
                    </div>
                </div>

                <div className="flex mb-4 border-b">
                    <button className="px-4 py-2 border-b-2 border-gray-800 font-medium text-sm">API capabilities</button>
                    <button className="px-4 py-2 text-gray-600 text-sm">Spend categories</button>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-6">
                    <div className="bg-white rounded-md shadow-sm p-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-medium">Chat Completions</h3>
                            <ChevronRight className="w-4 h-4" />
                        </div>
                        <div className="flex items-center mb-2 text-sm">
                            <div className="w-3 h-3 bg-purple-600 mr-2 rounded"></div>
                            <span>272 requests</span>
                            <div className="w-3 h-3 bg-blue-300 mx-2 rounded"></div>
                            <span>769,404K input tokens</span>
                        </div>
                        <div className="text-gray-600 text-sm">226</div>
                        <div className="h-32 bg-gray-50 relative mt-4">
                            {/* Simplified chart */}
                            <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-300"></div>
                            <div className="absolute bottom-0 right-1/4 w-8 h-3/5 bg-purple-600"></div>
                        </div>
                    </div>

                    <div className="bg-white rounded-md shadow-sm p-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-medium">Images</h3>
                            <ChevronRight className="w-4 h-4" />
                        </div>
                        <div className="flex items-center mb-2 text-sm">
                            <div className="w-3 h-3 bg-purple-600 mr-2 rounded"></div>
                            <span>0 requests</span>
                            <div className="w-3 h-3 bg-blue-300 mx-2 rounded"></div>
                            <span>0 images</span>
                        </div>
                        <div className="text-gray-600 text-sm">1</div>
                        <div className="h-32 bg-gray-50 relative mt-4">
                            <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-300"></div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-6">
                    <div className="bg-white rounded-md shadow-sm p-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-medium">Web Searches</h3>
                            <ChevronRight className="w-4 h-4" />
                        </div>
                        <div className="flex items-center mb-2 text-sm">
                            <div className="w-3 h-3 bg-purple-600 mr-2 rounded"></div>
                            <span>0 requests</span>
                        </div>
                        <div className="text-gray-600 text-sm">1</div>
                        <div className="h-32 bg-gray-50 relative mt-4">
                            <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-300"></div>
                        </div>
                    </div>

                    <div className="bg-white rounded-md shadow-sm p-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-medium">File Searches</h3>
                            <ChevronRight className="w-4 h-4" />
                        </div>
                        <div className="flex items-center mb-2 text-sm">
                            <div className="w-3 h-3 bg-purple-600 mr-2 rounded"></div>
                            <span>0 requests</span>
                        </div>
                        <div className="text-gray-600 text-sm">1</div>
                        <div className="h-32 bg-gray-50 relative mt-4">
                            <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-300"></div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-8">
                    <div className="flex items-center">
                        <button className="px-4 py-1 bg-gray-100 rounded-md text-sm mr-2">Users</button>
                        <button className="px-4 py-1 text-gray-600 text-sm mr-2">Services</button>
                        <button className="px-4 py-1 text-gray-600 text-sm">API Keys</button>
                    </div>
                    <div></div>
                    <div className="flex items-center">
                        <div className="w-6 h-6 bg-purple-600 rounded-full mr-2 text-white flex items-center justify-center text-xs">J</div>
                        <span>Jacob AJIBOYE</span>
                        <span className="ml-auto text-sm">272</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UsageDashboard;