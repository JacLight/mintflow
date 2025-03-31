/**
 * Multimodal module for LangChain
 * 
 * This module provides components for working with multimodal data,
 * including images and audio.
 */

// Export image components
export {
  loadImageFromFile,
  loadImageFromURL,
  type DetectedObject,
  type ImageMetadata,
  type LoadedImage,
  type ImageLoadOptions
} from './ImageLoader.js';

// Export audio components
export {
  loadAudioFromFile,
  loadAudioFromURL,
  type AudioSegment,
  type Speaker,
  type AudioMetadata,
  type LoadedAudio,
  type AudioLoadOptions
} from './AudioLoader.js';

// Export chain components
export {
  MultiModalChain,
  MultiModalChainFactory,
  type MultiModalInput,
  type MultiModalChainOptions
} from './MultiModalChain.js';
