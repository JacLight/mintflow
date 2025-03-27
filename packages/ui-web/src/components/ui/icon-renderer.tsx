import React from 'react';
import * as LucideIcons from 'lucide-react';
import { classNames } from '@/lib-client/helpers';


export const IconRenderer = ({ icon, className }: { icon?: React.ReactNode | string, size?: number, color?: string, className?: string, onClick?: () => void; }) => {
  if (!icon) return null;

  if (typeof icon === 'string') {
    // Try to find the icon in Lucide icons
    const IconComponent = (LucideIcons as any)[icon];
    if (IconComponent) {
      return <IconComponent className={classNames("h-4 w-4 text-primary", className)} />;
    }
    // If not found, return the string (could be a class name or other identifier)
    console.warn(`Icon not found: ${icon}`);
    return <span className={classNames("h-4 w-4 flex items-center justify-center text-ellipsis overflow-hidden", className)}>{icon}</span>;
  }

  // If it's already a React element, just return it
  return <>{icon}</>;
};
