import React from 'react';
import { StyledComponent } from './styling';
import { extractStylingFromSchema, getComponentPartStyling } from './styling/style-utils';

export const ParagraphElement = ({ schema, name, value, theme, path }) => {
  // Extract styling from schema
  const customStyling = extractStylingFromSchema(schema);

  // Get paragraph styling
  const containerClasses = getComponentPartStyling('paragraph',  'container', '',  theme,  customStyling);

  return (
    <StyledComponent
      componentType="paragraph"
      part="container"
      schema={schema}
      theme={theme}
      className="w-full p-2"
      id={name}
      dangerouslySetInnerHTML={{ __html: value || schema?.default || 'Paragraph Content Here' }}
    />
  );
};
