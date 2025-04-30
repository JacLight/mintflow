'use client';
import {
  Fragment,
  useEffect,
  useState,
  ReactNode,
  useRef,
  useLayoutEffect
} from 'react';
import { classNames } from '@/lib-client/helpers';
import { IconRenderer } from '../ui/icon-renderer';
import { createPortal } from 'react-dom';

// Global state to track which dropdown is currently open
let activeDropdownId: string | null = null;

export const Listbox = ({
  value,
  onChange,
  children,
  id = 'default'
}: {
  value: any;
  onChange: (value: any) => void;
  children: (props: { open: boolean }) => ReactNode;
  id?: string;
}) => {
  const [open, setOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value);
  const dropdownId = id;

  useEffect(() => {
    setSelectedValue(value);
  }, [value]);

  // Close this dropdown if another one opens
  useEffect(() => {
    if (open) {
      activeDropdownId = dropdownId;
    } else if (activeDropdownId === dropdownId) {
      activeDropdownId = null;
    }

    // Event listener for when another dropdown opens
    const handleDropdownChange = (event: CustomEvent) => {
      if (event.detail.id !== dropdownId && open) {
        setOpen(false);
      }
    };

    window.addEventListener('dropdown-opened' as any, handleDropdownChange);
    return () => {
      window.removeEventListener(
        'dropdown-opened' as any,
        handleDropdownChange
      );
    };
  }, [open, dropdownId]);

  const handleSelect = (newValue: any) => {
    setSelectedValue(newValue);
    onChange(newValue);
    setOpen(false);
  };

  const toggleOpen = () => {
    const newOpenState = !open;
    setOpen(newOpenState);

    if (newOpenState) {
      // Notify other dropdowns that this one is open
      const event = new CustomEvent('dropdown-opened', {
        detail: { id: dropdownId }
      });
      window.dispatchEvent(event);
    }
  };

  return (
    <div className="listbox-container w-full" data-dropdown-id={dropdownId}>
      {children({ open })}
      <div
        className="listbox-context"
        style={{ display: 'none' }}
        data-open={open}
        data-value={JSON.stringify(selectedValue)}
      >
        <button
          onClick={toggleOpen}
          style={{ display: 'none' }}
          aria-label="Toggle dropdown"
          title="Toggle dropdown"
          data-testid="listbox-toggle"
        ></button>
      </div>
    </div>
  );
};

Listbox.Label = ({
  className,
  children
}: {
  className?: string;
  children: ReactNode;
}) => <label className={className}>{children}</label>;

Listbox.Button = ({
  className,
  children
}: {
  className?: string;
  children: ReactNode;
}) => (
  <button
    className={className}
    onClick={(e) => {
      e.preventDefault();
      const container = e.currentTarget.closest('.listbox-container');
      if (container) {
        const context = container.querySelector('.listbox-context');
        if (context) {
          const toggleButton = context.querySelector(
            'button[data-testid="listbox-toggle"]'
          ) as HTMLButtonElement;
          if (toggleButton) toggleButton.click();
        }
      }
    }}
  >
    {children}
  </button>
);

Listbox.Options = ({
  className,
  children
}: {
  className?: string;
  children: ReactNode;
}) => <div className={className}>{children}</div>;

Listbox.Option = ({
  className,
  value,
  children
}: {
  className: (props: { active: boolean }) => string;
  value: any;
  children: (props: { selected: boolean; active: boolean }) => ReactNode;
}) => {
  const [isActive, setIsActive] = useState(false);
  const [isSelected, setIsSelected] = useState(false);

  // Reference to the option element
  const optionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if this option is selected by comparing with the context
    if (!optionRef.current) return;

    const container = optionRef.current.closest('.listbox-container');
    if (container) {
      const context = container.querySelector('.listbox-context');
      if (context) {
        try {
          const contextValue = JSON.parse(
            context.getAttribute('data-value') || '{}'
          );
          setIsSelected(JSON.stringify(contextValue) === JSON.stringify(value));
        } catch (e) {
          setIsSelected(false);
        }
      }
    }
  }, [value]);

  const handleClick = () => {
    if (!optionRef.current) return;

    const container = optionRef.current.closest('.listbox-container');
    if (container) {
      const context = container.querySelector('.listbox-context');
      if (context) {
        try {
          // Get the current open state
          const isOpen = context.getAttribute('data-open') === 'true';

          // Update the data-value attribute
          context.setAttribute('data-value', JSON.stringify(value));

          // Find the toggle button and click it to close the dropdown
          const toggleButton = context.querySelector(
            'button[data-testid="listbox-toggle"]'
          ) as HTMLButtonElement;

          // Find the closest parent that has the onChange handler
          const parentElement = container.closest('.relative');
          if (parentElement) {
            const dropdownComponent = parentElement.closest(
              '[data-modern-dropdown]'
            );
            if (dropdownComponent && (dropdownComponent as any).__onChange) {
              (dropdownComponent as any).__onChange(value);
            }
          }

          // Close the dropdown
          if (isOpen && toggleButton) {
            toggleButton.click();
          }
        } catch (e) {
          console.error('Error in Listbox.Option handleClick:', e);
        }
      }
    }
  };

  return (
    <div
      ref={optionRef}
      className={className({ active: isActive })}
      onMouseEnter={() => setIsActive(true)}
      onMouseLeave={() => setIsActive(false)}
      onClick={handleClick}
      role="option"
      aria-selected={isSelected}
    >
      {children({ selected: isSelected, active: isActive })}
    </div>
  );
};

