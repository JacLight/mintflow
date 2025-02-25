'use client';
import React, { useState, useEffect, useRef } from 'react';
import {
    FiMaximize2,
    FiMinimize2,
    FiX,
    FiRefreshCw,
    FiMinimize,
    FiExternalLink,
    FiMoreVertical
} from 'react-icons/fi';
import {
    MdMinimize,
    MdOutlineUnfoldMore,
    MdFullscreen,
    MdFullscreenExit,
    MdOutlinePictureInPicture,
    MdPictureInPictureAlt,
    MdGpsFixed,
    MdSettingsBackupRestore,
    MdMoreVert,
    MdClose,
} from "react-icons/md";
import { Icon } from './icons';

const ViewManager = ({
    id,
    title,
    children,
    defaultPosition = { x: 20, y: 20 },
    defaultSize = { width: 400, height: 300 },
    onClose,
    isResizable = true,
    compact = false,
    isModal = false,
    closeOnOutsideClick = false
}) => {
    const [position, setPosition] = useState(getStoredValue('position', defaultPosition));
    const [size, setSize] = useState(getStoredValue('size', defaultSize));
    const [windowState, setWindowState] = useState('normal');
    const [stateHistory, setStateHistory] = useState({
        normal: { position: defaultPosition, size: defaultSize }
    });
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const boxRef = useRef(null);
    const dragRef = useRef(null);
    const resizeRef = useRef(null);
    const menuRef = useRef(null);

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
        if (id && windowState === 'normal') {
            localStorage.setItem(`float-box-${id}-position`, JSON.stringify(position));
            localStorage.setItem(`float-box-${id}-size`, JSON.stringify(size));
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
            }

            if (isResizing && windowState === 'normal') {
                const box = boxRef.current.getBoundingClientRect();
                const newWidth = Math.max(200, Math.min(window.innerWidth, e.clientX - box.left));
                const newHeight = Math.max(100, Math.min(window.innerHeight, e.clientY - box.top));
                setSize({ width: newWidth, height: newHeight });
                setPosition(prev => constrainToViewport(prev, { width: newWidth, height: newHeight }));
            }
        };

        const handleMouseUp = () => {
            if (isDragging || isResizing) {
                setStateHistory(prev => ({
                    ...prev,
                    normal: { position, size }
                }));
            }
            setIsDragging(false);
            setIsResizing(false);
        };

        if (isDragging || isResizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, isResizing, dragOffset, windowState, position, size]);

    const handleMouseDown = (e) => {
        if ((e.target === dragRef.current || e.target.parentElement === dragRef.current) &&
            windowState === 'normal' && !isModal) {
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
        setWindowState('normal');
        setIsMenuOpen(false);
    };

    const toggleMinimize = () => {
        if (windowState !== 'minimized') {
            saveCurrentState();
            setPosition({
                x: window.innerWidth - 320,
                y: window.innerHeight - 40
            });
            setWindowState('minimized');
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
            restoreToNormal();
        }
        setIsMenuOpen(false);
    };

    const toggleDock = () => {
        if (windowState !== 'docked') {
            saveCurrentState();
            setWindowState('docked');
        } else {
            restoreToNormal();
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

    const getBoxStyle = () => {
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
                    position: 'fixed',
                    top: position.y,
                    left: position.x,
                    width: '300px',
                    height: '40px',
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
                return {
                    position: 'fixed',
                    top: '50%',
                    right: 0,
                    transform: 'translateY(-50%)',
                    width: '300px',
                    height: '80%',
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
        <div className="flex items-center space-x-1">
            {!isModal && (
                <>
                    <button
                        onClick={toggleMinimize}
                        className="p-1 hover:bg-gray-700 rounded text-white"
                        title={windowState === 'minimized' ? 'Restore' : 'Minimize'}
                    >
                        {windowState === 'minimized' ? <Icon name='MdOutlineUnfoldMore' size={16} /> : <Icon name='MdMinimize' size={16} />}
                    </button>
                    <button
                        onClick={toggleMaximize}
                        className="p-1 hover:bg-gray-700 rounded text-white"
                        title={windowState === 'maximized' ? 'Restore' : 'Maximize'}
                    >
                        {windowState === 'maximized' ? <Icon name='MdFullscreenExit' size={16} /> : <Icon name='MdFullscreen' size={16} />}
                    </button>
                    <button
                        onClick={toggleDock}
                        className="p-1 hover:bg-gray-700 rounded text-white"
                        title={windowState === 'docked' ? 'Restore' : 'Dock'}
                    >
                        <Icon name='MdPictureInPictureAlt' size={16} />
                    </button>
                    {windowState === 'normal' && (
                        <button
                            onClick={resetSize}
                            className="p-1 hover:bg-gray-700 rounded text-white"
                            title="Reset Size"
                        >
                            <Icon name='MdSettingsBackupRestore' size={16} />
                        </button>
                    )}
                </>
            )}
            {(isModal || onClose) && (
                <button
                    onClick={onClose}
                    className="p-1 hover:bg-gray-700 rounded text-white"
                >
                    <FiX size={16} />
                </button>
            )}
        </div>
    );

    const CompactMenu = () => (
        <div ref={menuRef} className="absolute top-2 right-2 z-50">
            <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-1 hover:bg-gray-200 rounded-full bg-white shadow-sm"
            >
                <FiMoreVertical size={16} />
            </button>

            {isMenuOpen && (
                <div className="absolute top-full right-0 mt-1 bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                    {title && (
                        <div className="px-4 py-2 border-b border-gray-700 font-semibold text-white">
                            {title}
                        </div>
                    )}
                    <div className="p-2">
                        <MenuControls />
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <>
            {isModal && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50"
                    style={{ zIndex: 1050 }}
                />
            )}
            <div
                ref={boxRef}
                style={getBoxStyle()}
                className={`bg-white rounded-lg shadow-lg flex flex-col overflow-hidden ${isModal ? 'shadow-xl' : ''
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
                        className={`bg-gray-800 text-white p-2 flex items-center justify-between ${isModal ? '' : 'cursor-move'
                            } select-none`}
                    >
                        <span className="font-semibold truncate">{title}</span>
                        <MenuControls />
                    </div>
                )}

                {/* Content area */}
                {windowState !== 'minimized' && (
                    <div className={`flex-1 overflow-auto relative ${compact ? 'pt-2' : ''}`}>
                        {children}
                    </div>
                )}

                {/* Minimize bar content */}
                {windowState === 'minimized' && (
                    <div className="flex items-center justify-between p-2">
                        <span className="font-semibold truncate">{title}</span>
                        <MenuControls />
                    </div>
                )}

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
        </>
    );
};

export default ViewManager;