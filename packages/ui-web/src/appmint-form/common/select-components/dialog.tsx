import React, { createContext, useContext, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface DialogContextType {
    open: boolean;
    onClose: () => void;
}

const DialogContext = createContext<DialogContextType>({
    open: false,
    onClose: () => { },
});

interface DialogProps {
    as?: React.ElementType;
    className?: string;
    open?: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

export const Dialog: React.FC<DialogProps> & {
    Panel: typeof DialogPanel;
    Title: typeof DialogTitle;
    Description: typeof DialogDescription;
} = ({
    as: Component = 'div',
    className = '',
    open = false,
    onClose,
    children
}) => {
        // Handle ESC key to close dialog
        useEffect(() => {
            if (!open) return undefined;

            const handleKeyDown = (event: KeyboardEvent) => {
                if (event.key === 'Escape') {
                    onClose();
                }
            };

            window.addEventListener('keydown', handleKeyDown);
            return () => window.removeEventListener('keydown', handleKeyDown);
        }, [open, onClose]);

        if (!open) return null;

        return createPortal(
            <DialogContext.Provider value={{ open, onClose }}>
                <Component className={className} role="dialog" aria-modal="true">
                    {children}
                </Component>
            </DialogContext.Provider>,
            document.body
        );
    };

interface DialogPanelProps {
    as?: React.ElementType;
    className?: string;
    children: React.ReactNode;
}

export const DialogPanel: React.FC<DialogPanelProps> = ({
    as: Component = 'div',
    className = '',
    children
}) => {
    return <Component className={className}>{children}</Component>;
};

interface DialogTitleProps {
    as?: React.ElementType;
    className?: string;
    children: React.ReactNode;
}

export const DialogTitle: React.FC<DialogTitleProps> = ({
    as: Component = 'h3',
    className = '',
    children
}) => {
    return <Component className={className}>{children}</Component>;
};

interface DialogDescriptionProps {
    as?: React.ElementType;
    className?: string;
    children: React.ReactNode;
}

export const DialogDescription: React.FC<DialogDescriptionProps> = ({
    as: Component = 'p',
    className = '',
    children
}) => {
    return <Component className={className}>{children}</Component>;
};

// Add components to Dialog
Dialog.Panel = DialogPanel;
Dialog.Title = DialogTitle;
Dialog.Description = DialogDescription;

export default Dialog;