// Component to render dropdown content in a portal to avoid clipping
const DropdownPortal = ({
  children,
  triggerRef,
  isOpen,
  width = 'auto'
}: {
  children: ReactNode;
  triggerRef: React.RefObject<HTMLElement>;
  isOpen: boolean;
  width?: string | number;
}) => {
  const [portalElement, setPortalElement] = useState<HTMLElement | null>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const contentRef = useRef<HTMLDivElement>(null);

  // Create portal element on mount
  useEffect(() => {
    const el = document.createElement('div');
    el.className = 'dropdown-portal-container';
    document.body.appendChild(el);
    setPortalElement(el);

    return () => {
      document.body.removeChild(el);
    };
  }, []);

  // Update position when trigger element changes or window resizes
  useLayoutEffect(() => {
    if (!triggerRef.current || !isOpen || !contentRef.current) return;

    const updatePosition = () => {
      if (!triggerRef.current || !contentRef.current) return;

      const triggerRect = triggerRef.current.getBoundingClientRect();
      const contentRect = contentRef.current.getBoundingClientRect();

      // Calculate initial position (below the trigger)
      let top = triggerRect.bottom + window.scrollY;
      let left = triggerRect.left + window.scrollX;

      // Check if dropdown would go off the bottom of the viewport
      if (top + contentRect.height > window.innerHeight + window.scrollY) {
        // Position above the trigger if it would go off the bottom
        top = triggerRect.top - contentRect.height + window.scrollY;
      }

      // Check if dropdown would go off the right of the viewport
      if (left + contentRect.width > window.innerWidth) {
        // Align to the right edge of the trigger
        left = triggerRect.right - contentRect.width + window.scrollX;
      }

      // Ensure dropdown doesn't go off the left of the viewport
      if (left < 0) {
        left = 0;
      }

      setPosition({ top, left });
    };

    // Update position initially and on resize
    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [triggerRef, isOpen]);

  if (!portalElement || !isOpen) return null;

  return createPortal(
    <div
      ref={contentRef}
      className="dropdown-portal-content z-50"
      style={{
        position: 'absolute',
        top: `${position.top}px`,
        left: `${position.left}px`,
        width: width
      }}
    >
      {children}
    </div>,
    portalElement
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
  show: boolean;
  as?: any;
  children: ReactNode;
  leave?: string;
  leaveFrom?: string;
  leaveTo?: string;
}) => {
  if (!show) return null;
  return <Component>{children}</Component>;
};

export default function ModernDropdown(props: {
  options;
  onChange;
  value;
  id?: string;
  usePortal?: boolean;
  className?: string;
}) {
  const { options } = props;
  // Default to using portal to prevent clipping in small containers
  const usePortal = props.usePortal !== undefined ? props.usePortal : true;
  const [selected, setSelected] = useState<any>('');
  const [open, setOpen] = useState(false);
  const dropdownTriggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Update selected when props.value changes
    if (props.value && props.value !== selected?.name) {
      const defaultSelected =
        options.find((option) => option.name === props.value) || null;
      setSelected(defaultSelected);
    }
  }, [props.value]);

  const handleAppChange = (app: (typeof options)[0]) => {
    setSelected(app);
    if (props.onChange) {
      props.onChange(app);
    }
    setOpen(false);
  };

  // Handle outside clicks to close the dropdown
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      // Find the specific dropdown container with the matching ID
      const containers = document.querySelectorAll('.listbox-container');
      let shouldClose = true;

      containers.forEach((container) => {
        if (container.contains(target)) {
          shouldClose = false;
        }
      });

      if (shouldClose && open) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [open]);

  return (
    <Listbox
      value={selected}
      onChange={handleAppChange}
      id={props.id || `dropdown-${Math.random().toString(36).substring(2, 9)}`}
    >
      {({ open: listboxOpen }) => {
        // Sync the open state between Listbox and ModernDropdown
        useEffect(() => {
          setOpen(listboxOpen);
        }, [listboxOpen]);

        return (
          <>
            <Listbox.Label className="sr-only">
              Switch Business App
            </Listbox.Label>
            <div
              className="relative"
              data-modern-dropdown
              ref={(el) => {
                if (el) {
                  (el as any).__onChange = handleAppChange;
                }
              }}
            >
              <div className={classNames("inline-flex item divide-x divide-indigo-700 rounded-md shadow-sm", props.className)}>
                <div className="inline-flex items-center gap-x-1.5 rounded-l-md bg-indigo-600 px-3 grow py-2 text-white shadow-sm">
                  <IconRenderer
                    icon="Check"
                    className="-ml-0.5 h-5 w-5"
                    aria-hidden="true"
                  />
                  <p className="text-sm m-0 p-0 font-semibold">
                    {selected?.name}
                  </p>
                </div>
                <Listbox.Button className="inline-flex items-center rounded-l-none rounded-r-md bg-purple-600 p-2 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 focus:ring-offset-gray-50">
                  <span className="sr-only">Change published status</span>
                  <IconRenderer
                    icon="ChevronDown"
                    className="h-5 w-5 text-white"
                    aria-hidden="true"
                  />
                </Listbox.Button>
              </div>

              <div ref={dropdownTriggerRef}>
                {usePortal ? (
                  <DropdownPortal
                    triggerRef={dropdownTriggerRef}
                    isOpen={open}
                    width="288px" // 72 * 4 = 288px (w-72)
                  >
                    <div className="origin-top-right divide-y divide-gray-200 overflow-hidden rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      {options.map((option) => (
                        <Listbox.Option
                          key={option.name}
                          className={({ active }) =>
                            classNames(
                              active
                                ? 'bg-indigo-600 text-white'
                                : 'text-gray-900',
                              'cursor-default select-none p-4 text-sm'
                            )
                          }
                          value={option}
                        >
                          {({ selected, active }) => (
                            <div className="flex flex-col">
                              <div className="flex justify-between">
                                <p
                                  className={classNames(
                                    selected ? 'font-semibold' : 'font-normal',
                                    'p-0 m-0'
                                  )}
                                >
                                  {option.name}
                                </p>
                                {selected ? (
                                  <span
                                    className={
                                      active ? 'text-white' : 'text-indigo-600'
                                    }
                                  >
                                    <IconRenderer
                                      icon="Check"
                                      className="h-5 w-5"
                                      aria-hidden="true"
                                    />
                                  </span>
                                ) : null}
                              </div>
                              <p
                                className={classNames(
                                  active ? 'text-indigo-200' : 'text-gray-500',
                                  'mt-2 mb-0 p-0'
                                )}
                              >
                                {option.description}
                              </p>
                            </div>
                          )}
                        </Listbox.Option>
                      ))}
                    </div>
                  </DropdownPortal>
                ) : (
                  <Transition
                    show={open}
                    as={Fragment}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <Listbox.Options className="absolute left-0 z-50 mt-2 w-72 origin-top-right divide-y divide-gray-200 overflow-hidden rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      {options.map((option) => (
                        <Listbox.Option
                          key={option.name}
                          className={({ active }) =>
                            classNames(
                              active
                                ? 'bg-indigo-600 text-white'
                                : 'text-gray-900',
                              'cursor-default select-none p-4 text-sm'
                            )
                          }
                          value={option}
                        >
                          {({ selected, active }) => (
                            <div className="flex flex-col">
                              <div className="flex justify-between">
                                <p
                                  className={classNames(
                                    selected ? 'font-semibold' : 'font-normal',
                                    'p-0 m-0'
                                  )}
                                >
                                  {option.name}
                                </p>
                                {selected ? (
                                  <span
                                    className={
                                      active ? 'text-white' : 'text-indigo-600'
                                    }
                                  >
                                    <IconRenderer
                                      icon="Check"
                                      className="h-5 w-5"
                                      aria-hidden="true"
                                    />
                                  </span>
                                ) : null}
                              </div>
                              <p
                                className={classNames(
                                  active ? 'text-indigo-200' : 'text-gray-500',
                                  'mt-2 mb-0 p-0'
                                )}
                              >
                                {option.description}
                              </p>
                            </div>
                          )}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </Transition>
                )}
              </div>
            </div>
          </>
        );
      }}
    </Listbox>
  );
}
