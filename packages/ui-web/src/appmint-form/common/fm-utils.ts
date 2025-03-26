export const imgExts = ['png', 'jpg', 'gif', 'svg', 'tif', 'tiff', 'webp', 'bmp', 'jpeg', 'ico', 'heic', 'heif', 'jfif', 'jp2', 'jpe', 'jps', 'jpf', 'jpx', 'j2k', 'j2c', 'jpc', 'jpm', 'mj2', 'mjp', 'mjpg', 'mjpeg', 'avif'];
export const videoExts = ['mpg', 'avi', 'mov', 'wmv', 'flv', 'mp4', 'webm', 'mpeg', 'mkv', 'ogv', 'ogg'];
export const audioExts = ['mp3', 'ogg'];
export const pdfExts = ['pdf'];
export const textOrCodeExts = [
  'txt',
  'md',
  'html',
  'css',
  'js',
  'ts',
  'tsx',
  'jsx',
  'json',
  'yml',
  'yaml',
  'xml',
  'csv',
  'sql',
  'sh',
  'bat',
  'py',
  'rb',
  'java',
  'php',
  'go',
  'c',
  'cpp',
  'h',
  'hpp',
  'cs',
  'swift',
  'kt',
  'kts',
  'java',
  'config',
  'properties',
];

export const isImageFile = ({ url, path }) => {
  const ext = getFileExtension({ url, path });
  return imgExts.includes(ext);
};

export const isVideoFile = file => {
  const ext = getFileExtension(file);
  return videoExts.includes(ext);
};

export const isNotVideoOrImageFile = file => {
  const ext = getFileExtension(file);
  return !(imgExts.includes(ext) || videoExts.includes(ext));
};

export const isAudioFile = file => {
  const ext = getFileExtension(file);
  return audioExts.includes(ext);
};

export const isPdfFile = file => {
  const ext = getFileExtension(file);
  return ext === 'pdf';
};

export const isTextOrCodeFile = file => {
  const ext = getFileExtension(file);
  return textOrCodeExts.includes(ext);
};

export const isHtmlFile = file => {
  const ext = getFileExtension(file);
  return ['html', 'htm'].includes(ext);
};

export const getFileExtension = ({ url, path }) => {
  let ext = '';
  if (url) {
    const [nameWithExt] = url?.split('?');
    ext = nameWithExt?.lastIndexOf('.') > -1 ? nameWithExt?.slice(nameWithExt?.lastIndexOf('.') + 1) : nameWithExt?.slice(-3);
    if (!ext) {
      ext = url?.lastIndexOf('.') > -1 ? url?.slice(url?.lastIndexOf('.') + 1) : url?.slice(-3);
    }
  }

  if (!ext && path) {
    if (!ext) {
      ext = path?.lastIndexOf('.') > -1 ? path?.slice(path?.lastIndexOf('.') + 1) : path?.slice(-3);
    }
    if (!ext) {
      ext = path?.lastIndexOf('.') > -1 ? path?.slice(path?.lastIndexOf('.') + 1) : path?.slice(-3);
    }
  }
  return ext?.toLowerCase();
};
