import React, { useState, useEffect } from 'react';
import { isNotEmpty } from '../utils';
import { CustomFileUpload } from '../common/common-file-upload';
import { StyledComponent } from './styling';
import { extractStylingFromSchema, getComponentPartStyling } from './styling/style-utils';
import { twMerge } from 'tailwind-merge';
import { CommonFilePicker } from '@ui/components/common/input/CommonFilePicker';

interface FileElementProps {
  change?: (value: any) => void;
  focus?: () => void;
  blur?: (value: any) => void;
  mode?: string;
  value?: any;
  schema?: any;
  path?: string;
  name?: string;
  data?: any;
  theme?: any;
  className?: string;
}

interface FileData {
  path: string;
  url: string;
}

export const FileElement: React.FC<FileElementProps> = (props) => {
  // Extract styling from schema
  const customStyling = props.schema ? extractStylingFromSchema(props.schema) : undefined;

  // Get file-element styling
  const containerClasses = getComponentPartStyling('file-element', 'container', '', props.theme, customStyling);
  const dropzoneClasses = getComponentPartStyling('file-element', 'dropzone', '', props.theme, customStyling);
  const dropzoneActiveClasses = getComponentPartStyling('file-element', 'dropzoneActive', '', props.theme, customStyling);
  const buttonClasses = getComponentPartStyling('file-element', 'button', '', props.theme, customStyling);
  const fileListClasses = getComponentPartStyling('file-element', 'fileList', '', props.theme, customStyling);
  const fileItemClasses = getComponentPartStyling('file-element', 'fileItem', '', props.theme, customStyling);
  const filePreviewClasses = getComponentPartStyling('file-element', 'filePreview', '', props.theme, customStyling);
  const fileInfoClasses = getComponentPartStyling('file-element', 'fileInfo', '', props.theme, customStyling);
  const fileNameClasses = getComponentPartStyling('file-element', 'fileName', '', props.theme, customStyling);
  const fileSizeClasses = getComponentPartStyling('file-element', 'fileSize', '', props.theme, customStyling);
  const progressBarClasses = getComponentPartStyling('file-element', 'progressBar', '', props.theme, customStyling);
  const deleteButtonClasses = getComponentPartStyling('file-element', 'deleteButton', '', props.theme, customStyling);
  const errorMessageClasses = getComponentPartStyling('file-element', 'errorMessage', '', props.theme, customStyling);

  const [eValue, setEValue] = useState<FileData[]>([]);

  useEffect(() => {
    if (isNotEmpty(props.value)) {
      let newValue: FileData[] = [];

      if (Array.isArray(props.value)) {
        if (props.value[0]?.path) {
          newValue = props.value;
        } else {
          newValue = props.value.map(v => ({ path: v, url: v }));
        }
      } else if (typeof props.value === 'object' && props.value !== null) {
        newValue = [props.value as FileData];
      } else if (typeof props.value === 'string') {
        newValue = [{ path: props.value, url: props.value }];
      }

      setEValue(newValue);
    } else {
      setEValue([]);
    }
  }, [props.value]);

  const handleFilePicked = (files: FileData[]) => {
    if (!props.blur) return;

    const simpleFiles = files?.map(file => ({ path: file.path, url: file.url }));
    const [_file] = simpleFiles || [];

    if (props.schema?.type === 'array') {
      props.blur(simpleFiles);
    } else if (props.schema?.type === 'object') {
      props.blur(_file);
    } else {
      props.blur(_file?.url || '');
    }
  };

  const handleFileUpload = (data: any) => {
    if (!props.blur) return;

    const file = { path: data.path, url: data.url };

    if (props.schema?.type === 'array') {
      if (eValue.length >= (props.schema.maxItems || Infinity)) return;
      const newFiles = [...(eValue || []), file];
      props.blur(newFiles);
    } else if (props.schema?.type === 'object') {
      props.blur(file);
    } else {
      props.blur(file.url);
    }
  };

  const variant = props.schema?.['x-control-variant']
  const location = props.schema?.location || '/';
  const max = props.schema.type === 'object' ? 1 : props.schema.maxItems ? props.schema.maxItems : undefined;

  return (
    <StyledComponent
      componentType="file-element"
      part="container"
      schema={props.schema}
      theme={props.theme}
      className={twMerge("w-full", props.className)}
    >
      {variant === 'file' ?
        <CustomFileUpload location={location} onFileUpload={handleFileUpload} />
        :
        <CommonFilePicker files={eValue} handleFilePicked={handleFilePicked} max={max} hideSelection={props.schema?.hideSelection} />
      }
    </StyledComponent>
  );
};
