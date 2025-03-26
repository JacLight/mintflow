import React from 'react';
import MarkdownEditor from '../common/markdown-editor';
import { StyledComponent } from './styling';
import { extractStylingFromSchema, getComponentPartStyling } from './styling/style-utils';
import { twMerge } from 'tailwind-merge';

export const MarkdownElement = (props: {
  path;
  name;
  validate;
  value;
  change;
  blur;
  className;
  ui;
  theme;
  height?;
  schema?;
}) => {
  // Extract styling from schema
  const customStyling = props.schema ? extractStylingFromSchema(props.schema) : undefined;

  // Get markdown styling
  const containerClasses = getComponentPartStyling('markdown',  'container', '',  props.theme,  customStyling);
  const editorClasses = getComponentPartStyling('markdown',  'editor', '',  props.theme,  customStyling);

  const handleChange = (value: string) => {
    if (props.change) {
      props.change(value);
    }
  };

  const handleBlur = () => {
    if (props.blur) {
      props.blur(props.value);
    }
  };

  return (
    <StyledComponent
      componentType="markdown"
      part="container"
      schema={props.schema}
      theme={props.theme}
      className={twMerge("markdown-element-container", props.className)}
    >
      <StyledComponent
        componentType="markdown"
        part="editor"
        schema={props.schema}
        theme={props.theme}
        as="div"
        className="w-full"
      >
        <MarkdownEditor
          value={props.value || ''}
          onChange={handleChange}
          height={props.height || 300}
          preview="live"
        />
      </StyledComponent>
    </StyledComponent>
  );
};
