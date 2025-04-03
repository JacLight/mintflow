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
          content.match(/\.(mp4|webm|mov|avi|mkv|flv|wmv|m4v|mpg|mpeg)$/i) ||
          content.includes('youtube.com') ||
          content.includes('youtu.be') ||
          content.includes('vimeo.com') ||
          content.includes('dailymotion.com') ||
          content.includes('twitch.tv')) {
        return content;
      }
      
      // Check if it's a base64 string without the data URL prefix
      if (content.match(/^[A-Za-z0-9+/=]+$/)) {
        // Try to detect the video format from the base64 pattern
        if (content.startsWith('AAAAIGZ0eXBtcDQy') || 
            content.startsWith('AAAAHGZ0eXBtcDQg')) {
          return `data:video/mp4;base64,${content}`;
        }
        
        if (content.startsWith('GkXfo')) {
          return `data:video/webm;base64,${content}`;
        }
        
        // Default to MP4 if we can't determine the format
        return `data:video/mp4;base64,${content}`;
      }
    }
    
    // If it's an object, look for common video URL properties
    if (typeof content === 'object' && content !== null) {
      // Check for direct URL properties
      if (content.url) return content.url;
      if (content.src) return content.src;
      if (content.source) return content.source;
      if (content.uri) return content.uri;
      if (content.href) return content.href;
      
      // Check for video hosting platform specific fields
      if (content.youtubeId) return `https://www.youtube.com/watch?v=${content.youtubeId}`;
      if (content.vimeoId) return `https://vimeo.com/${content.vimeoId}`;
      
      // Check for nested video content
      if (content.video) return extractVideoUrl(content.video);
      
      // Check for data fields
      if (content.data) {
        if (typeof content.data === 'string') {
          if (content.data.startsWith('data:video/')) {
            return content.data;
          }
          if (content.data.match(/^[A-Za-z0-9+/=]+$/)) {
            // Default to MP4 format for base64 data
            return `data:video/mp4;base64,${content.data}`;
          }
        }
        return extractVideoUrl(content.data);
      }
      
      // Check for binary data that might be video
      if (content instanceof ArrayBuffer || 
          content instanceof Uint8Array ||
          (typeof Buffer !== 'undefined' && content instanceof Buffer)) {
        // Convert to base64
        let base64;
        if (typeof Buffer !== 'undefined' && content instanceof Buffer) {
          // Node.js environment with Buffer
          base64 = content.toString('base64');
        } else {
          // Browser environment or ArrayBuffer/Uint8Array
          const bytes = new Uint8Array(
            content instanceof Uint8Array ? content.buffer : content
          );
          let binary = '';
          for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
          }
          base64 = window.btoa(binary);
        }
        
        // Check for video format signatures
        const firstBytes = new Uint8Array(
          content instanceof Uint8Array ? content.buffer.slice(0, 8) : 
          content instanceof ArrayBuffer ? content.slice(0, 8) : 
          new Uint8Array(8)
        );
        
        // MP4 signature check
        if (firstBytes[4] === 0x66 && firstBytes[5] === 0x74 && 
            firstBytes[6] === 0x79 && firstBytes[7] === 0x70) {
          return `data:video/mp4;base64,${base64}`;
        }
        
        // WebM signature check
        if (firstBytes[0] === 0x1A && firstBytes[1] === 0x45 && 
            firstBytes[2] === 0xDF && firstBytes[3] === 0xA3) {
          return `data:video/webm;base64,${base64}`;
        }
        
        // Default to MP4 format
        return `data:video/mp4;base64,${base64}`;
      }
      
      // Check for MIME type in the object
      if (content.mimeType || content.contentType || content['content-type'] || content.mime) {
        const mimeStr = (content.mimeType || content.contentType || content['content-type'] || content.mime).toLowerCase();
        
        if (mimeStr.startsWith('video/')) {
          // If we have a MIME type but no URL, try to find content to use
          if (typeof content.content === 'string' && content.content.match(/^[A-Za-z0-9+/=]+$/)) {
            return `data:${mimeStr};base64,${content.content}`;
          }
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
