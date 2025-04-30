'use client';
import {
  Fragment,
  useEffect,
  useState,
  ReactNode,
  useRef,
  useLayoutEffect,
  createContext,
  useContext
} from 'react';
import { classNames } from '@/lib-client/helpers';
import { IconRenderer } from '../ui/icon-renderer';
import { createPortal } from 'react-dom';

// Create a context to manage dropdown state
interface DropdownContextType {
  activeDropdownId: string | null;
  setActiveDropdownId: (id: string | null) => void;
}

const DropdownContext = createContext<DropdownContextType>({
  activeDropdownId: null,
  setActiveDropdownId: () => {}
});

// Provider component to wrap around areas using dropdowns
export const DropdownProvider = ({ children }: { children: ReactNode }) => {
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  
  return (
    <DropdownContext.Provider value={{ activeDropdownId, setActiveDropdownId }}>
      {children}
    </DropdownContext.Provider>
  );
};

// Hook to access dropdown context
const useDropdown = () => useContext(DropdownContext);

// Context for Listbox components to communicate
interface ListboxContextType {
  open: boolean;
  selectedValue: any;
  toggleOpen: () => void;
  handleSelect: (value: any) => void;
}

const ListboxContext = createContext<ListboxContextType>({
  open: false,
  selectedValue: null,
  toggleOpen: () => {},
  handleSelect: () => {}
});

const useListbox = () => useContext(ListboxContext);

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
  const { activeDropdownId, setActiveDropdownId } = useDropdown();
  const dropdownId = id;

  useEffect(() => {
    setSelectedValue(value);
  }, [value]);

  // Close this dropdown if another one opens
  useEffect(() => {
    if (open) {
      setActiveDropdownId(dropdownId);
    } else if (activeDropdownId === dropdownId) {
      setActiveDropdownId(null);
    }
  }, [open, dropdownId, activeDropdownId, setActiveDropdownId]);

  // Close this dropdown if another one becomes active
  useEffect(() => {
    if (activeDropdownId !== null && activeDropdownId !== dropdownId && open) {
      setOpen(false);
    }
  }, [activeDropdownId, dropdownId, open]);

  const handleSelect = (newValue: any) => {
    setSelectedValue(newValue);
    onChange(newValue);
    setOpen(false);
  };

  const toggleOpen = () => {
    const newOpenState = !open;
    setOpen(newOpenState);

    if (newOpenState) {
      setActiveDropdownId(dropdownId);
    }
  };

  // Create a context object to pass down to children
  const contextValue = {
    open,
    selectedValue,
    toggleOpen,
    handleSelect
  };

  return (
    <ListboxContext.Provider value={contextValue}>
      <div className="listbox-container w-full" data-dropdown-id={dropdownId}>
        {children({ open })}
      </div>
    </ListboxContext.Provider>
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
}) => {
  const { toggleOpen } = useListbox();
  
  return (
    <button
      className={className}
      onClick={(e) => {
        e.preventDefault();
        toggleOpen();
      }}
    >
      {children}
    </button>
  );
};

Listbox.Options = ({
  className,
  children,
  style
}: {
  className?: string;
  children: ReactNode;
  style?: React.CSSProperties;
}) => <div className={className} style={style}>{children}</div>;

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
  const { selectedValue, handleSelect } = useListbox();
  
  // Determine if this option is selected by comparing with the context value
  const isSelected = JSON.stringify(selectedValue) === JSON.stringify(value);

  return (
    <div
      className={className({ active: isActive })}
      onMouseEnter={() => setIsActive(true)}
      onMouseLeave={() => setIsActive(false)}
      onMouseDown={() => handleSelect(value)}
      onClick={() => handleSelect(value)}
      role="option"
      aria-selected={isSelected}
    >
      {children({ selected: isSelected, active: isActive })}
    </div>
  );
};

// Component to render dropdown content in a portal to avoid clipping
interface DropdownPortalProps {
  children: ReactNode;
  triggerRef: React.RefObject<HTMLElement>;
  isOpen: boolean;
  width?: string | number;
  portalContainer?: HTMLElement | null;
  getPosition?: (triggerRect: DOMRect, contentRect: DOMRect) => { top: number; left: number };
}

