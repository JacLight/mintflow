import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

interface ListboxContextType {
    value: any;
    onChange: (value: any) => void;
    open: boolean;
    setOpen: (open: boolean) => void;
}

const ListboxContext = createContext<ListboxContextType>({
    value: undefined,
    onChange: () => { },
    open: false,
    setOpen: () => { },
});

interface ListboxProps {
    value: any;
    onChange: (value: any) => void;
    as?: React.ElementType;
    className?: string;
    children: React.ReactNode;
}

export const Listbox: React.FC<ListboxProps> & {
    Button: typeof ListboxButton;
    Options: typeof ListboxOptions;
    Option: typeof ListboxOption;
} = ({
    value,
    onChange,
    as: Component = 'div',
    className = '',
    children
}) => {
        const [open, setOpen] = useState(false);

        return (
            <ListboxContext.Provider value={{ value, onChange, open, setOpen }}>
                <Component className={className}>
                    {children}
                </Component>
            </ListboxContext.Provider>
        );
    };

interface ListboxButtonProps {
    as?: React.ElementType;
    className?: string;
    children: React.ReactNode;
}

export const ListboxButton: React.FC<ListboxButtonProps> = ({
    as: Component = 'button',
    className = '',
    children
}) => {
    const { open, setOpen } = useContext(ListboxContext);

    const handleClick = () => {
        setOpen(!open);
    };

    return (
        <Component
            type="button"
            aria-haspopup="listbox"
            aria-expanded={open ? "true" : "false"}
            className={className}
            onClick={handleClick}
        >
            {children}
        </Component>
    );
};

interface ListboxOptionsProps {
    as?: React.ElementType;
    className?: string;
    anchor?: string;
    children: React.ReactNode;
}

export const ListboxOptions: React.FC<ListboxOptionsProps> = ({
    as: Component = 'ul',
    className = '',
    anchor = 'bottom',
    children
}) => {
    const { open } = useContext(ListboxContext);
    const ref = useRef<HTMLElement>(null);

    // Close on click outside
    useEffect(() => {
        if (!open) return undefined;

        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                const { setOpen } = useContext(ListboxContext);
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
            data-anchor={anchor}
        >
            {children}
        </Component>
    );
};

interface ListboxOptionProps {
    value: any;
    as?: React.ElementType;
    className?: string | ((props: { active: boolean; selected: boolean }) => string);
    disabled?: boolean;
    children: React.ReactNode | ((props: { active: boolean; selected: boolean; disabled: boolean }) => React.ReactNode);
}

export const ListboxOption: React.FC<ListboxOptionProps> = ({
    value,
    as: Component = 'li',
    className = '',
    disabled = false,
    children
}) => {
    const [active, setActive] = useState(false);
    const { value: selectedValue, onChange, setOpen } = useContext(ListboxContext);

    const selected = selectedValue === value;

    const handleClick = () => {
        if (!disabled) {
            onChange(value);
            setOpen(false);
        }
    };

    const handleMouseEnter = () => setActive(true);
    const handleMouseLeave = () => setActive(false);

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

// Add components to Listbox
Listbox.Button = ListboxButton;
Listbox.Options = ListboxOptions;
Listbox.Option = ListboxOption;

export default Listbox;
