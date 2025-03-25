'use client';

import React, { useEffect, useState } from 'react';
import { minimizedWindowsManager, MinimizedPosition } from './minimized-windows';
import { classNames } from '@/lib/utils';
import { IconRenderer } from '@/components/ui/icon-renderer';

const getContainerStyles = (position: MinimizedPosition): string => {
  const baseStyles = 'view-manager-container z-[1050] bg-gray-100/90 border border-gray-300 shadow-md p-1';
  
  switch (position) {
    case 'top':
      return `${baseStyles} top-0 left-0 w-full flex flex-row flex-wrap gap-1`;
    case 'bottom':
      return `${baseStyles} bottom-0 left-0 w-full flex flex-row flex-wrap gap-1`;
    case 'left':
      return `${baseStyles} top-0 left-0 h-full flex flex-col flex-wrap gap-1`;
    case 'right':
      return `${baseStyles} top-0 right-0 h-full flex flex-col flex-wrap gap-1`;
    default:
      return `${baseStyles} bottom-0 left-0 w-full flex flex-row flex-wrap gap-1`;
  }
};

export const MinimizedContainer: React.FC<{className?}> = ({className=''}) => {
  const [windows, setWindows] = useState(minimizedWindowsManager.getWindows());
  const [position, setPosition] = useState(minimizedWindowsManager.getPosition());
  
  // Subscribe to changes in the minimized windows manager
  useEffect(() => {
    const unsubscribe = minimizedWindowsManager.subscribe(() => {
      setWindows(minimizedWindowsManager.getWindows());
      setPosition(minimizedWindowsManager.getPosition());
    });
    
    return unsubscribe;
  }, []);
  
  // If no minimized windows, don't render
  if (Object.keys(windows).length === 0) {
    return null;
  }

  const isHorizontal = position === 'top' || position === 'bottom';
  
  return (
    <div className={classNames(getContainerStyles(position),className)}>
      {Object.values(windows).map((window) => (
        <div 
          key={window.id}
          className={`
            bg-white rounded-md shadow-sm border border-gray-200 flex items-center justify-between border-t-2 border-t-purple-700
            ${isHorizontal ? 'w-64 h-6' : 'w-48 h-6'}
          `}
        >
          <span className="text-sm px-2">{window.title}</span>
          <div className="flex items-center">
            <button
              onClick={window.onRestore}
              className="p-1 hover:bg-gray-200 rounded"
              title="Restore"
            >
              <IconRenderer icon="Maximize" size={16} />
            </button>
            <button
              onClick={() => {
                window.onClose();
                minimizedWindowsManager.removeWindow(window.id);
              }}
              className="p-1 hover:bg-gray-200 rounded"
              title="Close"
            >
              <IconRenderer icon="X" size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
