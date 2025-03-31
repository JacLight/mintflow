'use client';

import React, { useState, useRef, useEffect } from 'react';
import { TerminalComponent } from './terminal';
import { LogViewer } from './log-viewer';
import { ChevronDown, ChevronUp, Terminal, FileText, Activity, X } from 'lucide-react';

type TabType = 'terminal' | 'logs' | 'system';

interface ConsolePanelProps {
    className?: string;
    flowId?: string;
    initialTab?: TabType;
    initialHeight?: number;
}

export const ConsolePanel: React.FC<ConsolePanelProps> = ({
    className,
    flowId,
    initialTab = 'terminal',
    initialHeight = 300
}) => {
    const [activeTab, setActiveTab] = useState<TabType>(initialTab);
    const [isExpanded, setIsExpanded] = useState(true);
    const [height, setHeight] = useState(initialHeight);
    const resizeRef = useRef<HTMLDivElement>(null);
    const startYRef = useRef<number>(0);
    const startHeightRef = useRef<number>(initialHeight);
    const minHeight = 150;
    const maxHeight = 800;

    // Handle resize start
    const handleResizeStart = (e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        startYRef.current = e.clientY;
        startHeightRef.current = height;

        document.addEventListener('mousemove', handleResizeMove);
        document.addEventListener('mouseup', handleResizeEnd);
    };

    // Handle resize move
    const handleResizeMove = (e: MouseEvent) => {
        if (!isExpanded) return;

        const deltaY = startYRef.current - e.clientY;
        const newHeight = Math.max(minHeight, Math.min(maxHeight, startHeightRef.current + deltaY));
        setHeight(newHeight);
    };

    // Handle resize end
    const handleResizeEnd = () => {
        document.removeEventListener('mousemove', handleResizeMove);
        document.removeEventListener('mouseup', handleResizeEnd);
    };

    // Clean up event listeners on unmount
    useEffect(() => {
        return () => {
            document.removeEventListener('mousemove', handleResizeMove);
            document.removeEventListener('mouseup', handleResizeEnd);
        };
    }, []);

    // Toggle console expansion
    const toggleExpanded = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <div
            className={`console-panel border-t border-gray-300 bg-white ${className || ''}`}
            style={{ height: isExpanded ? height : 40 }}
        >
            {/* Resize handle */}
            <div
                ref={resizeRef}
                className="resize-handle h-1 w-full cursor-ns-resize bg-gray-200 hover:bg-gray-300"
                onMouseDown={handleResizeStart}
            />

            {/* Console header */}
            <div className="console-header flex items-center justify-between px-4 h-10 border-b border-gray-300">
                <div className="flex items-center space-x-4">
                    <button
                        className={`tab-button px-3 py-1 rounded-t flex items-center space-x-1 ${activeTab === 'terminal' ? 'bg-gray-100 font-medium' : 'hover:bg-gray-50'}`}
                        onClick={() => setActiveTab('terminal')}
                    >
                        <Terminal size={16} />
                        <span>Terminal</span>
                    </button>

                    <button
                        className={`tab-button px-3 py-1 rounded-t flex items-center space-x-1 ${activeTab === 'logs' ? 'bg-gray-100 font-medium' : 'hover:bg-gray-50'}`}
                        onClick={() => setActiveTab('logs')}
                    >
                        <FileText size={16} />
                        <span>Logs</span>
                    </button>

                    <button
                        className={`tab-button px-3 py-1 rounded-t flex items-center space-x-1 ${activeTab === 'system' ? 'bg-gray-100 font-medium' : 'hover:bg-gray-50'}`}
                        onClick={() => setActiveTab('system')}
                    >
                        <Activity size={16} />
                        <span>System</span>
                    </button>
                </div>

                <div className="flex items-center space-x-2">
                    <button
                        className="p-1 rounded hover:bg-gray-100"
                        onClick={toggleExpanded}
                        aria-label={isExpanded ? 'Collapse console' : 'Expand console'}
                    >
                        {isExpanded ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                    </button>
                </div>
            </div>

            {/* Console content */}
            {isExpanded && (
                <div className="console-content h-[calc(100%-40px)]">
                    {activeTab === 'terminal' && (
                        <TerminalComponent className="h-full" />
                    )}

                    {activeTab === 'logs' && (
                        <LogViewer className="h-full" flowId={flowId} runId={undefined} />
                    )}

                    {activeTab === 'system' && (
                        <div className="h-full p-4">
                            <h3 className="text-lg font-medium mb-4">System Information</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-3 rounded border">
                                    <h4 className="font-medium mb-2">Server Status</h4>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                        <span>Connected</span>
                                    </div>
                                    <div className="mt-2 text-sm text-gray-600">
                                        <div>Uptime: 3h 45m</div>
                                        <div>Version: 1.0.0</div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-3 rounded border">
                                    <h4 className="font-medium mb-2">Resources</h4>
                                    <div className="text-sm">
                                        <div className="mb-1">
                                            <span className="text-gray-600">CPU: </span>
                                            <span>23%</span>
                                        </div>
                                        <div className="mb-1">
                                            <span className="text-gray-600">Memory: </span>
                                            <span>512MB / 2GB</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Disk: </span>
                                            <span>4.2GB / 20GB</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-3 rounded border">
                                    <h4 className="font-medium mb-2">Active Sessions</h4>
                                    <div className="text-sm">
                                        <div>Terminal Sessions: 1</div>
                                        <div>Workflow Executions: 0</div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-3 rounded border">
                                    <h4 className="font-medium mb-2">Network</h4>
                                    <div className="text-sm">
                                        <div>WebSocket: Connected</div>
                                        <div>API Latency: 42ms</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
