'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { minimizedWindowsManager } from './minimized-windows';
import { IconRenderer } from '@/components/ui/icon-renderer';

const calculatePosition = (position, size) => {
    const { x, y } = position;

    if (x === 'center') {
        return { x: (window.innerWidth - size.width) / 2, y };
    }
    if (y === 'center') {
        return { x, y: (window.innerHeight - size.height) / 2 };
    }
    if (x === 'right') {
        return { x: window.innerWidth - size.width, y };
    }
    if (y === 'bottom') {
        return { x, y: window.innerHeight - size.height };
    }
    if (x === 'left') {
        return { x: 0, y };
    }
    if (y === 'top') {
        return { x, y: 0 };
    }
    return { x, y };
}

const ViewManager = ({
    id,
    children,
    title = '',
    defaultPosition = { x: 'center', y: 'center' },
    defaultSize = { width: 800, height: 600 },
    onClose = () => { },
    isResizable = true,
    style = {},
    compact = false,
    dockWidth = 500,
    isModal = false,
    canDock = true,
    docked = false,
    closeOnOutsideClick = false,
    usePortal = false
}) => {
    // No need for external store references

    const [position, setPosition] = useState(getStoredValue('position', defaultPosition));
    const [size, setSize] = useState(getStoredValue('size', defaultSize));
    const [windowState, setWindowState] = useState(getStoredValue('windowState', docked ? 'docked' : 'normal'));
    const [stateHistory, setStateHistory] = useState({
        normal: { position: calculatePosition(defaultPosition, defaultSize), size: defaultSize }
    });
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const boxRef: any = useRef(null);
    const dragRef: any = useRef(null);
    const resizeRef: any = useRef(null);
    const menuRef: any = useRef(null);
    const portalContainerRef = useRef<HTMLDivElement | null>(null);

    // Create portal container if it doesn't exist
    useEffect(() => {
        if (usePortal && typeof document !== 'undefined') {
            // Check if portal container already exists
            let container = document.getElementById('view-manager-portal-container');
            
            if (!container) {
                // Create portal container if it doesn't exist
                container = document.createElement('div');
                container.id = 'view-manager-portal-container';
                container.style.position = 'fixed';
                container.style.top = '0';
                container.style.left = '0';
                container.style.width = '100%';
                container.style.height = '100%';
                // The container itself should be transparent to pointer events
                container.style.pointerEvents = 'none';
                container.style.zIndex = '1000';
                document.body.appendChild(container);
            }
            
            portalContainerRef.current = container as HTMLDivElement;
            
            return () => {
                // Only remove the container if this is the last portal using it
                if (container && container.childElementCount <= 1) {
                    document.body.removeChild(container);
                }
            };
        }
    }, [usePortal]);

    // Handle outside clicks for modal and menu
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Handle menu close
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
            // Handle modal close
            if (isModal && closeOnOutsideClick && boxRef.current && !boxRef.current.contains(event.target)) {
                onClose?.();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isModal, closeOnOutsideClick, onClose]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isModal) {
            document.body.style.overflow = 'hidden';
            return () => {
                document.body.style.overflow = 'unset';
            };
        }
    }, [isModal]);

    function getStoredValue(key, defaultValue) {
        if (!id) return defaultValue;
        const stored = localStorage.getItem(`float-box-${id}-${key}`);
        return stored ? JSON.parse(stored) : defaultValue;
    }

    // Save state to localStorage
    useEffect(() => {
        if (id) {
            // Save position and size only when in normal state
            if (windowState === 'normal') {
                localStorage.setItem(`float-box-${id}-position`, JSON.stringify(position));
                localStorage.setItem(`float-box-${id}-size`, JSON.stringify(size));
            }

            // Save window state for normal and docked states, but not for minimized
            if (windowState !== 'minimized') {
                localStorage.setItem(`float-box-${id}-windowState`, JSON.stringify(windowState));
            }
        }
    }, [id, position, size, windowState]);

    const constrainToViewport = (pos, boxSize) => {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const titleBarHeight = 40;

        return {
            x: Math.min(Math.max(0, pos.x), viewportWidth - boxSize.width),
            y: Math.min(Math.max(0, pos.y), viewportHeight - titleBarHeight)
        };
    };

    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            if (windowState === 'normal') {
                setPosition(prev => constrainToViewport(prev, size));
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [size, windowState]);

    // Dragging and resizing logic
    useEffect(() => {
        const handleMouseMove = (e) => {
            if (isDragging && windowState === 'normal') {
                const newPosition = {
                    x: e.clientX - dragOffset.x,
                    y: e.clientY - dragOffset.y
                };
                setPosition(constrainToViewport(newPosition, size));

                // Prevent default to avoid text selection during drag
                e.preventDefault();
            }

            if (isResizing && windowState === 'normal') {
                const box = boxRef.current.getBoundingClientRect();
                const newWidth = Math.max(200, Math.min(window.innerWidth, e.clientX - box.left));
                const newHeight = Math.max(100, Math.min(window.innerHeight, e.clientY - box.top));
                setSize({ width: newWidth, height: newHeight });
                setPosition(prev => constrainToViewport(prev, { width: newWidth, height: newHeight }));

                // Prevent default to avoid text selection during resize
                e.preventDefault();
            }
        };

        const handleMouseUp = () => {
            if (isDragging || isResizing) {
                setStateHistory(prev => ({
                    ...prev,
                    normal: { position, size }
                }));
            }

            // Remove overlay if it exists
            const overlay = document.getElementById('view-manager-drag-overlay');
            if (overlay) {
                document.body.removeChild(overlay);
            }

            setIsDragging(false);
            setIsResizing(false);

            // Re-enable pointer events on iframes
            const iframes = document.querySelectorAll('iframe');
            iframes.forEach(iframe => {
                iframe.style.pointerEvents = 'auto';
            });
        };

        if (isDragging || isResizing) {
            // Create a full-screen overlay to capture all mouse events
            if (!document.getElementById('view-manager-drag-overlay')) {
                const overlay = document.createElement('div');
                overlay.id = 'view-manager-drag-overlay';
                overlay.style.position = 'fixed';
                overlay.style.top = '0';
                overlay.style.left = '0';
                overlay.style.width = '100%';
                overlay.style.height = '100%';
                overlay.style.zIndex = '9999';
                overlay.style.cursor = isDragging ? 'move' : 'se-resize';
                // Make it transparent to mouse events but still capture them
                overlay.style.backgroundColor = 'transparent';
                document.body.appendChild(overlay);
            }

            // Disable pointer events on iframes to prevent them from capturing mouse events
            const iframes = document.querySelectorAll('iframe');
            iframes.forEach(iframe => {
                iframe.style.pointerEvents = 'none';
            });

            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);

            // Clean up overlay if component unmounts during drag/resize
            const overlay = document.getElementById('view-manager-drag-overlay');
            if (overlay) {
                document.body.removeChild(overlay);
            }

            // Re-enable pointer events on iframes if component unmounts during drag/resize
            const iframes = document.querySelectorAll('iframe');
            iframes.forEach(iframe => {
                iframe.style.pointerEvents = 'auto';
            });
        };
    }, [isDragging, isResizing, dragOffset, windowState, position, size]);

    const handleMouseDown = (e) => {
        if ((e.target === dragRef.current || e.target.parentElement === dragRef.current) &&
            windowState === 'normal' && !isModal) {
            // Prevent default to avoid text selection and other browser behaviors
            e.preventDefault();
            // Stop propagation to prevent other elements from capturing the event
            e.stopPropagation();

            setIsDragging(true);
            const box = boxRef.current.getBoundingClientRect();
            setDragOffset({
                x: e.clientX - box.left,
                y: e.clientY - box.top
            });
        }
    };

    const handleResizeMouseDown = (e) => {
        if (isResizable && windowState === 'normal' && !isModal) {
            // Prevent default to avoid text selection and other browser behaviors
            e.preventDefault();
            // Stop propagation to prevent other elements from capturing the event
            e.stopPropagation();

            setIsResizing(true);
        }
    };

    const saveCurrentState = () => {
        setStateHistory(prev => ({
            ...prev,
            [windowState]: { position, size }
        }));
    };

    const restoreToNormal = () => {
        const normalState = stateHistory.normal;
        setPosition(normalState.position);
        setSize(normalState.size);

        // If we're restoring from a minimized state, we need to restore to the previously saved state
        // or default to 'normal' if no previous state was saved
        if (windowState === 'minimized') {
            const savedState = getStoredValue('windowState', 'normal');
            // Only restore to 'normal' or 'docked' states, not 'maximized' or 'minimized'
            setWindowState(savedState === 'normal' || savedState === 'docked' ? savedState : 'normal');

            // Remove from minimized windows manager
            if (id) {
                minimizedWindowsManager.removeWindow(id);
            }
        } else {
            setWindowState('normal');
        }

        setIsMenuOpen(false);
    };

    const toggleMinimize = () => {
        if (windowState !== 'minimized') {
            saveCurrentState();
            setWindowState('minimized');

            // Add this window to minimized windows manager
            if (id) {
                minimizedWindowsManager.addWindow({
                    id,
                    title,
                    content: null, // We don't need content in the minimized state
                    onRestore: restoreToNormal,
                    onClose
                });
            }
        } else {
            restoreToNormal();
        }
        setIsMenuOpen(false);
    };

    const toggleMaximize = () => {
        if (windowState !== 'maximized') {
            saveCurrentState();
            setWindowState('maximized');
        } else {
            // When un-maximizing, restore to the previously saved state (normal or docked)
            const savedState = getStoredValue('windowState', 'normal');
            const normalState = stateHistory.normal;

            setPosition(normalState.position);
            setSize(normalState.size);

            // Only restore to 'normal' or 'docked' states
            setWindowState(savedState === 'normal' || savedState === 'docked' ? savedState : 'normal');
        }
        setIsMenuOpen(false);
    };

    const toggleDock = () => {
        if (windowState !== 'docked') {
            saveCurrentState();
            setWindowState('docked');
        } else {
            // When un-docking, restore to normal state
            const normalState = stateHistory.normal;
            setPosition(normalState.position);
            setSize(normalState.size);
            setWindowState('normal');
        }
        setIsMenuOpen(false);
    };

    const resetSize = () => {
        const newSize = defaultSize;
        setSize(newSize);
        setPosition(constrainToViewport(position, newSize));
        setStateHistory(prev => ({
            ...prev,
            normal: { position, size: newSize }
        }));
        setIsMenuOpen(false);
    };

    const getBoxStyle = (): any => {
        if (isModal) {
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            return {
                position: 'fixed',
                top: `${(viewportHeight - size.height) / 2}px`,
                left: `${(viewportWidth - size.width) / 2}px`,
                width: `${size.width}px`,
                height: `${size.height}px`,
                zIndex: 1100
            };
        }

        switch (windowState) {
            case 'minimized':
                return {
                    position: 'absolute',
                    top: '0px',
                    left: position.x,
                    width: '300px',
                    height: '30px',
                    zIndex: 1000
                };
            case 'maximized':
                return {
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: 1000
                };
            case 'docked':
                const removeHeight = 75;
                return {
                    position: 'absolute',
                    top: '0',
                    right: 0,
                    width: dockWidth + 'px',
                    height: `calc(100% - ${removeHeight}px)`,
                    zIndex: 1000
                };
            default:
                return {
                    position: 'fixed',
                    top: position.y,
                    left: position.x,
                    width: `${size.width}px`,
                    height: `${size.height}px`,
                    zIndex: 1000
                };
        }
    };

    const MenuControls = () => (
        <div className="flex items-center space-x-1 bg-white/10 ">
            {!isModal && (
                <>
                    <button
                        onClick={toggleMinimize}
                        className="p-1 hover:bg-gray-200 rounded "
                        title={windowState === 'minimized' ? 'Restore' : 'Minimize'}
                    >
                        {windowState === 'minimized' ? <IconRenderer icon="ChevronUp" size={16} /> : <IconRenderer icon="ChevronDown" size={16} />}
                    </button>
                    <button
                        onClick={toggleMaximize}
                        className="p-1 hover:bg-gray-200 rounded"
                        title={windowState === 'maximized' ? 'Restore' : 'Maximize'}
                    >
                        {windowState === 'maximized' ? <IconRenderer icon="Minimize" size={16} /> : <IconRenderer icon="Maximize" size={16} />}
                    </button>
                    <button
                        onClick={toggleDock}
                        className="p-1 hover:bg-gray-200 rounded "
                        title={windowState === 'docked' ? 'Restore' : 'Dock'}
                    >
                        {windowState === 'docked' ? <IconRenderer icon="PanelLeftOpen" size={16} /> : <IconRenderer icon="PanelRightOpen" size={16} />}
                    </button>
                    {windowState === 'normal' && (
                        <button
                            onClick={resetSize}
                            className="p-1 hover:bg-gray-200 rounded"
                            title="Reset Size"
                        >
                            <IconRenderer icon="RotateCcw" size={16} />
                        </button>
                    )}
                </>
            )}
            {(isModal || onClose) && (
                <button
                    onClick={onClose}
                    className="p-1 hover:bg-gray-200 rounded"
                >
                    <IconRenderer icon="X" size={16} />
                </button>
            )}
        </div>
    );

    const CompactMenu = () => (
        <div ref={menuRef} className="absolute top-2 right-2 z-50">
            <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-1 hover:bg-gray-200 rounded-full  shadow-sm"
            >
                <IconRenderer icon="ArrowUpDown" size={16} />
            </button>

            {isMenuOpen && (
                <div className="absolute top-full right-0 mt-1 bg-white/80 rounded-lg shadow-lg overflow-hidden border-t-2 border-t-purple-600">
                    {title && (
                        <div className="px-4 py-1 border-b border-gray-300 font-semibold">
                            {title}
                        </div>
                    )}
                    <div className="px-2 py-1">
                        <MenuControls />
                    </div>
                </div>
            )}
        </div>
    );

    // Don't render the component when it's minimized (it will be rendered in the MinimizedContainer)
    if (windowState === 'minimized') {
        return null;
    }

    // Create the component content
    const content = (
        <div style={{ pointerEvents: usePortal ? 'auto' : 'inherit' }}>
            {isModal && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50"
                    style={{ zIndex: 1050 }}
                />
            )}
            <div
                ref={boxRef}
                style={getBoxStyle()}
                className={` rounded-lg bg-white/95 shadow-lg flex flex-col overflow-hidden ${isModal ? 'shadow-xl' : ''
                    }`}
            >
                {compact && !isModal ? (
                    <>
                        <div
                            ref={dragRef}
                            onMouseDown={handleMouseDown}
                            className="h-8 cursor-move"
                        />
                        <CompactMenu />
                    </>
                ) : (
                    <div
                        ref={dragRef}
                        onMouseDown={handleMouseDown}
                        className={`bg-white/10 flex items-center border-t-2 border-t-purple-600 justify-between ${isModal ? '' : 'cursor-move'
                            } select-none`}
                    >
                        <span className="text-sm pl-2 truncate">{title}</span>
                        <MenuControls />
                    </div>
                )}

                {/* Content area */}
                <div className={`flex-1 overflow-auto relative ${compact ? 'pt-2' : ''}`}>
                    {children}
                </div>

                {/* Resize handle */}
                {isResizable && windowState === 'normal' && !isModal && (
                    <div
                        ref={resizeRef}
                        onMouseDown={handleResizeMouseDown}
                        className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
                    >
                        <div className="absolute bottom-1 right-1 w-2 h-2 bg-gray-400 rounded" />
                    </div>
                )}
            </div>
        </div>
    );

    // Use portal if requested and available
    if (usePortal && portalContainerRef.current && typeof document !== 'undefined') {
        return createPortal(content, portalContainerRef.current);
    }

    // Otherwise render normally
    return content;
};

export default ViewManager;
