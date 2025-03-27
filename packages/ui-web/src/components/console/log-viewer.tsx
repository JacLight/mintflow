'use client';

import React, { useEffect, useState, useRef } from 'react';
import { getConsoleService, ConsoleMessage } from '@/lib/console-service';

interface LogViewerProps {
    className?: string;
    flowId?: string;
}

type LogLevel = 'info' | 'error' | 'warning' | 'debug';

interface LogEntry {
    id: string;
    timestamp: Date;
    level: LogLevel;
    message: string;
    source?: string;
    flowId?: string;
}

export const LogViewer: React.FC<LogViewerProps> = ({ className, flowId }) => {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [filter, setFilter] = useState<LogLevel | 'all'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [autoScroll, setAutoScroll] = useState(true);
    const logContainerRef = useRef<HTMLDivElement>(null);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const consoleService = getConsoleService();

    // Connect to console server and create a session
    useEffect(() => {
        consoleService.connect();

        const setupSession = async () => {
            try {
                const newSessionId = await consoleService.createSession();
                setSessionId(newSessionId);

                // Add some sample logs for demonstration
                addLog('info', 'Log viewer initialized');
                addLog('info', 'Connected to console server');

                // Subscribe to console messages
                const unsubscribe = consoleService.subscribeToMessages(newSessionId, handleConsoleMessage);

                return () => {
                    unsubscribe();
                    if (newSessionId) {
                        consoleService.terminateSession(newSessionId);
                    }
                };
            } catch (error) {
                console.error('Error setting up log viewer session:', error);
                addLog('error', 'Failed to connect to console server');
            }
        };

        const cleanup = setupSession();
        return () => {
            cleanup.then(cleanupFn => cleanupFn && cleanupFn());
            consoleService.disconnect();
        };
    }, []);

    // Handle console messages
    const handleConsoleMessage = (message: ConsoleMessage) => {
        if (message.type === 'output') {
            const level: LogLevel = message.stream === 'stderr' ? 'error' : 'info';
            addLog(level, message.data || '');
        } else if (message.type === 'error') {
            addLog('error', message.error || 'Unknown error');
        } else if (message.type === 'system') {
            addLog('info', `System event: ${message.event}`);
        }
    };

    // Add a log entry
    const addLog = (level: LogLevel, message: string, source?: string) => {
        const newLog: LogEntry = {
            id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
            timestamp: new Date(),
            level,
            message,
            source,
            flowId
        };

        setLogs(prevLogs => [...prevLogs, newLog]);
    };

    // Auto-scroll to bottom when new logs are added
    useEffect(() => {
        if (autoScroll && logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [logs, autoScroll]);

    // Filter logs based on level and search term
    const filteredLogs = logs.filter(log => {
        const matchesFilter = filter === 'all' || log.level === filter;
        const matchesSearch = !searchTerm ||
            log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (log.source && log.source.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesFlow = !flowId || log.flowId === flowId;

        return matchesFilter && matchesSearch && matchesFlow;
    });

    // Clear logs
    const clearLogs = () => {
        setLogs([]);
    };

    // Get CSS class for log level
    const getLogLevelClass = (level: LogLevel): string => {
        switch (level) {
            case 'error': return 'text-red-500';
            case 'warning': return 'text-yellow-500';
            case 'info': return 'text-blue-500';
            case 'debug': return 'text-gray-500';
            default: return '';
        }
    };

    return (
        <div className={`log-viewer flex flex-col h-full ${className || ''}`}>
            {/* Controls */}
            <div className="flex items-center p-2 border-b">
                <div className="flex space-x-2 mr-4">
                    <select
                        className="px-2 py-1 border rounded text-sm"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value as LogLevel | 'all')}
                        aria-label="Filter logs by level"
                    >
                        <option value="all">All Levels</option>
                        <option value="info">Info</option>
                        <option value="warning">Warning</option>
                        <option value="error">Error</option>
                        <option value="debug">Debug</option>
                    </select>

                    <input
                        type="text"
                        placeholder="Search logs..."
                        className="px-2 py-1 border rounded text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center space-x-4">
                    <label className="flex items-center text-sm">
                        <input
                            type="checkbox"
                            checked={autoScroll}
                            onChange={(e) => setAutoScroll(e.target.checked)}
                            className="mr-1"
                        />
                        Auto-scroll
                    </label>

                    <button
                        onClick={clearLogs}
                        className="px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm"
                    >
                        Clear
                    </button>
                </div>
            </div>

            {/* Log entries */}
            <div
                ref={logContainerRef}
                className="flex-1 overflow-y-auto font-mono text-sm p-2 bg-gray-50"
            >
                {filteredLogs.length === 0 ? (
                    <div className="text-gray-400 italic p-4 text-center">
                        No logs to display
                    </div>
                ) : (
                    filteredLogs.map(log => (
                        <div key={log.id} className="log-entry mb-1">
                            <span className="text-gray-500">
                                {log.timestamp.toLocaleTimeString()}
                            </span>
                            <span className={`ml-2 font-semibold ${getLogLevelClass(log.level)}`}>
                                [{log.level.toUpperCase()}]
                            </span>
                            {log.source && (
                                <span className="ml-2 text-gray-700">
                                    [{log.source}]
                                </span>
                            )}
                            <span className="ml-2 whitespace-pre-wrap">{log.message}</span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
