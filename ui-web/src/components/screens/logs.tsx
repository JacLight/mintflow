'use client';
import React, { useState, useEffect } from 'react';
import {
    Search,
    Calendar,
    ChevronDown,
    Download,
    Filter,
    AlertCircle,
    Info,
    ArrowDownCircle,
    ChevronLeft,
    ChevronRight,
    Loader2
} from 'lucide-react';
import { LogEntry, LogFilterOptions, getLogs, exportLogsAsCsv, getLogRetentionPolicy } from '@/lib/logs-service';

interface LogsPageProps {
    initialLogs?: {
        logs: LogEntry[];
        total: number;
        page: number;
        totalPages: number;
    };
    initialRetentionPolicy?: {
        days: number;
        extendedRetention: boolean;
    };
}

const LogsPage = ({ initialLogs, initialRetentionPolicy }: LogsPageProps) => {
    const [selectedTab, setSelectedTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [timeRange, setTimeRange] = useState('24h');
    const [isLoading, setIsLoading] = useState(!initialLogs);
    const [error, setError] = useState<string | null>(null);
    const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(initialLogs?.page || 1);
    const [logsData, setLogsData] = useState(initialLogs || { logs: [], total: 0, page: 1, totalPages: 1 });
    const [retentionPolicy, setRetentionPolicy] = useState(initialRetentionPolicy || { days: 30, extendedRetention: false });
    const [isExporting, setIsExporting] = useState(false);

    // Fetch logs data
    useEffect(() => {
        if (initialLogs) {
            return; // Skip fetching if initial data is provided
        }

        const fetchLogs = async () => {
            try {
                setIsLoading(true);

                // Prepare filter options
                const filterOptions: LogFilterOptions = {
                    page: currentPage,
                    limit: 20,
                    search: searchQuery || undefined
                };

                // Add date range filter
                if (timeRange) {
                    const now = new Date();
                    let startDate: Date;

                    switch (timeRange) {
                        case '24h':
                            startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                            break;
                        case '7d':
                            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                            break;
                        case '30d':
                            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                            break;
                        default:
                            startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                    }

                    filterOptions.startDate = startDate.toISOString();
                    filterOptions.endDate = now.toISOString();
                }

                // Add type filter based on selected tab
                if (selectedTab !== 'all') {
                    filterOptions.source = selectedTab;
                }

                const data = await getLogs(filterOptions);
                setLogsData(data);
                setError(null);
            } catch (err) {
                console.error('Error fetching logs:', err);
                setError('Failed to load logs. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchLogs();
    }, [initialLogs, currentPage, searchQuery, timeRange, selectedTab]);

    // Fetch retention policy
    useEffect(() => {
        if (initialRetentionPolicy) {
            return; // Skip fetching if initial data is provided
        }

        const fetchRetentionPolicy = async () => {
            try {
                const policy = await getLogRetentionPolicy();
                setRetentionPolicy(policy);
            } catch (err) {
                console.error('Error fetching retention policy:', err);
                // Don't set error state here to avoid disrupting the main UI
            }
        };

        fetchRetentionPolicy();
    }, [initialRetentionPolicy]);

    // Handle search input
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    // Handle search form submission
    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(1); // Reset to first page when searching
    };

    // Handle time range change
    const handleTimeRangeChange = (range: string) => {
        setTimeRange(range);
        setCurrentPage(1); // Reset to first page when changing time range
    };

    // Handle tab change
    const handleTabChange = (tab: string) => {
        setSelectedTab(tab);
        setCurrentPage(1); // Reset to first page when changing tab
    };

    // Handle pagination
    const handlePageChange = (page: number) => {
        if (page < 1 || page > logsData.totalPages) return;
        setCurrentPage(page);
    };

    // Handle log expansion
    const toggleLogExpansion = (logId: string) => {
        setExpandedLogId(expandedLogId === logId ? null : logId);
    };

    // Handle export
    const handleExport = async () => {
        try {
            setIsExporting(true);

            // Prepare filter options for export
            const filterOptions: LogFilterOptions = {
                search: searchQuery || undefined
            };

            // Add date range filter
            if (timeRange) {
                const now = new Date();
                let startDate: Date;

                switch (timeRange) {
                    case '24h':
                        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                        break;
                    case '7d':
                        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                        break;
                    case '30d':
                        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                        break;
                    default:
                        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                }

                filterOptions.startDate = startDate.toISOString();
                filterOptions.endDate = now.toISOString();
            }

            // Add type filter based on selected tab
            if (selectedTab !== 'all') {
                filterOptions.source = selectedTab;
            }

            const csvBlob = await exportLogsAsCsv(filterOptions);

            // Create a download link and trigger download
            const url = window.URL.createObjectURL(csvBlob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `mintflow-logs-${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Error exporting logs:', err);
            alert('Failed to export logs. Please try again later.');
        } finally {
            setIsExporting(false);
        }
    };

    // Format timestamp for display
    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    // Get icon for log type
    const getLogIcon = (type: string) => {
        switch (type) {
            case 'error':
                return <AlertCircle className="w-4 h-4 text-red-500" />;
            case 'warning':
                return <AlertCircle className="w-4 h-4 text-yellow-500" />;
            case 'info':
                return <Info className="w-4 h-4 text-blue-500" />;
            case 'debug':
                return <Info className="w-4 h-4 text-gray-500" />;
            default:
                return <Info className="w-4 h-4 text-gray-500" />;
        }
    };

    // Generate pagination items
    const getPaginationItems = () => {
        const items = [];
        const totalPages = logsData.totalPages;
        const currentPageNum = currentPage;

        // Always show first page
        items.push(
            <button
                key="page-1"
                className={`w-8 h-8 flex items-center justify-center rounded-md border ${currentPageNum === 1 ? 'bg-black text-white' : ''} mr-2`}
                onClick={() => handlePageChange(1)}
                disabled={currentPageNum === 1}
            >
                1
            </button>
        );

        // Show ellipsis if needed
        if (currentPageNum > 3) {
            items.push(<span key="ellipsis-1" className="mx-2">...</span>);
        }

        // Show current page and surrounding pages
        for (let i = Math.max(2, currentPageNum - 1); i <= Math.min(totalPages - 1, currentPageNum + 1); i++) {
            if (i === 1 || i === totalPages) continue; // Skip first and last page as they're always shown
            items.push(
                <button
                    key={`page-${i}`}
                    className={`w-8 h-8 flex items-center justify-center rounded-md border ${currentPageNum === i ? 'bg-black text-white' : ''} mr-2`}
                    onClick={() => handlePageChange(i)}
                >
                    {i}
                </button>
            );
        }

        // Show ellipsis if needed
        if (currentPageNum < totalPages - 2) {
            items.push(<span key="ellipsis-2" className="mx-2">...</span>);
        }

        // Always show last page if there's more than one page
        if (totalPages > 1) {
            items.push(
                <button
                    key={`page-${totalPages}`}
                    className={`w-8 h-8 flex items-center justify-center rounded-md border ${currentPageNum === totalPages ? 'bg-black text-white' : ''} mr-2`}
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPageNum === totalPages}
                >
                    {totalPages}
                </button>
            );
        }

        return items;
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-semibold">Logs</h1>
                    <div className="flex items-center">
                        <form onSubmit={handleSearchSubmit} className="relative mr-4">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search logs..."
                                className="pl-10 pr-4 py-2 border rounded-md w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={searchQuery}
                                onChange={handleSearch}
                            />
                        </form>
                        <div className="relative mr-2">
                            <button className="flex items-center border rounded-md px-3 py-2 bg-white">
                                <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                                <span className="text-sm">
                                    {timeRange === '24h' ? 'Last 24 hours' :
                                        timeRange === '7d' ? 'Last 7 days' :
                                            timeRange === '30d' ? 'Last 30 days' : 'Custom range'}
                                </span>
                                <ChevronDown className="w-4 h-4 ml-2 text-gray-500" />
                            </button>
                            {/* Time range dropdown would go here */}
                        </div>
                        <button className="flex items-center border rounded-md px-3 py-2 bg-white mr-2">
                            <Filter className="w-4 h-4 mr-2 text-gray-500" />
                            <span className="text-sm">Filter</span>
                        </button>
                        <button
                            className="flex items-center border rounded-md px-3 py-2 bg-white"
                            onClick={handleExport}
                            disabled={isExporting}
                        >
                            {isExporting ? (
                                <Loader2 className="w-4 h-4 mr-2 text-gray-500 animate-spin" />
                            ) : (
                                <Download className="w-4 h-4 mr-2 text-gray-500" />
                            )}
                            <span className="text-sm">{isExporting ? 'Exporting...' : 'Export'}</span>
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-md shadow-sm mb-6">
                    <div className="flex border-b">
                        <button
                            className={`px-4 py-3 text-sm font-medium ${selectedTab === 'all' ? 'border-b-2 border-black' : 'text-gray-500'}`}
                            onClick={() => handleTabChange('all')}
                        >
                            All logs
                        </button>
                        <button
                            className={`px-4 py-3 text-sm font-medium ${selectedTab === 'api' ? 'border-b-2 border-black' : 'text-gray-500'}`}
                            onClick={() => handleTabChange('api')}
                        >
                            API logs
                        </button>
                        <button
                            className={`px-4 py-3 text-sm font-medium ${selectedTab === 'auth' ? 'border-b-2 border-black' : 'text-gray-500'}`}
                            onClick={() => handleTabChange('auth')}
                        >
                            Authentication
                        </button>
                        <button
                            className={`px-4 py-3 text-sm font-medium ${selectedTab === 'system' ? 'border-b-2 border-black' : 'text-gray-500'}`}
                            onClick={() => handleTabChange('system')}
                        >
                            System
                        </button>
                        <button
                            className={`px-4 py-3 text-sm font-medium ${selectedTab === 'billing' ? 'border-b-2 border-black' : 'text-gray-500'}`}
                            onClick={() => handleTabChange('billing')}
                        >
                            Billing
                        </button>
                    </div>

                    <div className="p-4">
                        {isLoading ? (
                            <div className="flex justify-center items-center py-12">
                                <Loader2 className="w-6 h-6 text-gray-500 animate-spin mr-2" />
                                <span className="text-gray-500">Loading logs...</span>
                            </div>
                        ) : error ? (
                            <div className="flex justify-center items-center py-12 text-red-500">
                                <AlertCircle className="w-6 h-6 mr-2" />
                                <span>{error}</span>
                            </div>
                        ) : logsData.logs.length === 0 ? (
                            <div className="flex flex-col justify-center items-center py-12 text-gray-500">
                                <Info className="w-8 h-8 mb-2" />
                                <span>No logs found for the selected filters.</span>
                                <p className="mt-2 text-sm">Try adjusting your search criteria or time range.</p>
                            </div>
                        ) : (
                            <table className="w-full">
                                <thead>
                                    <tr className="text-left text-gray-500 text-sm">
                                        <th className="pb-2 font-medium">Time</th>
                                        <th className="pb-2 font-medium">Type</th>
                                        <th className="pb-2 font-medium">Message</th>
                                        <th className="pb-2 font-medium">Details</th>
                                        <th className="pb-2 font-medium"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logsData.logs.map(log => (
                                        <React.Fragment key={log.id}>
                                            <tr className="border-t border-gray-100">
                                                <td className="py-3 pr-4 text-sm text-gray-600">
                                                    {formatTimestamp(log.timestamp)}
                                                </td>
                                                <td className="py-3 pr-4 text-sm">
                                                    <div className="flex items-center">
                                                        {getLogIcon(log.type)}
                                                        <span className="ml-2 capitalize">{log.type}</span>
                                                    </div>
                                                </td>
                                                <td className="py-3 pr-4 text-sm">{log.message}</td>
                                                <td className="py-3 pr-4 text-sm text-gray-500">{log.details}</td>
                                                <td className="py-3 text-right">
                                                    <button
                                                        className="text-gray-400 hover:text-gray-600"
                                                        onClick={() => toggleLogExpansion(log.id)}
                                                    >
                                                        <ArrowDownCircle className={`w-4 h-4 ${expandedLogId === log.id ? 'transform rotate-180' : ''}`} />
                                                    </button>
                                                </td>
                                            </tr>
                                            {expandedLogId === log.id && (
                                                <tr className="bg-gray-50">
                                                    <td colSpan={5} className="py-3 px-4 text-sm">
                                                        <div className="font-medium mb-1">Additional Information</div>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <div className="text-gray-500">Source</div>
                                                                <div>{log.source || 'N/A'}</div>
                                                            </div>
                                                            <div>
                                                                <div className="text-gray-500">Flow ID</div>
                                                                <div>{log.flowId || 'N/A'}</div>
                                                            </div>
                                                            <div>
                                                                <div className="text-gray-500">User ID</div>
                                                                <div>{log.userId || 'N/A'}</div>
                                                            </div>
                                                            <div>
                                                                <div className="text-gray-500">Timestamp (UTC)</div>
                                                                <div>{new Date(log.timestamp).toISOString()}</div>
                                                            </div>
                                                        </div>
                                                        {log.details && (
                                                            <div className="mt-3">
                                                                <div className="text-gray-500 mb-1">Full Details</div>
                                                                <pre className="bg-gray-100 p-3 rounded-md overflow-x-auto text-xs">
                                                                    {log.details}
                                                                </pre>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {!isLoading && !error && logsData.logs.length > 0 && (
                        <div className="flex items-center justify-between border-t p-4">
                            <div className="text-sm text-gray-500">
                                Showing {(currentPage - 1) * 20 + 1}-{Math.min(currentPage * 20, logsData.total)} of {logsData.total} logs
                            </div>
                            <div className="flex items-center">
                                <button
                                    className="w-8 h-8 flex items-center justify-center rounded-md border mr-2 text-gray-400"
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                {getPaginationItems()}
                                <button
                                    className="w-8 h-8 flex items-center justify-center rounded-md border"
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === logsData.totalPages}
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-gray-100 border border-gray-200 rounded-md p-4 text-sm">
                    <p className="font-medium mb-2">Retention policy</p>
                    <p className="text-gray-600">
                        Logs are retained for {retentionPolicy.days} days.
                        {retentionPolicy.extendedRetention
                            ? ' Your account has extended log retention enabled.'
                            : ' For extended log retention, consider using our log export feature or contact support to discuss enterprise log management options.'}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LogsPage;
