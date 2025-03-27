import React from 'react';

interface ButtonDeleteProps {
  onDelete: (event?: React.MouseEvent) => void;
  className?: string;
}

export const ButtonDelete: React.FC<ButtonDeleteProps> = ({ onDelete, className = '' }) => {
  return (
    <button
      className={`w-full text-left px-3 py-2 text-sm hover:bg-red-50 text-red-600 rounded flex items-center ${className}`}
      onClick={onDelete}
    >
      <span className="mr-3 h-4 w-4 text-red-600">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 6h18"></path>
          <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"></path>
          <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
          <line x1="10" y1="11" x2="10" y2="17"></line>
          <line x1="14" y1="11" x2="14" y2="17"></line>
        </svg>
      </span>
      Delete
    </button>
  );
};
