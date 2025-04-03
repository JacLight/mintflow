'use client';

import React, { useState } from 'react';
import { extractContent } from '../utils/type-detector';
import { IconRenderer } from '@/components/ui/icon-renderer';
import { CustomVideoPlayer } from '@/components/custom-video-player';

interface VideoPlayerProps {
  data: any;
  onError?: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ data, onError }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  // Extract video URL or data
  const extractVideoUrl = (content: any): string => {
    if (content === null || content === undefined) {
      return '';
    }
    
    if (typeof content === 'string') {
      // If it's already a URL or data URL, return it
      if (content.startsWith('http') || 
          content.startsWith('data:video/') || 
          content.match(/\.(mp4|webm|mov|avi|mkv)$/i) ||
          content.includes('youtube.com') ||
          content.includes('vimeo.com')) {
        return content;
      }
      
      // Check if it's a base64 string without the data URL prefix
      if (content.match(/^[A-Za-z0-9+/=]+$/)) {
        return `data:video/mp4;base64,${content}`;
      }
    }
    
    // If it's an object, look for common video URL properties
    if (typeof content === 'object' && content !== null) {
      if (content.url) return content.url;
      if (content.src) return content.src;
      if (content.source) return content.source;
      if (content.video) return extractVideoUrl(content.video);
      if (content.data && typeof content.data === 'string') {
        if (content.data.startsWith('data:video/')) {
          return content.data;
        }
        if (content.data.match(/^[A-Za-z0-9+/=]+$/)) {
          return `data:video/mp4;base64,${content.data}`;
        }
      }
    }
    
    return '';
  };
  
  const content = extractContent(data);
  const videoUrl = extractVideoUrl(content);
  
  const handleLoad = () => {
    setLoading(false);
  };
  
  const handleError = () => {
    setError(true);
    setLoading(false);
    onError?.();
  };
  
  if (!videoUrl) {
    return (
      <div className="p-4 text-red-500">
        Unable to extract video data
      </div>
    );
  }
  
  return (
    <div className="p-4 h-full flex flex-col">
      {/* Video player UI */}
      <div className="flex flex-col items-center justify-center flex-1">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-50 z-10">
            <IconRenderer icon="Loader" className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        )}
        
        {error ? (
          <div className="flex flex-col items-center justify-center h-full text-red-500">
            <IconRenderer icon="AlertCircle" className="h-8 w-8 mb-2" />
            <span>Failed to load video</span>
          </div>
        ) : (
          <div className="w-full h-full bg-black rounded overflow-hidden relative">
            <CustomVideoPlayer 
              url={videoUrl}
              width="100%"
              height="100%"
              className="w-full h-full"
            />
            
            {/* Video info */}
            <div className="absolute bottom-4 left-4 right-4 text-sm text-white bg-black bg-opacity-50 p-2 rounded">
              <span>Video URL: {videoUrl.substring(0, 30)}{videoUrl.length > 30 ? '...' : ''}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;
