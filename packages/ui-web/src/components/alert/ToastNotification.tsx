'use client';

import React from 'react';
import { Alert, AlertType, ToastConfig } from './types';

interface ToastNotificationProps {
    alert: Alert;
    config: ToastConfig;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({ alert, config }) => {
    // Position classes
    const getPositionClasses = (position: ToastConfig['position']): string => {
        switch (position) {
            case 'top-left':
                return 'top-4 left-4';
            case 'top-center':
                return 'top-4 left-1/2 transform -translate-x-1/2';
            case 'top-right':
                return 'top-4 right-4';
            case 'bottom-left':
                return 'bottom-4 left-4';
            case 'bottom-center':
                return 'bottom-4 left-1/2 transform -translate-x-1/2';
            case 'bottom-right':
                return 'bottom-4 right-4';
            default:
                return 'top-4 right-4';
        }
    };

    // Get colors based on alert type
    const getColors = (type: AlertType): string => {
        switch (type) {
            case AlertType.ERROR:
                return 'bg-red-100 border-red-400 text-red-800';
            case AlertType.WARNING:
                return 'bg-yellow-100 border-yellow-400 text-yellow-800';
            case AlertType.SUCCESS:
                return 'bg-green-100 border-green-400 text-green-800';
            case AlertType.CONFIRM:
                return 'bg-blue-100 border-blue-400 text-blue-800';
            case AlertType.INFO:
            default:
                return 'bg-blue-100 border-blue-400 text-blue-800';
        }
    };

    // Get icon based on alert type
    const getIcon = (type: AlertType): any => {
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

    return (
        <div className={`fixed ${getPositionClasses(config.position)} z-50 max-w-sm w-full`}>
            <div className={`rounded-lg shadow-lg border ${getColors(alert.alertType)} p-4`}>
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        {getIcon(alert.alertType)}
                    </div>
                    <div className="ml-3 w-0 flex-1">
                        <p className="font-medium">{alert.title}</p>
                        <p className="mt-1 text-sm">{alert.message}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
