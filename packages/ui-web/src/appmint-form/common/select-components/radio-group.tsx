import React, { createContext, useContext, useState } from 'react';

interface RadioGroupContextType {
    value: any;
    onChange: (value: any) => void;
}

const RadioGroupContext = createContext<RadioGroupContextType>({
    value: undefined,
    onChange: () => { },
});

interface RadioGroupProps {
    value: any;
    onChange: (value: any) => void;
    as?: React.ElementType;
    className?: string;
    children: React.ReactNode;
}

export const RadioGroup: React.FC<RadioGroupProps> & {
    Option: typeof RadioGroupOption;
    Label: typeof RadioGroupLabel;
    Description: typeof RadioGroupDescription;
} = ({
    value,
    onChange,
    as: Component = 'div',
    className = '',
    children
}) => {
        return (
            <RadioGroupContext.Provider value={{ value, onChange }}>
                <Component role="radiogroup" className={className}>
                    {children}
                </Component>
            </RadioGroupContext.Provider>
        );
    };

interface RadioGroupOptionProps {
    value: any;
    as?: React.ElementType;
    className?: string | ((props: { active: boolean; checked: boolean }) => string);
    disabled?: boolean;
    children: React.ReactNode | ((props: { active: boolean; checked: boolean; disabled: boolean }) => React.ReactNode);
}

export const RadioGroupOption: React.FC<RadioGroupOptionProps> = ({
    value,
    as: Component = 'div',
    className = '',
    disabled = false,
    children
}) => {
    const [active, setActive] = useState(false);
    const context = useContext(RadioGroupContext);

    const checked = context.value === value;

    const handleClick = () => {
        if (!disabled) {
            context.onChange(value);
        }
    };

    const handleFocus = () => setActive(true);
    const handleBlur = () => setActive(false);

    const resolvedClassName = typeof className === 'function'
        ? className({ active, checked })
        : className;

    const resolvedChildren = typeof children === 'function'
        ? children({ active, checked, disabled })
        : children;

    return (
        <Component
            role="radio"
            aria-checked={checked ? "true" : "false"}
            tabIndex={checked ? 0 : -1}
            onClick={handleClick}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className={resolvedClassName}
            aria-disabled={disabled ? "true" : undefined}
        >
            {resolvedChildren}
        </Component>
    );
};

interface RadioGroupLabelProps {
    as?: React.ElementType;
    className?: string;
    children: React.ReactNode;
}

export const RadioGroupLabel: React.FC<RadioGroupLabelProps> = ({
    as: Component = 'label',
    className = '',
    children
}) => {
    return <Component className={className}>{children}</Component>;
};

interface RadioGroupDescriptionProps {
    as?: React.ElementType;
    className?: string;
    children: React.ReactNode;
}

export const RadioGroupDescription: React.FC<RadioGroupDescriptionProps> = ({
    as: Component = 'p',
    className = '',
    children
}) => {
    return <Component className={className}>{children}</Component>;
};

// Add components to RadioGroup
RadioGroup.Option = RadioGroupOption;
RadioGroup.Label = RadioGroupLabel;
RadioGroup.Description = RadioGroupDescription;

export default RadioGroup;
