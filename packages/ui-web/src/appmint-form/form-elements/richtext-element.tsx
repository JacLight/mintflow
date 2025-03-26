import React from 'react';
import RichTextEditor from '../common/richtext-editor';
import { StyledComponent } from './styling';
import { extractStylingFromSchema, getComponentPartStyling } from './styling/style-utils';
import { twMerge } from 'tailwind-merge';

export const RichtextElement = (props: {
  change;
  focus;
  blur;
  mode;
  value;
  schema;
  path;
  name;
  data;
  height?;
  theme?;
}) => {
  // Extract styling from schema
  const customStyling = props.schema ? extractStylingFromSchema(props.schema) : undefined;

  // Get richtext styling
  const containerClasses = getComponentPartStyling('richtext',  'container', '',  props.theme,  customStyling);
  const editorClasses = getComponentPartStyling('richtext',  'editor', '',  props.theme,  customStyling);

  const handleChange = (content: string) => {
    if (props.change) {
      props.change(content);
    }
  };

  const handleBlur = () => {
    if (props.blur) {
      props.blur(props.value);
    }
  };

  const handleFocus = () => {
    if (props.focus) {
      props.focus();
    }
  };

  return (
    <StyledComponent
      componentType="richtext"
      part="container"
      schema={props.schema}
      theme={props.theme}
      className="w-full"
    >
      <StyledComponent
        componentType="richtext"
        part="editor"
        schema={props.schema}
        theme={props.theme}
        as="div"
        className="w-full"
      >
        <RichTextEditor
          value={props.value || ''}
          onChange={handleChange}
          height={props.height || 300}
          menubar="file edit view insert format tools table help"
        />
      </StyledComponent>
    </StyledComponent>
  );
};
