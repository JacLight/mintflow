'use client';

import React, { useState } from 'react';
import { extractContent } from '../utils/type-detector';
import { IconRenderer } from '@/components/ui/icon-renderer';

interface ImageViewerProps {
  data: any;
  onError?: () => void;
}

const ImageViewer: React.FC<ImageViewerProps> = ({ data, onError }) => {
  const [zoom, setZoom] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  // Extract image URL or data
  const extractImageUrl = (content: any): string => {
    if (content === null || content === undefined) {
      return '';
    }
    
    if (typeof content === 'string') {
      // If it's already a URL or data URL, return it
      if (content.startsWith('http') || 
          content.startsWith('data:image/') || 
          content.match(/\.(jpeg|jpg|gif|png|svg|webp)$/i)) {
        return content;
      }
      
      // Check if it's a base64 string without the data URL prefix
      if (content.match(/^[A-Za-z0-9+/=]+$/)) {
        return `data:image/png;base64,${content}`;
      }
    }
    
    // If it's an object, look for common image URL properties
    if (typeof content === 'object' && content !== null) {
      if (content.url) return content.url;
      if (content.src) return content.src;
      if (content.source) return content.source;
      if (content.image) return extractImageUrl(content.image);
      if (content.data && typeof content.data === 'string') {
        if (content.data.startsWith('data:image/')) {
          return content.data;
        }
        if (content.data.match(/^[A-Za-z0-9+/=]+$/)) {
          return `data:image/png;base64,${content.data}`;
        }
      }
    }
    
    return '';
  };
  
  const content = extractContent(data);
  const imageUrl = extractImageUrl(content);
  
  if (!imageUrl) {
    onError?.();
    return (
      <div className="p-4 text-red-500">
        Unable to extract image data
      </div>
    );
  }
  
  const handleImageLoad = () => {
    setLoading(false);
  };
  
  const handleImageError = () => {
    setError(true);
    setLoading(false);
    onError?.();
  };
  
  const zoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3));
  };
  
  const zoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.25));
  };
  
  const resetZoom = () => {
    setZoom(1);
  };
  
  return (
    <div className="p-4 h-full flex flex-col">
      {/* Controls */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <button 
            onClick={zoomOut}
            className="p-1 rounded bg-gray-100 hover:bg-gray-200"
            title="Zoom Out"
          >
            <IconRenderer icon="ZoomOut" className="h-4 w-4" />
          </button>
          <span className="text-sm">{Math.round(zoom * 100)}%</span>
          <button 
            onClick={zoomIn}
            className="p-1 rounded bg-gray-100 hover:bg-gray-200"
            title="Zoom In"
          >
            <IconRenderer icon="ZoomIn" className="h-4 w-4" />
          </button>
          <button 
            onClick={resetZoom}
            className="p-1 rounded bg-gray-100 hover:bg-gray-200 ml-2"
            title="Reset Zoom"
          >
            <IconRenderer icon="RotateCcw" className="h-4 w-4" />
          </button>
        </div>
        
        {/* Image info */}
        <div className="text-sm text-gray-500">
          {!loading && !error && (
            <span>Image URL: {imageUrl.substring(0, 30)}{imageUrl.length > 30 ? '...' : ''}</span>
          )}
        </div>
      </div>
      
      {/* Image container */}
      <div className="flex-1 overflow-auto flex items-center justify-center bg-gray-100 rounded">
        {loading && (
          <div className="flex items-center justify-center h-full">
            <IconRenderer icon="Loader" className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        )}
        
        {error && (
          <div className="flex flex-col items-center justify-center h-full text-red-500">
            <IconRenderer icon="AlertCircle" className="h-8 w-8 mb-2" />
            <span>Failed to load image</span>
          </div>
        )}
        
        <img 
          src={imageUrl}
          alt="Content"
          style={{ 
            transform: `scale(${zoom})`,
            transformOrigin: 'center',
            transition: 'transform 0.2s ease-in-out',
            display: loading || error ? 'none' : 'block'
          }}
          className="max-w-full max-h-full object-contain"
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      </div>
    </div>
  );
};

export default ImageViewer;
