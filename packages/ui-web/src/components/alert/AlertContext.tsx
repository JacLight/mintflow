
import React, { createContext, useContext, useState, useReducer, useEffect, ReactNode } from 'react';
import { Alert, AlertType, ToastConfig, AlertState, AlertContextType, AlertAction } from './types';

// Initial state for our alerts
const initialState: AlertState = {
    alerts: [],
    toastConfig: {
        position: 'top-right',
        duration: 5000, // milliseconds
    },
};

// Create context with default undefined value and proper typing
const AlertContext = createContext<AlertContextType | undefined>(undefined);

// Reducer to handle alert actions
function alertReducer(state: AlertState, action: AlertAction): AlertState {
    switch (action.type) {
        case 'ADD_ALERT':
            return {
                ...state,
                alerts: [
                    {
                        id: Date.now(),
                        ...action.payload,
                        read: false,
                        timestamp: new Date(),
                    },
                    ...state.alerts,
                ],
            };
        case 'REMOVE_ALERT':
            return {
                ...state,
                alerts: state.alerts.filter((alert) => alert.id !== action.payload),
            };
        case 'CLEAR_ALL_ALERTS':
            return {
                ...state,
                alerts: state.alerts.filter((alert) => alert.alertType === AlertType.CONFIRM),
            };
        case 'MARK_AS_READ':
            return {
                ...state,
                alerts: state.alerts.map((alert) =>
                    alert.id === action.payload ? { ...alert, read: true } : alert
                ),
            };
        case 'UPDATE_CONFIRM_ALERT':
            return {
                ...state,
                alerts: state.alerts.map((alert) =>
                    alert.id === action.payload.id ?
                        { ...alert, confirmed: action.payload.confirmed } : alert
                ),
            };
        case 'UPDATE_TOAST_CONFIG':
            return {
                ...state,
                toastConfig: {
                    ...state.toastConfig,
                    ...action.payload,
                },
            };
        default:
            return state;
    }
}

interface AlertProviderProps {
    children: ReactNode;
}

// Provider component
export const AlertProvider: React.FC<AlertProviderProps> = ({ children }) => {
    const [state, dispatch] = useReducer(alertReducer, initialState);
    const [showToast, setShowToast] = useState<Alert | null>(null);

    // Effect to show toast notifications when new alerts are added
    useEffect(() => {
        const unreadAlerts = state.alerts.filter(alert => !alert.read);
        if (unreadAlerts.length > 0) {
            setShowToast(unreadAlerts[0]);

            // Mark as read after duration
            const timer = setTimeout(() => {
                dispatch({ type: 'MARK_AS_READ', payload: unreadAlerts[0].id });
                setShowToast(null);
            }, state.toastConfig.duration);

            return () => clearTimeout(timer);
        }
    }, [state.alerts, state.toastConfig.duration]);

    // Function to add a new alert
    const addAlert = (alert: Omit<Alert, 'id' | 'read' | 'timestamp'>) => {
        dispatch({ type: 'ADD_ALERT', payload: alert });
    };

    // Function to remove an alert
    const removeAlert = (id: number) => {
        dispatch({ type: 'REMOVE_ALERT', payload: id });
    };

    // Function to clear all non-confirm alerts
    const clearAllAlerts = () => {
        dispatch({ type: 'CLEAR_ALL_ALERTS' });
    };

    // Function to mark an alert as read
    const markAsRead = (id: number) => {
        dispatch({ type: 'MARK_AS_READ', payload: id });
    };

    // Function to update a confirm alert
    const updateConfirmAlert = (id: number, confirmed: boolean) => {
        dispatch({
            type: 'UPDATE_CONFIRM_ALERT',
            payload: { id, confirmed },
        });
    };

    // Function to update toast configuration
    const updateToastConfig = (config: Partial<ToastConfig>) => {
        dispatch({ type: 'UPDATE_TOAST_CONFIG', payload: config });
    };

    return (
        <AlertContext.Provider
            value={{
                alerts: state.alerts,
                toastConfig: state.toastConfig,
                showToast,
                addAlert,
                removeAlert,
                clearAllAlerts,
                markAsRead,
                updateConfirmAlert,
                updateToastConfig,
            }}
        >
            {children}
        </AlertContext.Provider>
    );
};

// Custom hook to use the alert context
export const useAlerts = (): AlertContextType => {
    const context = useContext(AlertContext);
    if (!context) {
        throw new Error('useAlerts must be used within an AlertProvider');
    }
    return context;
};

// Re-export AlertType to be used by consumers
export { AlertType };
