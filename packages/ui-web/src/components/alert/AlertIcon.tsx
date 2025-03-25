'use client';

import React, { useState, useEffect } from 'react';
import { useAlertStore } from './alertStore';
import { AlertDropdown } from './AlertDropdown';
import { AlertDialog } from './AlertDialog';
import { ToastNotification } from './ToastNotification';
import { Alert } from './types';

export const AlertIcon: React.FC = () => {
    const { alerts, showToast, toastConfig, markAsRead, setShowToast } = useAlertStore();
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

    // Calculate unread alerts count
    const unreadCount = alerts.filter(alert => !alert.read).length;

    // Effect to handle toast notifications
    useEffect(() => {
        const unreadAlerts = alerts.filter(alert => !alert.read);
        if (unreadAlerts.length > 0 && !showToast) {
            const nextAlert = unreadAlerts[0];
            setShowToast(nextAlert);

            // Mark as read after duration
            const timer = setTimeout(() => {
                markAsRead(nextAlert.id);
                setShowToast(null);
            }, toastConfig.duration);

            return () => clearTimeout(timer);
        }
    }, [alerts, toastConfig.duration, showToast, markAsRead, setShowToast]);

    // Toggle dropdown
    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    // View alert details
    const viewAlertDetails = (alert: Alert) => {
        setSelectedAlert(alert);
    };

    // Close alert details
    const closeAlertDetails = () => {
        setSelectedAlert(null);
    };

    return (
        <div className="relative">
            {/* Bell Icon */}
            <button
                className="relative p-2 text-gray-600 hover:text-gray-800 focus:outline-none"
                onClick={toggleDropdown}
                aria-label="Notifications"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                </svg>

                {/* Notification Badge */}
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Alert Dropdown */}
            {isOpen && (
                <AlertDropdown onViewAlertDetails={viewAlertDetails} onClose={() => setIsOpen(false)} />
            )}

            {/* Alert Detail Dialog */}
            {selectedAlert && (
                <AlertDialog alert={selectedAlert} onClose={closeAlertDetails} />
            )}

            {/* Toast Notification for new alerts */}
            {showToast && <ToastNotification alert={showToast} config={toastConfig} />}
        </div>
    );
};