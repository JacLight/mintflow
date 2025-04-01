'use client';
import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, Download, Calendar } from 'lucide-react';
import { CostStats, CostByPeriod, getCostStats, getCostByPeriod } from '@/lib/metrics-service';

interface CostPageProps {
    initialCostStats?: CostStats;
    initialCostByPeriod?: CostByPeriod;
}

const CostPage = ({ initialCostStats, initialCostByPeriod }: CostPageProps) => {
    // Get current month and year for default filter
    const currentDate = new Date();
    const currentMonthYear = `${currentDate.toLocaleString('en-US', { month: 'short' })} ${currentDate.getFullYear()}`;

    const [selectedMonth, setSelectedMonth] = useState(currentMonthYear);
    const [selectedGroup, setSelectedGroup] = useState('None');
    const [selectedWorkspace, setSelectedWorkspace] = useState('All Workspaces');
    const [selectedApiKey, setSelectedApiKey] = useState('All API keys');
    const [selectedModel, setSelectedModel] = useState('All Models');

    const [costData, setCostData] = useState<CostStats>(initialCostStats || {
        totalCost: 0,
        costByModel: {},
        costByWorkspace: {}
    });

    const [dailyCostData, setDailyCostData] = useState<any[]>(
        initialCostByPeriod?.data || []
    );
    const [isLoading, setIsLoading] = useState(!initialCostStats);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // If initialCostStats and initialCostByPeriod are provided, we don't need to fetch data
        if (initialCostStats && initialCostByPeriod) {
            return;
        }

        const fetchCostData = async () => {
            try {
                setIsLoading(true);

                // Use the metrics-service functions instead of direct fetch
                // Fetch overall cost data
                const costDataResult = await getCostStats();
                setCostData(costDataResult);

                // Fetch daily cost data
                const dailyDataResult = await getCostByPeriod('daily');
                setDailyCostData(dailyDataResult.data || []);

                setError(null);
            } catch (err) {
                console.error('Error fetching cost data:', err);
                setError('Failed to load cost data. Please try again later.');
                setDailyCostData([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCostData();
    }, [initialCostStats, initialCostByPeriod]);

    // Use real data if available, otherwise use empty array
    const dailyCosts = dailyCostData.length > 0 ? dailyCostData : [];

    // Calculate the max cost for scaling
    const maxCost = Math.max(...(dailyCosts.length > 0 ? dailyCosts.map(day => day.cost) : [0]));

    // Calculate total cost (use API data if available)
    const totalCost = isLoading ? 0 : (costData.totalCost || (dailyCosts.length > 0 ? dailyCosts.reduce((sum, day) => sum + day.cost, 0) : 0));

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

                        <button
                            className="border rounded-md px-3 py-1 flex items-center bg-blue-600 hover:bg-blue-700 text-white"
                            aria-label="Export cost data"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            <span className="text-sm">Export</span>
                        </button>
                    </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-md p-6 mb-8 flex items-center">
                    <div className="mr-8">
                        <div className="text-gray-600 mb-2 text-sm">Total cost</div>
                        <div className="text-3xl font-semibold">
                            {isLoading ? 'Loading...' : `USD ${totalCost.toFixed(2)}`}
                        </div>
                    </div>

                    <div className="w-32 h-32">
                        {/* Circular progress ring - dynamic based on budget usage */}
                        <svg viewBox="0 0 100 100" className="w-full h-full">
                            <circle
                                cx="50"
                                cy="50"
                                r="45"
                                fill="none"
                                stroke="#f3f4f6"
                                strokeWidth="10"
                            />
                            {!isLoading && (
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="45"
                                    fill="none"
                                    stroke="#9c4a31"
                                    strokeWidth="10"
                                    strokeDasharray="283"
                                    strokeDashoffset={283 - (283 * Math.min(totalCost / 400, 1))}
                                    transform="rotate(-90 50 50)"
                                />
                            )}
                        </svg>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                            <div className="text-sm font-medium">Budget</div>
                            <div className="text-xs">{isLoading ? '-' : `${Math.round((totalCost / 400) * 100)}%`}</div>
                        </div>
                    </div>
                </div>

                <div className="mb-8">
                    <div className="text-gray-700 mb-3">
                        <h2 className="text-lg font-medium">Daily cost</h2>
                        <p className="text-sm text-gray-500">Includes usage from both API and Console</p>
                    </div>

                    <div className="h-64 bg-white p-6 rounded-md shadow-sm relative">
                        {/* Y-axis labels - dynamic based on max cost */}
                        {(() => {
                            // Calculate a nice round max value for the y-axis
                            const calculatedMax = Math.max(maxCost * 1.2, 10);
                            const roundedMax = Math.ceil(calculatedMax / 20) * 20;
                            const steps = 8;
                            const stepSize = roundedMax / steps;

                            return (
                                <div className="absolute left-0 top-0 bottom-6 w-12 flex flex-col justify-between text-xs text-gray-500 px-2">
                                    {Array.from({ length: steps + 1 }).map((_, i) => (
                                        <div key={i}>${(roundedMax - i * stepSize).toFixed(0)}</div>
                                    ))}
                                </div>
                            );
                        })()}

                        {/* Bar chart - dynamic based on real data */}
                        <div className="absolute left-12 right-2 top-0 bottom-6 flex items-end justify-between">
                            {dailyCosts.map((day, index) => {
                                // Calculate a nice round max value for the y-axis
                                const calculatedMax = Math.max(maxCost * 1.2, 10);
                                const roundedMax = Math.ceil(calculatedMax / 20) * 20;

                                return (
                                    <div
                                        key={index}
                                        className="group flex flex-col items-center"
                                        style={{ height: '100%' }}
                                    >
                                        <div
                                            className="w-5 bg-red-800 rounded-sm cursor-pointer transition-all hover:opacity-80"
                                            style={{
                                                height: `${(day.cost / roundedMax) * 100}%`,
                                                minHeight: day.cost > 0 ? '1px' : '0'
                                            }}
                                        >
                                            <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-1 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                                                {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}: ${day.cost.toFixed(2)}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* X-axis - dynamic based on real data */}
                        <div className="absolute left-12 right-2 bottom-0 h-6 flex justify-between text-xs text-gray-500">
                            {dailyCosts.length > 0 ? (
                                (() => {
                                    // Show 5 evenly spaced dates
                                    const numLabels = 5;
                                    const step = Math.max(1, Math.floor(dailyCosts.length / (numLabels - 1)));
                                    const labels = [];

                                    for (let i = 0; i < numLabels; i++) {
                                        const index = Math.min(i * step, dailyCosts.length - 1);
                                        if (index < dailyCosts.length) {
                                            const date = new Date(dailyCosts[index].date);
                                            labels.push(
                                                <div key={i}>
                                                    {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                </div>
                                            );
                                        }
                                    }

                                    return labels;
                                })()
                            ) : (
                                <>
                                    <div>-</div>
                                    <div>-</div>
                                    <div>-</div>
                                    <div>-</div>
                                    <div>-</div>
                                </>
                            )}
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
                                {isLoading ? (
                                    <tr className="border-b">
                                        <td colSpan={5} className="py-3 text-center">Loading cost data...</td>
                                    </tr>
                                ) : (
                                    Object.entries(costData.costByModel || {}).map(([model, modelData], index) => {
                                        // Extract model data - in a real implementation, this would come from the API
                                        const cost = typeof modelData === 'number' ? modelData : (modelData as any).cost || 0;
                                        const requests = (modelData as any)?.requests || 0;
                                        const inputTokens = (modelData as any)?.inputTokens || 0;
                                        const outputTokens = (modelData as any)?.outputTokens || 0;

                                        return (
                                            <tr key={index} className="border-b">
                                                <td className="py-3 text-sm">{model}</td>
                                                <td className="py-3 text-sm text-right">{requests.toLocaleString()}</td>
                                                <td className="py-3 text-sm text-right">{inputTokens.toLocaleString()}</td>
                                                <td className="py-3 text-sm text-right">{outputTokens.toLocaleString()}</td>
                                                <td className="py-3 text-sm text-right font-medium">${cost.toFixed(2)}</td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td className="pt-3 text-sm font-semibold">Total</td>
                                    <td className="pt-3 text-sm text-right font-semibold">
                                        {isLoading ? '0' : Object.values(costData.costByModel || {})
                                            .reduce((sum, modelData) => sum + ((modelData as any)?.requests || 0), 0)
                                            .toLocaleString()}
                                    </td>
                                    <td className="pt-3 text-sm text-right font-semibold">
                                        {isLoading ? '0' : Object.values(costData.costByModel || {})
                                            .reduce((sum, modelData) => sum + ((modelData as any)?.inputTokens || 0), 0)
                                            .toLocaleString()}
                                    </td>
                                    <td className="pt-3 text-sm text-right font-semibold">
                                        {isLoading ? '0' : Object.values(costData.costByModel || {})
                                            .reduce((sum, modelData) => sum + ((modelData as any)?.outputTokens || 0), 0)
                                            .toLocaleString()}
                                    </td>
                                    <td className="pt-3 text-sm text-right font-semibold">
                                        ${isLoading ? '0.00' : totalCost.toFixed(2)}
                                    </td>
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
                        {isLoading ? (
                            <div className="text-center py-4">Loading cost data...</div>
                        ) : dailyCosts.length === 0 ? (
                            <div className="text-center py-4 text-gray-500">No cost data available for this period</div>
                        ) : (
                            <div className="grid grid-cols-7 gap-2">
                                {dailyCosts.map((day, index) => (
                                    <div key={index} className="border rounded-md p-3">
                                        <div className="text-sm font-medium">
                                            {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </div>
                                        <div className="text-lg font-semibold mt-1">${day.cost.toFixed(2)}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CostPage;
