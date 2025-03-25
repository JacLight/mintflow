'use client';

import React from 'react';
import { useAlertStore } from './alertStore';
import { Alert, AlertType } from './types';

interface AlertDropdownProps {
    onViewAlertDetails: (alert: Alert) => void;
    onClose: () => void;
}

export const AlertDropdown: React.FC<AlertDropdownProps> = ({ onViewAlertDetails, onClose }) => {
    const { alerts, removeAlert, clearAllAlerts, markAsRead, updateConfirmAlert } = useAlertStore();

    // Format timestamp
    const formatTime = (date: Date): string => {
        return new Date(date).toLocaleString();
    };

    // Get icon for alert type
    const getAlertIcon = (type: AlertType): any => {
        switch (type) {
            case AlertType.ERROR:
                return (
                    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                );
            case AlertType.WARNING:
                return (
                    <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                    </svg>
                );
            case AlertType.SUCCESS:
                return (
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                );
            case AlertType.CONFIRM:
                return (
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                );
            case AlertType.INFO:
            default:
                return (
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                );
        }
    };

    // Handle confirm action
    const handleConfirmAction = (alert: Alert, confirmed: boolean) => {
        updateConfirmAlert(alert.id, confirmed);
        if (alert.onAction) {
            alert.onAction(confirmed);
        }
    };

    // Handle alert click
    const handleAlertClick = (alert: Alert) => {
        markAsRead(alert.id);
        onViewAlertDetails(alert);
    };

    return (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-50 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="py-2">
                <div className="px-4 py-2 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-700">Notifications</h3>
                    {alerts.length > 0 && (
                        <button
                            onClick={clearAllAlerts}
                            className="text-sm text-blue-600 hover:text-blue-800"
                        >
                            Clear All
                        </button>
                    )}
                </div>

                <div className="max-h-96 overflow-y-auto">
                    {alerts.length === 0 ? (
                        <div className="px-4 py-6 text-center text-gray-500">
                            No notifications
                        </div>
                    ) : (
                        <ul>
                            {alerts.map((alert) => (
                                <li
                                    key={alert.id}
                                    className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 ${!alert.read ? 'bg-blue-50' : ''}`}
                                >
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0 pt-1">
                                            {getAlertIcon(alert.alertType)}
                                        </div>
                                        <div className="ml-3 flex-1">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-medium text-gray-900">
                                                    {alert.title}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {formatTime(alert.timestamp)}
                                                </p>
                                            </div>
                                            <p className="text-sm text-gray-500 mt-1 truncate">
                                                {alert.message}
                                            </p>
                                            <div className="mt-2 flex justify-between">
                                                {alert.alertType === AlertType.CONFIRM && !alert.confirmed && (
                                                    <div>
                                                        <button
                                                            onClick={() => handleConfirmAction(alert, true)}
                                                            className="text-xs bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 rounded mr-2"
                                                        >
                                                            Confirm
                                                        </button>
                                                        <button
                                                            onClick={() => handleConfirmAction(alert, false)}
                                                            className="text-xs bg-gray-300 hover:bg-gray-400 text-gray-800 py-1 px-2 rounded"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                )}
                                                {alert.alertType !== AlertType.CONFIRM && (
                                                    <button
                                                        onClick={() => removeAlert(alert.id)}
                                                        className="text-xs text-gray-500 hover:text-gray-700"
                                                    >
                                                        Dismiss
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleAlertClick(alert)}
                                                    className="text-xs text-blue-600 hover:text-blue-800"
                                                >
                                                    View
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};