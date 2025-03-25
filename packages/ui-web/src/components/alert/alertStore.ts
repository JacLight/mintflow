'use client';

import { create } from 'zustand';
import { Alert, AlertType, ToastConfig } from './types';

interface AlertState {
    alerts: Alert[];
    toastConfig: ToastConfig;
    showToast: Alert | null;
    addAlert: (alert: Omit<Alert, 'id' | 'read' | 'timestamp'>) => void;
    removeAlert: (id: number) => void;
    clearAllAlerts: () => void;
    markAsRead: (id: number) => void;
    updateConfirmAlert: (id: number, confirmed: boolean) => void;
    updateToastConfig: (config: Partial<ToastConfig>) => void;
    setShowToast: (alert: Alert | null) => void;
}

export const useAlertStore = create<AlertState>((set) => ({
    alerts: [],
    toastConfig: {
        position: 'top-right',
        duration: 5000,
    },
    showToast: null,

    addAlert: (alert) =>
        set((state) => ({
            alerts: [
                {
                    id: Date.now(),
                    ...alert,
                    read: false,
                    timestamp: new Date(),
                },
                ...state.alerts,
            ],
        })),

    removeAlert: (id) =>
        set((state) => ({
            alerts: state.alerts.filter((alert) => alert.id !== id),
        })),

    clearAllAlerts: () =>
        set((state) => ({
            alerts: state.alerts.filter((alert) => alert.alertType === AlertType.CONFIRM),
        })),

    markAsRead: (id) =>
        set((state) => ({
            alerts: state.alerts.map((alert) =>
                alert.id === id ? { ...alert, read: true } : alert
            ),
        })),

    updateConfirmAlert: (id, confirmed) =>
        set((state) => ({
            alerts: state.alerts.map((alert) =>
                alert.id === id ? { ...alert, confirmed } : alert
            ),
        })),

    updateToastConfig: (config) =>
        set((state) => ({
            toastConfig: {
                ...state.toastConfig,
                ...config,
            },
        })),

    setShowToast: (alert) =>
        set({
            showToast: alert,
        }),
}));