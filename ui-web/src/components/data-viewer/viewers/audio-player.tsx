'use client';

import React, { useState, useRef, useEffect } from 'react';
import { extractContent } from '../utils/type-detector';
import { IconRenderer } from '@/components/ui/icon-renderer';

interface AudioPlayerProps {
  data: any;
  onError?: () => void;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ data, onError }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // Extract audio URL or data
  const extractAudioUrl = (content: any): string => {
    if (content === null || content === undefined) {
      return '';
    }
    
    if (typeof content === 'string') {
      // If it's already a URL or data URL, return it
      if (content.startsWith('http') || 
          content.startsWith('data:audio/') || 
          content.match(/\.(mp3|wav|ogg|m4a)$/i)) {
        return content;
      }
      
      // Check if it's a base64 string without the data URL prefix
      if (content.match(/^[A-Za-z0-9+/=]+$/)) {
        return `data:audio/mp3;base64,${content}`;
      }
    }
    
    // If it's an object, look for common audio URL properties
    if (typeof content === 'object' && content !== null) {
      if (content.url) return content.url;
      if (content.src) return content.src;
      if (content.source) return content.source;
      if (content.audio) return extractAudioUrl(content.audio);
      if (content.data && typeof content.data === 'string') {
        if (content.data.startsWith('data:audio/')) {
          return content.data;
        }
        if (content.data.match(/^[A-Za-z0-9+/=]+$/)) {
          return `data:audio/mp3;base64,${content.data}`;
        }
      }
    }
    
    return '';
  };
  
  const content = extractContent(data);
  const audioUrl = extractAudioUrl(content);
  
  useEffect(() => {
    if (!audioUrl) {
      setError(true);
      setLoading(false);
      onError?.();
    }
  }, [audioUrl, onError]);
  
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setLoading(false);
    };
    
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };
    
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };
    
    const handleError = () => {
      setError(true);
      setLoading(false);
      onError?.();
    };
    
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    
    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [onError]);
  
  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    
    setIsPlaying(!isPlaying);
  };
  
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const newTime = parseFloat(e.target.value);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };
  
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const newVolume = parseFloat(e.target.value);
    audio.volume = newVolume;
    setVolume(newVolume);
  };
  
  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  if (!audioUrl) {
    return (
      <div className="p-4 text-red-500">
        Unable to extract audio data
      </div>
    );
  }
  
  return (
    <div className="p-4 h-full flex flex-col">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
      
      {/* Audio player UI */}
      <div className="flex flex-col items-center justify-center flex-1">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <IconRenderer icon="Loader" className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full text-red-500">
            <IconRenderer icon="AlertCircle" className="h-8 w-8 mb-2" />
            <span>Failed to load audio</span>
          </div>
        ) : (
          <div className="w-full max-w-md bg-white rounded-lg shadow-md p-4">
            {/* Waveform visualization (placeholder) */}
            <div className="h-24 bg-gray-100 rounded mb-4 flex items-center justify-center">
              <div className="flex items-end h-16 space-x-1">
                {Array.from({ length: 40 }).map((_, i) => {
                  const height = Math.random() * 100;
                  return (
                    <div 
                      key={i}
                      className="w-1 bg-purple-500"
                      style={{ 
                        height: `${height}%`,
                        opacity: i / 40 < currentTime / duration ? 1 : 0.3
                      }}
                    />
                  );
                })}
              </div>
            </div>
            
            {/* Controls */}
            <div className="flex items-center justify-between mb-2">
              <button 
                onClick={togglePlay}
                className="p-2 rounded-full bg-purple-100 hover:bg-purple-200 text-purple-700"
              >
                <IconRenderer icon={isPlaying ? 'Pause' : 'Play'} className="h-6 w-6" />
              </button>
              
              <div className="flex-1 mx-4">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-1 bg-gray-200 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${(currentTime / duration) * 100}%, #e5e7eb ${(currentTime / duration) * 100}%, #e5e7eb 100%)`
                  }}
                />
              </div>
              
              <div className="flex items-center">
                <IconRenderer icon={volume === 0 ? 'VolumeX' : volume < 0.5 ? 'Volume1' : 'Volume2'} className="h-4 w-4 text-gray-500 mr-2" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-16 h-1 bg-gray-200 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${volume * 100}%, #e5e7eb ${volume * 100}%, #e5e7eb 100%)`
                  }}
                />
              </div>
            </div>
            
            {/* Audio info */}
            <div className="text-sm text-gray-500 text-center">
              <span>Audio URL: {audioUrl.substring(0, 30)}{audioUrl.length > 30 ? '...' : ''}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioPlayer;
