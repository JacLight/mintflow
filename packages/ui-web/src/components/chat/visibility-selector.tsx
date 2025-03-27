'use client';

import React from 'react';

export enum VisibilityType {
  PRIVATE = 'private',
  TEAM = 'team',
  PUBLIC = 'public',
}

interface VisibilitySelectorProps {
  value: VisibilityType;
  onChange: (value: VisibilityType) => void;
}

export const VisibilitySelector: React.FC<VisibilitySelectorProps> = ({ value, onChange }) => {
  return (
    <div className="flex space-x-2">
      <button
        className={`px-3 py-1 rounded ${value === VisibilityType.PRIVATE ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        onClick={() => onChange(VisibilityType.PRIVATE)}
      >
        Private
      </button>
      <button
        className={`px-3 py-1 rounded ${value === VisibilityType.TEAM ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        onClick={() => onChange(VisibilityType.TEAM)}
      >
        Team
      </button>
      <button
        className={`px-3 py-1 rounded ${value === VisibilityType.PUBLIC ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        onClick={() => onChange(VisibilityType.PUBLIC)}
      >
        Public
      </button>
    </div>
  );
};
