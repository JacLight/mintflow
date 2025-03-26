import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

interface ComboboxContextType {
    value: any;
    onChange: (value: any) => void;
    open: boolean;
    setOpen: (open: boolean) => void;
    inputValue: string;
    setInputValue: (value: string) => void;
}

const ComboboxContext = createContext<ComboboxContextType>({
    value: undefined,
    onChange: () => { },
    open: false,
    setOpen: () => { },
    inputValue: '',
    setInputValue: () => { },
});

interface ComboboxProps {
    value: any;
    onChange: (value: any) => void;
    as?: React.ElementType;
    className?: string;
    children: React.ReactNode;
}

export const Combobox: React.FC<ComboboxProps> & {
    Input: typeof ComboboxInput;
    Button: typeof ComboboxButton;
    Options: typeof ComboboxOptions;
    Option: typeof ComboboxOption;
} = ({
    value,
    onChange,
    as: Component = 'div',
    className = '',
    children
}) => {
        const [open, setOpen] = useState(false);
        const [inputValue, setInputValue] = useState('');

        return (
            <ComboboxContext.Provider value={{ value, onChange, open, setOpen, inputValue, setInputValue }}>
                <Component className={className}>
                    {children}
                </Component>
            </ComboboxContext.Provider>
        );
    };

interface ComboboxInputProps {
    as?: React.ElementType;
    className?: string;
    displayValue?: (item: any) => string;
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
}

export const ComboboxInput: React.FC<ComboboxInputProps> = ({
    as: Component = 'input',
    className = '',
    displayValue = (item) => item?.toString() || '',
    onChange,
    placeholder = '',
}) => {
    const { value, inputValue, setInputValue, setOpen } = useContext(ComboboxContext);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(event.target.value);
        setOpen(true);
        if (onChange) {
            onChange(event);
        }
    };

    const handleFocus = () => {
        setOpen(true);
    };

    return (
        <Component
            type="text"
            role="combobox"
            aria-expanded={true}
            value={inputValue}
            onChange={handleChange}
            onFocus={handleFocus}
            className={className}
            placeholder={placeholder}
        />
    );
};

interface ComboboxButtonProps {
    as?: React.ElementType;
    className?: string;
    children?: React.ReactNode;
    onClick?: (event?: React.MouseEvent) => void;
}

export const ComboboxButton: React.FC<ComboboxButtonProps> = ({
    as: Component = 'button',
    className = '',
    children,
    onClick,
}) => {
    const { open, setOpen } = useContext(ComboboxContext);

    const handleClick = (event: React.MouseEvent) => {
        if (onClick) {
            onClick(event);
        } else {
            setOpen(!open);
        }
    };

    return (
        <Component
            type="button"
            className={className}
            onClick={handleClick}
            aria-expanded={open ? "true" : "false"}
        >
            {children}
        </Component>
    );
};

interface ComboboxOptionsProps {
    as?: React.ElementType;
    className?: string;
    children: React.ReactNode;
}

export const ComboboxOptions: React.FC<ComboboxOptionsProps> = ({
    as: Component = 'ul',
    className = '',
    children
}) => {
    const { open } = useContext(ComboboxContext);
    const ref = useRef<HTMLElement>(null);

    // Close on click outside
    useEffect(() => {
        if (!open) return undefined;

        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                const { setOpen } = useContext(ComboboxContext);
                setOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [open]);

    if (!open) return null;

    return (
        <Component
            ref={ref as any}
            role="listbox"
            className={className}
        >
            {children}
        </Component>
    );
};

interface ComboboxOptionProps {
    value: any;
    as?: React.ElementType;
    className?: string | ((props: { active: boolean; selected: boolean }) => string);
    disabled?: boolean;
    children: React.ReactNode | ((props: { active: boolean; selected: boolean; disabled: boolean }) => React.ReactNode);
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
}

export const ComboboxOption: React.FC<ComboboxOptionProps> = ({
    value,
    as: Component = 'li',
    className = '',
    disabled = false,
    children,
    onMouseEnter: customMouseEnter,
    onMouseLeave: customMouseLeave
}) => {
    const [active, setActive] = useState(false);
    const { value: selectedValue, onChange, setOpen, setInputValue } = useContext(ComboboxContext);

    const selected = selectedValue === value;

    const handleClick = () => {
        if (!disabled) {
            onChange(value);
            setOpen(false);

            // If value is an object with a display property, use that for the input
            if (value && typeof value === 'object' && 'label' in value) {
                setInputValue(value.label);
            } else if (typeof value === 'string') {
                setInputValue(value);
            }
        }
    };

    const handleMouseEnter = () => {
        setActive(true);
        if (customMouseEnter) {
            customMouseEnter();
        }
    };

    const handleMouseLeave = () => {
        setActive(false);
        if (customMouseLeave) {
            customMouseLeave();
        }
    };

    const resolvedClassName = typeof className === 'function'
        ? className({ active, selected })
        : className;

    const resolvedChildren = typeof children === 'function'
        ? children({ active, selected, disabled })
        : children;

    return (
        <Component
            role="option"
            aria-selected={selected ? "true" : "false"}
            onClick={handleClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={resolvedClassName}
            aria-disabled={disabled ? "true" : undefined}
        >
            {resolvedChildren}
        </Component>
    );
};

// Add components to Combobox
Combobox.Input = ComboboxInput;
Combobox.Button = ComboboxButton;
Combobox.Options = ComboboxOptions;
Combobox.Option = ComboboxOption;

export default Combobox;
