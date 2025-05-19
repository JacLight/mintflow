'use client';

import React, { useState, useEffect } from 'react';
import { ViewerType, detectContentType, extractContent } from './utils/type-detector';
import ViewerSelector from './utils/viewer-selector';

// Import all viewers
import TextViewer from './viewers/text-viewer';
import JSONViewer from './viewers/json-viewer';
import ImageViewer from './viewers/image-viewer';
import AudioPlayer from './viewers/audio-player';
import VideoPlayer from './viewers/video-player';
import WebsiteViewer from './viewers/website-viewer';
import MarkdownViewer from './viewers/markdown-viewer';

interface DataViewerProps {
  data: any;
  initialType?: ViewerType;
  className?: string;
  style?: React.CSSProperties;
  showViewerSelector?: boolean;
  showRawToggle?: boolean;
}

const DataViewer: React.FC<DataViewerProps> = ({
  data,
  initialType,
  className = '',
  style = {},
  showViewerSelector = true,
  showRawToggle = true,
}) => {
  // State for current viewer type and raw toggle
  const [viewerType, setViewerType] = useState<ViewerType>(initialType || 'text');
  const [showRaw, setShowRaw] = useState(false);
  
  // Auto-detect content type if not provided
  useEffect(() => {
    if (!initialType) {
      const detectedType = detectContentType(data);
      setViewerType(detectedType);
    }
  }, [data, initialType]);
  
  // Handle viewer errors by falling back to text
  const handleViewerError = () => {
    if (viewerType !== 'text') {
      setViewerType('text');
    }
  };
  
  // Render the appropriate viewer
  const renderViewer = () => {
    // Always show raw data if toggled
    if (showRaw) {
      return <TextViewer data={data} />;
    }
    
    // Otherwise render based on type
    switch (viewerType) {
      case 'image':
        return <ImageViewer data={data} onError={handleViewerError} />;
      case 'audio':
        return <AudioPlayer data={data} onError={handleViewerError} />;
      case 'video':
        return <VideoPlayer data={data} onError={handleViewerError} />;
      case 'website':
        return <WebsiteViewer data={data} onError={handleViewerError} />;
      case 'markdown':
        return <MarkdownViewer data={data} onError={handleViewerError} />;
      case 'json':
        return <JSONViewer data={data} onError={handleViewerError} />;
      case 'text':
      default:
        return <TextViewer data={data} />;
    }
  };
  
  return (
    <div className={`flex flex-col h-full border rounded-md overflow-hidden ${className}`} style={style}>
      {/* Controls bar */}
      {(showViewerSelector || showRawToggle) && (
        <div className="flex justify-between items-center p-2 bg-gray-50 border-b">
          {showViewerSelector && (
            <ViewerSelector 
              currentType={viewerType} 
              onTypeChange={setViewerType} 
            />
          )}
          
          {showRawToggle && (
            <button
              onClick={() => setShowRaw(!showRaw)}
              className={`px-3 py-1 rounded text-sm ${
                showRaw ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {showRaw ? 'View Rendered' : 'View Raw Data'}
            </button>
          )}
        </div>
      )}
      
      {/* Content area */}
      <div className="flex-1 overflow-auto">
        {renderViewer()}
      </div>
    </div>
  );
};

export default DataViewer;
