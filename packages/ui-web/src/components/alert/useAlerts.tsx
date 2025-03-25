'use client';

import { useEffect, useCallback } from 'react';
import { useAlertStore } from './alertStore';
import { AlertType, ToastConfig } from './types';

export function useAlerts() {
    const {
        addAlert,
        removeAlert,
        updateToastConfig,
        clearAllAlerts,
        markAsRead,
        updateConfirmAlert,
    } = useAlertStore();

    // Helper function to add an info alert
    const addInfoAlert = useCallback(
        (title: string, message: string, details?: string) => {
            addAlert({
                title,
                message,
                alertType: AlertType.INFO,
                details,
            });
        },
        [addAlert]
    );

    // Helper function to add a success alert
    const addSuccessAlert = useCallback(
        (title: string, message: string, details?: string) => {
            addAlert({
                title,
                message,
                alertType: AlertType.SUCCESS,
                details,
            });
        },
        [addAlert]
    );

    // Helper function to add an error alert
    const addErrorAlert = useCallback(
        (title: string, message: string, details?: string) => {
            addAlert({
                title,
                message,
                alertType: AlertType.ERROR,
                details,
            });
        },
        [addAlert]
    );

    // Helper function to add a warning alert
    const addWarningAlert = useCallback(
        (title: string, message: string, details?: string) => {
            addAlert({
                title,
                message,
                alertType: AlertType.WARNING,
                details,
            });
        },
        [addAlert]
    );

    // Helper function to add a confirm alert
    const addConfirmAlert = useCallback(
        (
            title: string,
            message: string,
            onAction: (confirmed: boolean) => void,
            details?: string
        ) => {
            addAlert({
                title,
                message,
                alertType: AlertType.CONFIRM,
                details,
                onAction,
            });
        },
        [addAlert]
    );

    // Helper to configure toast settings
    const configureToast = useCallback(
        (config: Partial<ToastConfig>) => {
            updateToastConfig(config);
        },
        [updateToastConfig]
    );

    return {
        addAlert,
        removeAlert,
        clearAllAlerts,
        configureToast,
        addInfoAlert,
        addSuccessAlert,
        addErrorAlert,
        addWarningAlert,
        addConfirmAlert,
        markAsRead,
        updateConfirmAlert,
    };
}
