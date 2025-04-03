'use client';

export type ViewerType = 'image' | 'audio' | 'video' | 'website' | 'markdown' | 'json' | 'text';

/**
 * Improved URL pattern detection that handles query parameters
 * @param url The URL to check
 * @param extensions Array of file extensions to match
 * @returns True if the URL matches any of the extensions
 */
const hasFileExtension = (url: string, extensions: string[]): boolean => {
  if (typeof url !== 'string') return false;
  
  // Create a regex pattern that matches any of the extensions before optional query params
  const pattern = new RegExp(`\\.(?:${extensions.join('|')})(?:[?#].*)?$`, 'i');
  return pattern.test(url);
};

/**
 * Checks if a URL points to an image
 */
const isImageUrl = (url: string): boolean => {
  if (typeof url !== 'string') return false;
  
  // Check for data URLs
  if (url.startsWith('data:image/')) return true;
  
  // Check for common image file extensions with query params
  return hasFileExtension(url, ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp', 'tiff', 'ico']);
};

/**
 * Checks if a URL points to an audio file
 */
const isAudioUrl = (url: string): boolean => {
  if (typeof url !== 'string') return false;
  
  // Check for data URLs
  if (url.startsWith('data:audio/')) return true;
  
  // Check for common audio file extensions with query params
  return hasFileExtension(url, ['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac', 'wma', 'aiff']);
};

/**
 * Checks if a URL points to a video file
 */
const isVideoUrl = (url: string): boolean => {
  if (typeof url !== 'string') return false;
  
  // Check for data URLs
  if (url.startsWith('data:video/')) return true;
  
  // Check for video hosting platforms
  if (url.includes('youtube.com/') || 
      url.includes('youtu.be/') || 
      url.includes('vimeo.com/') ||
      url.includes('dailymotion.com/') ||
      url.includes('twitch.tv/')) {
    return true;
  }
  
  // Check for common video file extensions with query params
  return hasFileExtension(url, ['mp4', 'webm', 'mov', 'avi', 'mkv', 'flv', 'wmv', 'm4v', 'mpg', 'mpeg']);
};

/**
 * Checks if a string is likely to be HTML content
 */
const isHtmlContent = (str: string): boolean => {
  if (typeof str !== 'string') return false;
  
  // Quick checks for obvious HTML
  if (str.trim().startsWith('<!DOCTYPE html>')) return true;
  if (str.includes('<html') && str.includes('</html>')) return true;
  if (str.includes('<body') && str.includes('</body>')) return true;
  if (str.includes('<head') && str.includes('</head>')) return true;
  
  // Check for common HTML tags with proper closing
  const commonHtmlTags = [
    'div', 'span', 'p', 'a', 'img', 'table', 'tr', 'td', 'th', 
    'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'form', 'input', 'button', 'select', 'option', 'textarea',
    'header', 'footer', 'nav', 'main', 'section', 'article'
  ];
  
  // Count HTML tag pairs
  let tagCount = 0;
  for (const tag of commonHtmlTags) {
    const openTag = new RegExp(`<${tag}[\\s>]`, 'i');
    const closeTag = new RegExp(`</${tag}>`, 'i');
    
    if (openTag.test(str) && closeTag.test(str)) {
      tagCount++;
      
      // If we find multiple different HTML tag pairs, it's very likely HTML
      if (tagCount >= 2) return true;
    }
  }
  
  // Check for HTML attributes
  const htmlAttributePattern = /<\w+\s+[^>]*?(class|style|id|href|src)=["'][^"']*["'][^>]*>/i;
  if (htmlAttributePattern.test(str)) return true;
  
  // Check for self-closing tags
  const selfClosingPattern = /<(img|br|hr|input|meta|link|source|area|base|col|embed|param|track|wbr)([^>]*?)\/?\s*>/i;
  if (selfClosingPattern.test(str)) return true;
  
  // Check for HTML entities
  const entityPattern = /&(nbsp|lt|gt|amp|quot|apos|#\d+);/i;
  const hasEntities = entityPattern.test(str);
  
  // If we have at least one tag pair and HTML entities, it's likely HTML
  if (tagCount > 0 && hasEntities) return true;
  
  // Final check: if it starts with < and contains balanced tags
  if (str.trim().startsWith('<') && str.includes('</') && tagCount > 0) {
    return true;
  }
  
  return false;
};

/**
 * Checks if a string is likely to be Markdown content
 */
const isMarkdownContent = (str: string): boolean => {
  if (typeof str !== 'string') return false;
  
  // Count markdown indicators
  let markdownScore = 0;
  
  // Headers
  if (str.match(/^#+ .+$/m)) markdownScore += 2;
  
  // Lists
  if (str.match(/^- .+$/m)) markdownScore += 1;
  if (str.match(/^\d+\. .+$/m)) markdownScore += 1;
  
  // Links
  if (str.match(/\[.+\]\(.+\)/)) markdownScore += 2;
  
  // Images
  if (str.match(/!\[.+\]\(.+\)/)) markdownScore += 2;
  
  // Code blocks
  if (str.match(/```[\s\S]*?```/)) markdownScore += 3;
  if (str.match(/`[^`]+`/)) markdownScore += 1;
  
  // Blockquotes
  if (str.match(/^> .+$/m)) markdownScore += 1;
  
  // Emphasis
  if (str.match(/\*\*[^*]+\*\*/)) markdownScore += 1; // Bold
  if (str.match(/\*[^*]+\*/)) markdownScore += 1; // Italic
  
  // Tables
  if (str.match(/\|.+\|.+\|/)) markdownScore += 3;
  if (str.match(/\|[-:]+\|[-:]+\|/)) markdownScore += 3;
  
  // Horizontal rules
  if (str.match(/^---+$/m) || str.match(/^\*\*\*+$/m)) markdownScore += 1;
  
  // Return true if we have enough markdown indicators
  return markdownScore >= 3;
};

/**
 * Checks if a string is valid JSON
 */
const isJsonContent = (str: string): boolean => {
  if (typeof str !== 'string') return false;
  
  // Quick check for JSON-like structure
  const trimmed = str.trim();
  if (!(
    (trimmed.startsWith('{') && trimmed.endsWith('}')) || 
    (trimmed.startsWith('[') && trimmed.endsWith(']'))
  )) {
    return false;
  }
  
  // Try to parse as JSON
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Checks if a string looks like a URL
 */
const isUrl = (str: string): boolean => {
  if (typeof str !== 'string') return false;
  
  // Check for URL protocol
  if (str.startsWith('http://') || 
      str.startsWith('https://') || 
      str.startsWith('ftp://') ||
      str.startsWith('file://')) {
    return true;
  }
  
  // Check for common URL patterns
  const urlPattern = /^(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;
  return urlPattern.test(str);
};

/**
 * Checks if a string is likely base64 encoded
 */
const isBase64 = (str: string): boolean => {
  if (typeof str !== 'string') return false;
  
  // Check if it's a data URL (which uses base64)
  if (str.startsWith('data:')) return true;
  
  // Check for base64 pattern (must be multiple of 4 characters, only valid chars)
  const base64Pattern = /^[A-Za-z0-9+/]+={0,2}$/;
  return str.length % 4 === 0 && base64Pattern.test(str) && str.length >= 24;
};

/**
 * Try to determine the MIME type from a base64 string
 */
const getMimeTypeFromBase64 = (base64Str: string): string | null => {
  if (!base64Str.startsWith('data:')) return null;
  
  const match = base64Str.match(/^data:([^;]+);base64,/);
  return match ? match[1] : null;
};

/**
 * Detects the content type of the provided data
 * @param data The data to analyze
 * @returns The detected content type
 */
export const detectContentType = (data: any): ViewerType => {
  // Check if data is null or undefined
  if (data === null || data === undefined) {
    return 'text';
  }

  // Handle string data
  if (typeof data === 'string') {
    // STEP 1: Check if it's a URL
    if (isUrl(data)) {
      // Analyze URL to determine content type
      if (isImageUrl(data)) return 'image';
      if (isAudioUrl(data)) return 'audio';
      if (isVideoUrl(data)) return 'video';
      
      // If it's a URL but not media, assume it's a website
      return 'website';
    }
    
    // STEP 2: Check if it's base64 encoded
    if (isBase64(data)) {
      // Try to determine content type from MIME type
      const mimeType = getMimeTypeFromBase64(data);
      if (mimeType) {
        if (mimeType.startsWith('image/')) return 'image';
        if (mimeType.startsWith('audio/')) return 'audio';
        if (mimeType.startsWith('video/')) return 'video';
        if (mimeType === 'text/html') return 'website';
        if (mimeType === 'text/markdown') return 'markdown';
        if (mimeType === 'application/json') return 'json';
      }
      
      // If it's base64 but we can't determine type, check the content
      if (data.startsWith('data:image/')) return 'image';
      if (data.startsWith('data:audio/')) return 'audio';
      if (data.startsWith('data:video/')) return 'video';
    }
    
    // STEP 3: Analyze content structure
    // Check for HTML content
    if (isHtmlContent(data)) {
      return 'website';
    }
    
    // Check for Markdown content
    if (isMarkdownContent(data)) {
      return 'markdown';
    }
    
    // Check for JSON content
    if (isJsonContent(data)) {
      return 'json';
    }
    
    // Default to text
    return 'text';
  }
  
  // Handle object data
  if (typeof data === 'object' && data !== null) {
    // STEP 1: Check for binary data (ArrayBuffer, Buffer, Blob, etc.)
    if (
      data instanceof ArrayBuffer || 
      (typeof Buffer !== 'undefined' && data instanceof Buffer) ||
      (typeof Blob !== 'undefined' && data instanceof Blob) ||
      data.type === 'Buffer' || 
      data.byteLength !== undefined
    ) {
      // Try to determine binary type from metadata or context
      if (data.type === 'image' || data.contentType?.includes('image/')) return 'image';
      if (data.type === 'audio' || data.contentType?.includes('audio/')) return 'audio';
      if (data.type === 'video' || data.contentType?.includes('video/')) return 'video';
      
      // Default binary data to image as a best guess
      return 'image';
    }
    
    // STEP 2: Extract content and metadata from common AI response structures
    let content = data;
    let metadata = {};
    
    // Look for content in common fields
    if (data.content !== undefined) content = data.content;
    else if (data.text !== undefined) content = data.text;
    else if (data.result !== undefined) content = data.result;
    else if (data.response !== undefined) content = data.response;
    else if (data.output !== undefined) content = data.output;
    else if (data.data !== undefined) content = data.data;
    
    // Extract metadata if available
    if (data.metadata) metadata = data.metadata;
    else if (data.info) metadata = data.info;
    else if (data.details) metadata = data.details;
    
    // STEP 3: Check metadata for explicit type hints
    if (metadata && typeof metadata === 'object') {
      const meta = metadata as any;
      
      // Check for content type or MIME type
      if (meta.contentType || meta.mimeType) {
        const typeStr = (meta.contentType || meta.mimeType).toLowerCase();
        
        if (typeStr.includes('image/')) return 'image';
        if (typeStr.includes('audio/')) return 'audio';
        if (typeStr.includes('video/')) return 'video';
        if (typeStr.includes('text/html')) return 'website';
        if (typeStr.includes('text/markdown')) return 'markdown';
        if (typeStr.includes('application/json')) return 'json';
      }
      
      // Check for explicit type field
      if (meta.type) {
        const typeStr = meta.type.toLowerCase();
        
        if (typeStr === 'image') return 'image';
        if (typeStr === 'audio') return 'audio';
        if (typeStr === 'video') return 'video';
        if (typeStr === 'html' || typeStr === 'website') return 'website';
        if (typeStr === 'markdown' || typeStr === 'md') return 'markdown';
        if (typeStr === 'json') return 'json';
      }
    }
    
    // STEP 4: Check if the object itself has type indicators
    if (data.type) {
      const typeStr = data.type.toLowerCase();
      
      if (typeStr === 'image') return 'image';
      if (typeStr === 'audio') return 'audio';
      if (typeStr === 'video') return 'video';
      if (typeStr === 'html' || typeStr === 'website') return 'website';
      if (typeStr === 'markdown' || typeStr === 'md') return 'markdown';
      if (typeStr === 'json') return 'json';
    }
    
    // STEP 5: Check for URL fields that might contain media
    if (typeof data.url === 'string') {
      if (isUrl(data.url)) {
        if (isImageUrl(data.url)) return 'image';
        if (isAudioUrl(data.url)) return 'audio';
        if (isVideoUrl(data.url)) return 'video';
        return 'website'; // Default URL to website
      }
    }
    
    if (typeof data.src === 'string') {
      if (isUrl(data.src)) {
        if (isImageUrl(data.src)) return 'image';
        if (isAudioUrl(data.src)) return 'audio';
        if (isVideoUrl(data.src)) return 'video';
        return 'website'; // Default URL to website
      }
    }
    
    // STEP 6: If content is a string, recursively check it
    if (typeof content === 'string' && content !== data) {
      const contentType = detectContentType(content);
      if (contentType !== 'text') {
        return contentType;
      }
    }
    
    // Default to JSON for objects
    return 'json';
  }
  
  // Default fallback
  return 'text';
};

/**
 * Extracts the actual content from various possible data structures
 * @param data The data to extract content from
 * @returns The extracted content
 */
export const extractContent = (data: any): any => {
  if (data === null || data === undefined) {
    return '';
  }
  
  // If it's a string, return as is
  if (typeof data === 'string') {
    return data;
  }
  
  // If it's an object, try to extract content from common fields
  if (typeof data === 'object') {
    // Check for common content fields
    if (data.content !== undefined) return data.content;
    if (data.text !== undefined) return data.text;
    if (data.result !== undefined) return data.result;
    if (data.response !== undefined) return data.response;
    if (data.output !== undefined) return data.output;
    if (data.data !== undefined) return data.data;
    if (data.message !== undefined) return data.message;
    
    // Check for URL fields
    if (data.url !== undefined) return data.url;
    if (data.src !== undefined) return data.src;
    if (data.source !== undefined) return data.source;
    if (data.href !== undefined) return data.href;
    
    // Check for media-specific fields
    if (data.image !== undefined) return data.image;
    if (data.audio !== undefined) return data.audio;
    if (data.video !== undefined) return data.video;
    if (data.html !== undefined) return data.html;
    if (data.markdown !== undefined) return data.markdown;
    if (data.md !== undefined) return data.md;
  }
  
  // Return the original data if no extraction was possible
  return data;
};
