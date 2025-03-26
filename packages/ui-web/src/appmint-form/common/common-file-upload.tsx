import React, { DragEvent, useState } from 'react';
import { deleteFile, uploadWithProgress } from '../utils/rest-api';
import { ButtonDelete } from './button-delete';
import { formatBytes, isEmpty } from '../utils';

type FileWithPreview = {
  file: File;
  preview?: string;
  progress: number;
  error?: string;
};

export const CustomFileUpload = (props: { location: string, onFileUpload: (file) => void }) => {
  const [isOver, setIsOver] = useState(false);
  const [files, setFiles] = useState<FileWithPreview[]>([]);

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsOver(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsOver(false);
  };

  const handleDrop = async (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsOver(false);

    const droppedFiles = Array.from(event.dataTransfer.files).map(file => ({
      file,
      progress: 0
    }));

    setFiles(prev => [...prev, ...droppedFiles]);

    for (const fileWithPreview of droppedFiles) {
      const { file } = fileWithPreview;

      const reader = new FileReader();

      reader.onloadend = () => {
        const dataURL = reader.result as string;
        setFiles(prevFiles =>
          prevFiles.map(f =>
            f.file.name === file.name ? { ...f, preview: dataURL } : f
          )
        );
      };

      reader.readAsDataURL(file);

      // Upload logic
      const uploadedFile = await uploadWithProgress(props.location, file, progress => {
        setFiles(prevFiles =>
          prevFiles.map(f =>
            f.file.name === file.name ? { ...f, progress } : f
          )
        );
      });
      props.onFileUpload(uploadedFile);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files).map(file => ({
      file,
      progress: 0
    }));

    setFiles(prev => [...prev, ...files]);

    for (const fileWithPreview of files) {
      const { file } = fileWithPreview;

      const reader = new FileReader();

      reader.onloadend = () => {
        const dataURL = reader.result as string;
        setFiles(prevFiles =>
          prevFiles.map(f =>
            f.file.name === file.name ? { ...f, preview: dataURL } : f
          )
        );
      };

      reader.readAsDataURL(file);

      // Upload logic
      const uploadedFile = await uploadWithProgress(props.location, file, progress => {
        setFiles(prevFiles =>
          prevFiles.map(f =>
            f.file.name === file.name ? { ...f, progress } : f
          )
        );
      });
      props.onFileUpload(uploadedFile);
    }
  }

  const handleRemove = async (fileName: string) => {
    try {
      await deleteFile(props.location + fileName);
      setFiles(prevFiles => prevFiles.filter(f => f.file.name !== fileName));
    } catch (error) {
      console.error("Failed to delete file:", error);
    }
  };

  return (
    <div className='w-full bg-[#ffffffaa]'>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{ backgroundColor: isOver ? 'lightgray' : 'white' }}
        className='w-full h-20 border-2 border-gray-300 border-dashed flex justify-center items-center p-2 text-xs'
      >
        <div> Drag and drop some files here  or </div>
        <input type="file" onChange={handleFileSelect} multiple className='hidden' />
        <button className='bg-white mx-4 text-sm border-gray-300 border rounded px-4 py-1 hover:text-gray-900 hover:shadow' onClick={() => (document.querySelector('input[type=file]') as HTMLInputElement)?.click()}>Select files</button>
      </div>
      <UploadedFile files={files} handleRemove={handleRemove} />
    </div>
  );
}

const UploadedFile = ({ files, handleRemove }) => {
  if (isEmpty(files)) return null;
  return (
    <div className="space-y-4  bg-white overflow-y-auto max-h-96 p-4">
      {files.map(({ file, preview, progress, error }) => (
        <div key={file.name} className="flex items-center space-x-4 p-4 border rounded-md shadow-sm bg-white">
          {preview &&
            <img src={preview} alt={file.name} className="h-12 w-auto object-contain rounded" />
          }
          <div className="flex-grow">
            <div className="flex items-center">
              <div className="font-semibold text-sm">{file.name}</div>
              <div className="text-xs text-gray-500 ml-2">{formatBytes(file.size)}</div>
            </div>
            <progress value={progress} max={100} className="w-full mt-2 h-1 bg-gray-200"></progress>
          </div>
          <ButtonDelete deleteHandler={() => handleRemove(file.name)} />
          {error && <div className="text-red-600 text-xs mt-2">{error}</div>}
        </div>
      ))}
    </div>
  )
}
