'use client';

import React from 'react';
import { IconRenderer } from '@/components/ui/icon-renderer';
import { ViewerType } from './type-detector';

interface ViewerSelectorProps {
  currentType: ViewerType;
  onTypeChange: (type: ViewerType) => void;
}

const ViewerSelector: React.FC<ViewerSelectorProps> = ({ 
  currentType, 
  onTypeChange 
}) => {
  const viewerTypes = [
    { id: 'text' as ViewerType, label: 'Text', icon: 'FileText' },
    { id: 'json' as ViewerType, label: 'JSON', icon: 'Braces' },
    { id: 'markdown' as ViewerType, label: 'Markdown', icon: 'FileCode' },
    { id: 'image' as ViewerType, label: 'Image', icon: 'Image' },
    { id: 'audio' as ViewerType, label: 'Audio', icon: 'Music' },
    { id: 'video' as ViewerType, label: 'Video', icon: 'Video' },
    { id: 'website' as ViewerType, label: 'Website', icon: 'Globe' }
  ];
  
  return (
    <div className="flex items-center space-x-1">
      <span className="text-sm text-gray-500 mr-2">View as:</span>
      {viewerTypes.map(type => (
        <button
          key={type.id}
          onClick={() => onTypeChange(type.id)}
          className={`p-1.5 rounded ${
            currentType === type.id 
              ? 'bg-purple-100 text-purple-700' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          title={type.label}
        >
          <IconRenderer icon={type.icon} className="h-4 w-4" />
        </button>
      ))}
    </div>
  );
};

export default ViewerSelector;
