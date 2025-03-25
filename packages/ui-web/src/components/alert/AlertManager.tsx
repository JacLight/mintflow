
import React, { ReactNode } from 'react';
import { AlertProvider } from './AlertContext';
import { AlertIcon } from './AlertIcon';
import { ToastConfig } from './types';

interface AlertManagerProps {
    children: ReactNode;
    initialConfig?: Partial<ToastConfig>;
}

export const AlertManager: React.FC<AlertManagerProps> = ({ children, initialConfig }) => {
    return (
        <AlertProvider>
            {children}
            <AlertIcon />
        </AlertProvider>
    );
};
