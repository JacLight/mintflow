import React, { useState } from 'react';

interface SwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    className?: string;
    children?: React.ReactNode;
}

export const Switch: React.FC<SwitchProps> & {
    Group: typeof SwitchGroup;
    Label: typeof SwitchLabel;
    Description: typeof SwitchDescription;
} = ({ checked, onChange, className = '', children }) => {
    const handleClick = () => {
        onChange(!checked);
    };

    // Use a div instead of a button to avoid nesting issues
    return (
        <div
            role="switch"
            aria-checked={checked === true ? "true" : "false"}
            onClick={handleClick}
            className={className}
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onChange(!checked);
                }
            }}
        >
            {children}
        </div>
    );
};

interface SwitchGroupProps {
    as?: React.ElementType;
    className?: string;
    children: React.ReactNode;
}

export const SwitchGroup: React.FC<SwitchGroupProps> = ({
    as: Component = 'div',
    className = '',
    children
}) => {
    return <Component className={className}>{children}</Component>;
};

interface SwitchLabelProps {
    as?: React.ElementType;
    className?: string;
    passive?: boolean;
    children: React.ReactNode;
}

export const SwitchLabel: React.FC<SwitchLabelProps> = ({
    as: Component = 'label',
    className = '',
    passive = false,
    children
}) => {
    return <Component className={className}>{children}</Component>;
};

interface SwitchDescriptionProps {
    as?: React.ElementType;
    className?: string;
    children: React.ReactNode;
}

export const SwitchDescription: React.FC<SwitchDescriptionProps> = ({
    as: Component = 'p',
    className = '',
    children
}) => {
    return <Component className={className}>{children}</Component>;
};

// Add components to Switch
Switch.Group = SwitchGroup;
Switch.Label = SwitchLabel;
Switch.Description = SwitchDescription;

export default Switch;
