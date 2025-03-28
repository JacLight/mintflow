import React, { useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, Download, Calendar } from 'lucide-react';

const CostPage = () => {
    const [selectedMonth, setSelectedMonth] = useState('Mar 2025');
    const [selectedGroup, setSelectedGroup] = useState('None');
    const [selectedWorkspace, setSelectedWorkspace] = useState('All Workspaces');
    const [selectedApiKey, setSelectedApiKey] = useState('All API keys');
    const [selectedModel, setSelectedModel] = useState('All Models');

    // Sample data for the chart
    const dailyCosts = [
        { date: '01', cost: 98 },
        { date: '02', cost: 105 },
        { date: '03', cost: 75 },
        { date: '04', cost: 25 },
        { date: '05', cost: 65 },
        { date: '06', cost: 5 },
        { date: '07', cost: 70 },
        { date: '08', cost: 15 },
        { date: '09', cost: 20 },
        { date: '10', cost: 25 },
        { date: '11', cost: 15 },
        { date: '12', cost: 45 },
        { date: '13', cost: 75 },
        { date: '14', cost: 140 },
        { date: '15', cost: 45 },
        { date: '16', cost: 40 },
        { date: '17', cost: 95 },
        { date: '18', cost: 35 },
        { date: '19', cost: 70 },
        { date: '20', cost: 50 },
        { date: '21', cost: 15 },
        { date: '22', cost: 75 },
        { date: '23', cost: 15 },
        { date: '24', cost: 40 },
        { date: '25', cost: 105 },
        { date: '26', cost: 60 },
        { date: '27', cost: 30 },
        { date: '28', cost: 5 },
    ];

    // Calculate the max cost for scaling
    const maxCost = Math.max(...dailyCosts.map(day => day.cost));

    // Calculate total cost
    const totalCost = dailyCosts.reduce((sum, day) => sum + day.cost, 0);

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-semibold">Cost</h1>
                    <div className="flex items-center space-x-2">
                        <div className="flex items-center">
                            <span className="mr-2 text-sm">Group by:</span>
                            <div className="flex items-center border rounded-md px-3 py-1 bg-gray-100">
                                <span className="text-sm">{selectedGroup}</span>
                                <ChevronDown className="w-4 h-4 ml-2" />
                            </div>
                        </div>

                        <div className="flex items-center border rounded-md px-3 py-1 bg-gray-100">
                            <span className="text-sm">{selectedWorkspace}</span>
                            <ChevronDown className="w-4 h-4 ml-2" />
                        </div>

                        <div className="flex items-center border rounded-md px-3 py-1 bg-gray-100">
                            <span className="text-sm">{selectedApiKey}</span>
                            <ChevronDown className="w-4 h-4 ml-2" />
                        </div>

                        <div className="flex items-center border rounded-md px-3 py-1 bg-gray-100">
                            <span className="text-sm">{selectedModel}</span>
                            <ChevronDown className="w-4 h-4 ml-2" />
                        </div>

                        <div className="flex items-center border rounded-md px-3 py-1 bg-gray-100">
                            <ChevronLeft className="w-4 h-4 mr-2 cursor-pointer" />
                            <span className="text-sm">{selectedMonth}</span>
                            <ChevronRight className="w-4 h-4 ml-2 cursor-pointer" />
                        </div>

                        <button className="border rounded-md px-3 py-1 flex items-center bg-black text-white">
                            <Download className="w-4 h-4 mr-2" />
                            <span className="text-sm">Export</span>
                        </button>
                    </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-md p-6 mb-8 flex items-center">
                    <div className="mr-8">
                        <div className="text-gray-600 mb-2 text-sm">Total cost</div>
                        <div className="text-3xl font-semibold">USD {totalCost.toFixed(2)}</div>
                    </div>

                    <div className="w-32 h-32">
                        {/* Circular progress ring */}
                        <svg viewBox="0 0 100 100" className="w-full h-full">
                            <circle
                                cx="50"
                                cy="50"
                                r="45"
                                fill="none"
                                stroke="#f3f4f6"
                                strokeWidth="10"
                            />
                            <circle
                                cx="50"
                                cy="50"
                                r="45"
                                fill="none"
                                stroke="#9c4a31"
                                strokeWidth="10"
                                strokeDasharray="283"
                                strokeDashoffset="70"
                                transform="rotate(-90 50 50)"
                            />
                        </svg>
                    </div>
                </div>

                <div className="mb-8">
                    <div className="text-gray-700 mb-3">
                        <h2 className="text-lg font-medium">Daily cost</h2>
                        <p className="text-sm text-gray-500">Includes usage from both API and Console</p>
                    </div>

                    <div className="h-64 bg-white p-6 rounded-md shadow-sm relative">
                        {/* Y-axis labels */}
                        <div className="absolute left-0 top-0 bottom-6 w-12 flex flex-col justify-between text-xs text-gray-500 px-2">
                            <div>$160</div>
                            <div>$140</div>
                            <div>$120</div>
                            <div>$100</div>
                            <div>$80</div>
                            <div>$60</div>
                            <div>$40</div>
                            <div>$20</div>
                            <div>$0</div>
                        </div>

                        {/* Bar chart */}
                        <div className="absolute left-12 right-2 top-0 bottom-6 flex items-end justify-between">
                            {dailyCosts.map((day, index) => (
                                <div
                                    key={index}
                                    className="group flex flex-col items-center"
                                    style={{ height: '100%' }}
                                >
                                    <div
                                        className="w-5 bg-red-800 rounded-sm cursor-pointer transition-all hover:opacity-80"
                                        style={{
                                            height: `${(day.cost / 160) * 100}%`,
                                        }}
                                    >
                                        <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-1 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                                            Mar {day.date}: ${day.cost}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* X-axis */}
                        <div className="absolute left-12 right-2 bottom-0 h-6 flex justify-between text-xs text-gray-500">
                            <div>Mar 01</div>
                            <div>Mar 07</div>
                            <div>Mar 13</div>
                            <div>Mar 19</div>
                            <div>Mar 25</div>
                        </div>
                    </div>
                </div>

                {/* Additional sections like cost breakdown by model, etc. could be added here */}
                <div className="mb-8">
                    <div className="text-gray-700 mb-3">
                        <h2 className="text-lg font-medium">Cost by model</h2>
                        <p className="text-sm text-gray-500">Breakdown of costs by AI model</p>
                    </div>

                    <div className="bg-white p-6 rounded-md shadow-sm">
                        <table className="w-full">
                            <thead className="border-b">
                                <tr>
                                    <th className="text-left pb-3 text-sm font-medium text-gray-700">Model</th>
                                    <th className="text-right pb-3 text-sm font-medium text-gray-700">Requests</th>
                                    <th className="text-right pb-3 text-sm font-medium text-gray-700">Input tokens</th>
                                    <th className="text-right pb-3 text-sm font-medium text-gray-700">Output tokens</th>
                                    <th className="text-right pb-3 text-sm font-medium text-gray-700">Cost</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b">
                                    <td className="py-3 text-sm">Claude 3.7 Sonnet</td>
                                    <td className="py-3 text-sm text-right">215</td>
                                    <td className="py-3 text-sm text-right">640,456</td>
                                    <td className="py-3 text-sm text-right">72,890</td>
                                    <td className="py-3 text-sm text-right font-medium">$982.45</td>
                                </tr>
                                <tr className="border-b">
                                    <td className="py-3 text-sm">Claude 3.5 Sonnet</td>
                                    <td className="py-3 text-sm text-right">85</td>
                                    <td className="py-3 text-sm text-right">245,782</td>
                                    <td className="py-3 text-sm text-right">32,145</td>
                                    <td className="py-3 text-sm text-right font-medium">$356.92</td>
                                </tr>
                                <tr className="border-b">
                                    <td className="py-3 text-sm">Claude 3.5 Haiku</td>
                                    <td className="py-3 text-sm text-right">125</td>
                                    <td className="py-3 text-sm text-right">186,329</td>
                                    <td className="py-3 text-sm text-right">28,762</td>
                                    <td className="py-3 text-sm text-right font-medium">$195.05</td>
                                </tr>
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td className="pt-3 text-sm font-semibold">Total</td>
                                    <td className="pt-3 text-sm text-right font-semibold">425</td>
                                    <td className="pt-3 text-sm text-right font-semibold">1,072,567</td>
                                    <td className="pt-3 text-sm text-right font-semibold">133,797</td>
                                    <td className="pt-3 text-sm text-right font-semibold">$1,534.42</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                <div className="mb-8">
                    <div className="text-gray-700 mb-3">
                        <h2 className="text-lg font-medium">Daily cost history</h2>
                    </div>

                    <div className="bg-white p-6 rounded-md shadow-sm">
                        <div className="grid grid-cols-7 gap-2">
                            {dailyCosts.map((day, index) => (
                                <div key={index} className="border rounded-md p-3">
                                    <div className="text-sm font-medium">Mar {day.date}</div>
                                    <div className="text-lg font-semibold mt-1">${day.cost.toFixed(2)}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CostPage;