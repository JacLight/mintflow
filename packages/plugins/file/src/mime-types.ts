/**
 * List of common MIME types
 * Based on: https://developer.mozilla.org/en-US/docs/Web/HTTP/MIME_types/Common_types
 */
export const mimeTypes = [
    // important MIME types for Web developers
    { label: 'Octet-stream', value: 'application/octet-stream' },
    // Textual Files
    { label: 'Plain Text', value: 'text/plain' },
    { label: 'CSS Stylesheet', value: 'text/css' },
    { label: 'HTML Document', value: 'text/html' },
    { label: 'JavaScript', value: 'text/javascript' },
    { label: 'CSV File', value: 'text/csv' },
    { label: 'iCalendar Format', value: 'text/calendar' },
    // Image Types
    { label: 'APNG Image', value: 'image/apng' },
    { label: 'AVIF Image', value: 'image/avif' },
    { label: 'GIF Image', value: 'image/gif' },
    { label: 'JPEG Image', value: 'image/jpeg' },
    { label: 'PNG Image', value: 'image/png' },
    { label: 'SVG Image', value: 'image/svg+xml' },
    { label: 'WebP Image', value: 'image/webp' },
    { label: 'BMP Image', value: 'image/bmp' },
    { label: 'Icon Format', value: 'image/vnd.microsoft.icon' },
    { label: 'TIFF Image', value: 'image/tiff' },
    // Audio Types
    { label: 'AAC Audio', value: 'audio/aac' },
    { label: 'MP3 Audio', value: 'audio/mpeg' },
    { label: 'OGG Audio', value: 'audio/ogg' },
    { label: 'WAV Audio', value: 'audio/wav' },
    { label: 'FLAC Audio', value: 'audio/flac' },
    { label: 'MIDI Audio', value: 'audio/midi' },
    { label: 'WEBM Audio', value: 'audio/webm' },
    // Video Types
    { label: 'MP4 Video', value: 'video/mp4' },
    { label: 'WebM Video', value: 'video/webm' },
    { label: 'OGG Video', value: 'video/ogg' },
    { label: 'AVI Video', value: 'video/x-msvideo' },
    { label: 'MPEG Video', value: 'video/mpeg' },
    { label: '3GPP Video', value: 'video/3gpp' },
    { label: '3GPP2 Video', value: 'video/3gpp2' },
    // Font Types
    { label: 'EOT Font', value: 'application/vnd.ms-fontobject' },
    { label: 'OpenType Font', value: 'font/otf' },
    { label: 'TrueType Font', value: 'font/ttf' },
    { label: 'WOFF Font', value: 'font/woff' },
    { label: 'WOFF2 Font', value: 'font/woff2' },
    // Archive and Compressed Files
    { label: 'BZip Archive', value: 'application/x-bzip' },
    { label: 'BZip2 Archive', value: 'application/x-bzip2' },
    { label: 'GZip Archive', value: 'application/gzip' },
    { label: 'RAR Archive', value: 'application/vnd.rar' },
    { label: 'TAR Archive', value: 'application/x-tar' },
    { label: 'ZIP Archive', value: 'application/zip' },
    { label: '7-Zip Archive', value: 'application/x-7z-compressed' },
    // Document Types
    { label: 'AbiWord Document', value: 'application/x-abiword' },
    { label: 'PDF', value: 'application/pdf' },
    { label: 'Microsoft Word', value: 'application/msword' },
    { label: 'Microsoft Word (OpenXML)', value: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
    { label: 'Microsoft Excel', value: 'application/vnd.ms-excel' },
    { label: 'Microsoft Excel (OpenXML)', value: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
    { label: 'Microsoft PowerPoint', value: 'application/vnd.ms-powerpoint' },
    { label: 'Microsoft PowerPoint (OpenXML)', value: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' },
    { label: 'OpenDocument Presentation', value: 'application/vnd.oasis.opendocument.presentation' },
    { label: 'OpenDocument Spreadsheet', value: 'application/vnd.oasis.opendocument.spreadsheet' },
    { label: 'OpenDocument Text', value: 'application/vnd.oasis.opendocument.text' },
    { label: 'Rich Text Format', value: 'application/rtf' },
    { label: 'Electronic Publication (EPUB)', value: 'application/epub+zip' },
    { label: 'Amazon Kindle eBook', value: 'application/vnd.amazon.ebook' },
    // Other Important MIME Types
    { label: 'JSON', value: 'application/json' },
    { label: 'JSON-LD', value: 'application/ld+json' },
    { label: 'XML', value: 'application/xml' },
    { label: 'XHTML', value: 'application/xhtml+xml' },
];