const DropdownPortal = ({
  children,
  triggerRef,
  isOpen,
  width = 'auto',
  portalContainer = null,
  getPosition
}: DropdownPortalProps) => {
  const [portalElement, setPortalElement] = useState<HTMLElement | null>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const contentRef = useRef<HTMLDivElement>(null);

  // Create portal element on mount if not provided
  useEffect(() => {
    if (portalContainer) {
      setPortalElement(portalContainer);
      return;
    }
    
    const el = document.createElement('div');
    el.className = 'dropdown-portal-container';
    document.body.appendChild(el);
    setPortalElement(el);

    return () => {
      if (!portalContainer && el.parentNode) {
        document.body.removeChild(el);
      }
    };
  }, [portalContainer]);

  // Update position when trigger element changes
  useLayoutEffect(() => {
    if (!triggerRef.current || !isOpen || !contentRef.current) return;

    const updatePosition = () => {
      if (!triggerRef.current || !contentRef.current) return;

      const triggerRect = triggerRef.current.getBoundingClientRect();
      const contentRect = contentRef.current.getBoundingClientRect();

      if (getPosition) {
        // Use custom position calculation if provided
        setPosition(getPosition(triggerRect, contentRect));
      } else {
        // Default positioning logic
        // Calculate initial position (below the trigger)
        let top = triggerRect.bottom;
        let left = triggerRect.left;

        // Check if dropdown would go off the bottom of the viewport
        if (top + contentRect.height > window.innerHeight) {
          // Position above the trigger if it would go off the bottom
          top = triggerRect.top - contentRect.height;
        }

        // Check if dropdown would go off the right of the viewport
        if (left + contentRect.width > window.innerWidth) {
          // Align to the right edge of the trigger
          left = triggerRect.right - contentRect.width;
        }

        // Ensure dropdown doesn't go off the left of the viewport
        if (left < 0) {
          left = 0;
        }

        setPosition({ 
          top: top + window.scrollY, 
          left: left + window.scrollX 
        });
      }
    };

    // Update position initially
    updatePosition();
    
    // Add resize and scroll listeners
    const handleResize = () => updatePosition();
    const handleScroll = () => updatePosition();
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [triggerRef, isOpen, getPosition]);

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

interface ModernDropdownProps {
  options: Array<{ name: string; description: string; [key: string]: any }>;
  onChange: (option: any) => void;
  value: string | { name: string; [key: string]: any } | null;
  id?: string;
  usePortal?: boolean;
  className?: string;
  portalContainer?: HTMLElement | null;
  getPortalPosition?: (triggerRect: DOMRect, contentRect: DOMRect) => { top: number; left: number };
}

export default function ModernDropdown(props: ModernDropdownProps) {
  const { 
    options, 
    id = `dropdown-${props.id || Math.random().toString(36).substr(2, 9)}`,
    usePortal = true,
    portalContainer = null,
    getPortalPosition,
  } = props;
  
  const [selected, setSelected] = useState<any>(null);
  const dropdownTriggerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Find the selected option based on props.value
  useEffect(() => {
    if (props.value) {
      let defaultSelected;
      if (typeof props.value === 'string') {
        defaultSelected = options.find((option) => option.name === props.value) || null;
      } else {
        defaultSelected = props.value;
      }
      setSelected(defaultSelected);
    }
  }, [props.value, options]);

  const handleAppChange = (app: (typeof options)[0]) => {
    setSelected(app);
    if (props.onChange) {
      props.onChange(app);
    }
  };

  // Create a click outside handler using refs
  const useClickOutside = (ref: React.RefObject<HTMLElement>, handler: () => void) => {
    useEffect(() => {
      const listener = (event: MouseEvent | TouchEvent) => {
        if (!ref.current || ref.current.contains(event.target as Node)) {
          return;
        }
        handler();
      };
      
      document.addEventListener('mousedown', listener);
      document.addEventListener('touchstart', listener);
      
      return () => {
        document.removeEventListener('mousedown', listener);
        document.removeEventListener('touchstart', listener);
      };
    }, [ref, handler]);
  };

  const dropContent = (
    <Listbox.Options 
      className="absolute left-0 z-50 mt-2 w-80 max-h-96 origin-top-right divide-y divide-gray-200 overflow-y-auto rounded-md bg-white shadow-lg ring-1 ring-gray-200 ring-opacity-5 focus:outline-none"
    >
      {options.map((option) => (
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
                <p
                  className={classNames(
                    selected ? 'font-semibold' : 'font-normal',
                    'p-0 m-0'
                  )}
                >
                  {option.name}
                </p>
                {selected ? (
                  <span className={active ? 'text-white' : 'text-indigo-600'}>
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
  );

  return (
    <DropdownProvider>
      <Listbox
        value={selected}
        onChange={handleAppChange}
        id={id}
      >
        {({ open }) => {
          // Use the click outside hook to close dropdown when clicking outside
          useClickOutside(dropdownRef, () => {
            // This will be handled by the Listbox component's context
          });

          return (
            <div ref={dropdownRef}>
              <Listbox.Label className="sr-only">
                Switch Business App
              </Listbox.Label>
              <div className="relative">
                <div
                  className={classNames(
                    'inline-flex item divide-x divide-indigo-700 rounded-md shadow-sm',
                    props.className
                  )}
                >
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
                      width="335px"
                      portalContainer={portalContainer}
                      getPosition={getPortalPosition}
                    >
                      {dropContent}
                    </DropdownPortal>
                  ) : (
                    <Transition
                      show={open}
                      as={Fragment}
                      leave="transition ease-in duration-100"
                      leaveFrom="opacity-100"
                      leaveTo="opacity-0"
                    >
                      {dropContent}
                    </Transition>
                  )}
                </div>
              </div>
            </div>
          );
        }}
      </Listbox>
    </DropdownProvider>
  );
}
