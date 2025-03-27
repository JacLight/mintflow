'use client';
import { Fragment, useEffect, useState, ReactNode } from 'react'
import { classNames } from '@/lib-client/helpers'
import { usePathname, useRouter } from "next/navigation";
import { IconRenderer } from '../ui/icon-renderer';

// Custom Listbox components
const Listbox = ({ value, onChange, children }: { value: any, onChange: (value: any) => void, children: (props: { open: boolean }) => ReactNode }) => {
    const [open, setOpen] = useState(false);
    const [selectedValue, setSelectedValue] = useState(value);

    useEffect(() => {
        setSelectedValue(value);
    }, [value]);

    const handleSelect = (newValue: any) => {
        setSelectedValue(newValue);
        onChange(newValue);
        setOpen(false);
    };

    return (
        <div className="listbox-container">
            {children({ open })}
            <div className="listbox-context" style={{ display: 'none' }} data-open={open} data-value={JSON.stringify(selectedValue)}>
                <button
                    onClick={() => setOpen(!open)}
                    style={{ display: 'none' }}
                    aria-label="Toggle dropdown"
                    title="Toggle dropdown"
                ></button>
            </div>
        </div>
    );
};

Listbox.Label = ({ className, children }: { className?: string, children: ReactNode }) => (
    <label className={className}>{children}</label>
);

Listbox.Button = ({ className, children }: { className?: string, children: ReactNode }) => (
    <button
        className={className}
        onClick={(e) => {
            e.preventDefault();
            const container = e.currentTarget.closest('.listbox-container');
            if (container) {
                const context = container.querySelector('.listbox-context');
                if (context) {
                    const toggleButton = context.querySelector('button');
                    if (toggleButton) toggleButton.click();
                }
            }
        }}
    >
        {children}
    </button>
);

Listbox.Options = ({ className, children }: { className?: string, children: ReactNode }) => (
    <div className={className}>{children}</div>
);

Listbox.Option = ({
    className,
    value,
    children
}: {
    className: (props: { active: boolean }) => string,
    value: any,
    children: (props: { selected: boolean, active: boolean }) => ReactNode
}) => {
    const [isActive, setIsActive] = useState(false);
    const [isSelected, setIsSelected] = useState(false);

    useEffect(() => {
        // Check if this option is selected by comparing with the context
        const context = document.querySelector('.listbox-context');
        if (context) {
            try {
                const contextValue = JSON.parse(context.getAttribute('data-value') || '{}');
                setIsSelected(JSON.stringify(contextValue) === JSON.stringify(value));
            } catch (e) {
                setIsSelected(false);
            }
        }
    }, [value]);

    const handleClick = () => {
        const container = document.querySelector('.listbox-container');
        if (container) {
            const context = container.querySelector('.listbox-context');
            if (context) {
                // Find the Listbox component instance
                const listboxInstance = (container as any).__reactFiber$;
                if (listboxInstance && listboxInstance.onChange) {
                    listboxInstance.onChange(value);
                } else {
                    // Fallback: manually update the context
                    context.setAttribute('data-value', JSON.stringify(value));
                    const toggleButton = context.querySelector('button');
                    if (toggleButton) toggleButton.click();
                }
            }
        }
    };

    return (
        <div
            className={className({ active: isActive })}
            onMouseEnter={() => setIsActive(true)}
            onMouseLeave={() => setIsActive(false)}
            onClick={handleClick}
        >
            {children({ selected: isSelected, active: isActive })}
        </div>
    );
};

// Simple Transition component
const Transition = ({
    show,
    as: Component = Fragment,
    children,
    leave,
    leaveFrom,
    leaveTo
}: {
    show: boolean,
    as?: any,
    children: ReactNode,
    leave?: string,
    leaveFrom?: string,
    leaveTo?: string
}) => {
    if (!show) return null;
    return <Component>{children}</Component>;
};

const appNames = [
    { name: 'POS & Billing', href: '/business/pos', description: 'Integrated POS system with invoicing & service point', icon: '', current: false },
    { name: 'Service', href: '/business/service', description: 'Service request, check-in, modify or cancel, check status', icon: '', current: false },
    // { name: 'Customer', href: '/business/customer', description: 'Customer self-service portal, request, check-in, modify or cancel, check status', icon: '', current: false },
    // { name: 'User', href: '/business/user', description: 'Manage your user account', icon: '', current: false },
    { name: 'Account', href: '/business/account', description: 'Manage your account, purchase, asset, inventory, transaction, reconciliation, chart of account, banking', icon: '', current: false },
    { name: 'HR', href: '/business/hr', description: 'Manage your HR benefits, employee list, recruitment, appraisals, payroll, expenses, time off', icon: '', current: false },
    { name: 'Admin', href: '/business/admin', description: 'Manage your admin features & system settings', icon: '', current: false },
]

export default function BusinessAppSwitch() {
    const router = useRouter();
    const pathname = usePathname() || '';
    const currentApp = appNames.find(app => pathname.startsWith(app.href));
    const [selected, setSelected] = useState<any>(currentApp)

    const handleAppChange = (app: typeof appNames[0]) => {
        setSelected(app)
        router.push(app.href)
    }

    return (
        <Listbox value={selected} onChange={handleAppChange}>
            {({ open }) => (
                <>
                    <Listbox.Label className="sr-only">Switch Business App</Listbox.Label>
                    <div className="relative ">
                        <div className="inline-flex item divide-x divide-indigo-700 rounded-md shadow-sm">
                            <div className="inline-flex items-center gap-x-1.5 rounded-l-md bg-indigo-600 px-3 py-2 text-white shadow-sm">
                                <IconRenderer icon='Check' className="-ml-0.5 h-5 w-5" aria-hidden="true" />
                                <p className="text-sm m-0 p-0 font-semibold">{selected?.name}</p>
                            </div>
                            <Listbox.Button className="inline-flex items-center rounded-l-none rounded-r-md bg-purple-600 p-2 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 focus:ring-offset-gray-50">
                                <span className="sr-only">Change published status</span>
                                <IconRenderer icon='ChevronDown' className="h-5 w-5 text-white" aria-hidden="true" />
                            </Listbox.Button>
                        </div>

                        <Transition
                            show={open}
                            as={Fragment}
                            leave="transition ease-in duration-100"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <Listbox.Options className="absolute left-0 z-10 mt-2 w-72 origin-top-right divide-y divide-gray-200 overflow-hidden rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                {appNames.map((option) => (
                                    <Listbox.Option
                                        key={option.name}
                                        className={({ active }) =>
                                            classNames(
                                                active ? 'bg-indigo-600 text-white' : 'text-gray-900',
                                                'cursor-default select-none p-4 text-sm'
                                            )
                                        }
                                        value={option}
                                    >
                                        {({ selected, active }) => (
                                            <div className="flex flex-col">
                                                <div className="flex justify-between">
                                                    <p className={classNames(selected ? 'font-semibold' : 'font-normal', 'p-0 m-0')}>{option.name}</p>
                                                    {selected ? (
                                                        <span className={active ? 'text-white' : 'text-indigo-600'}>
                                                            <IconRenderer icon='Check' className="h-5 w-5" aria-hidden="true" />
                                                        </span>
                                                    ) : null}
                                                </div>
                                                <p className={classNames(active ? 'text-indigo-200' : 'text-gray-500', 'mt-2 mb-0 p-0')}>
                                                    {option.description}
                                                </p>
                                            </div>
                                        )}
                                    </Listbox.Option>
                                ))}
                            </Listbox.Options>
                        </Transition>
                    </div>
                </>
            )}
        </Listbox>
    )
}
