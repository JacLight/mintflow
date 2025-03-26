import React from 'react';
import { getFileExtension, isImageFile } from './fm-utils';
import { ButtonDelete } from './button-delete';
import { defaultStyles, FileIcon } from './file-icon';

const MyFile: any = FileIcon;
export const FileThumbnail = ({ url, path, deleteClick, showPath = true }) => {
  const getFileIcon = () => {
    if (isImageFile({ url, path })) return <img alt={path} src={url} />;
    const ext = getFileExtension({ url, path });
    return <MyFile size={24} extension={ext} {...defaultStyles[ext]} />;
  };

  return (
    <div className="file group relative">
      <div className="file-content">{getFileIcon()}</div>
      {showPath && (
        <div className="file-info">
          <div className="text-xs">{path}</div>
          {/* <div>{prettyBytes(raw.Size)}</div> */}
        </div>
      )}
      {deleteClick && (
        <div className="hidden group-hover:flex items-center justify-center transition-all duration-200 absolute bottom-0 ">
          <ButtonDelete deleteHandler={() => deleteClick(path)} />
        </div>
      )}
    </div>
  );
};
