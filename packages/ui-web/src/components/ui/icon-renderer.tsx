import React from 'react';

interface IconRendererProps {
  icon: React.ReactNode | string;
  className?: string;
  size?: number;
}

export const IconRenderer: React.FC<IconRendererProps> = ({ icon, className = '', size = 24 }) => {
  // This is a simplified implementation
  if (React.isValidElement(icon)) {
    return <span className={className}>{icon}</span>;
  }
  
  return (
    <span className={className}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Default icon is a circle */}
        <circle cx="12" cy="12" r="10" />
      </svg>
    </span>
  );
};
