export enum AlertType {
    ERROR = 'error',
    INFO = 'info',
    WARNING = 'warning',
    SUCCESS = 'success',
    CONFIRM = 'confirm',
}

export interface Alert {
    id: number;
    title: string;
    message: string;
    alertType: AlertType;
    details?: string;
    read: boolean;
    timestamp: Date;
    confirmed?: boolean;
    onAction?: (confirmed: boolean) => void;
}

export interface ToastConfig {
    position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
    duration: number;
}

export interface AlertState {
    alerts: Alert[];
    toastConfig: ToastConfig;
}

export interface AlertContextType extends AlertState {
    showToast: Alert | null;
    addAlert: (alert: Omit<Alert, 'id' | 'read' | 'timestamp'>) => void;
    removeAlert: (id: number) => void;
    clearAllAlerts: () => void;
    markAsRead: (id: number) => void;
    updateConfirmAlert: (id: number, confirmed: boolean) => void;
    updateToastConfig: (config: Partial<ToastConfig>) => void;
}

export type AlertAction =
    | { type: 'ADD_ALERT'; payload: Omit<Alert, 'id' | 'read' | 'timestamp'> }
    | { type: 'REMOVE_ALERT'; payload: number }
    | { type: 'CLEAR_ALL_ALERTS' }
    | { type: 'MARK_AS_READ'; payload: number }
    | { type: 'UPDATE_CONFIRM_ALERT'; payload: { id: number; confirmed: boolean } }
    | { type: 'UPDATE_TOAST_CONFIG'; payload: Partial<ToastConfig> };



export interface Alert {
    id: number;
    title: string;
    message: string;
    alertType: AlertType;
    details?: string;
    read: boolean;
    timestamp: Date;
    confirmed?: boolean;
    onAction?: (confirmed: boolean) => void;
}

export interface ToastConfig {
    position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
    duration: number;
}