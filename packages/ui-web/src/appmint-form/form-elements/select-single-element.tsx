import React from 'react';
import { SwitchElement } from './switch-element';
import { StyledComponent } from './styling';
import { extractStylingFromSchema } from './styling/style-utils';

export const SelectSingleElement = (props: { change; blur; focus; value; mode; schema; path; name; data, ui?, theme?, className?}) => {
  const handleUpdate = e => {
    e.preventDefault();
    props.change(e.target.value);
  };

  // Extract styling from schema
  const customStyling = extractStylingFromSchema(props.schema);

  const variant = props.schema['x-control-variant'] || 'text';
  if (variant === 'checkbox' || variant === 'radio') {
    return (
      <StyledComponent
        componentType="select-single"
        part="container"
        schema={props.schema}
        theme={props.theme}
        className={props.className}
      >
        <StyledComponent
          componentType="select-single"
          part="input"
          schema={props.schema}
          theme={props.theme}
          as="input"
          name={props.name}
          id={props.path}
          aria-describedby="candidates-description"
          type={variant}
          value={props.value}
          onChange={handleUpdate}
          title={props.schema.title || props.name}
          aria-label={props.schema.title || props.name}
          className={variant === 'radio' ? 'rounded-full' : 'rounded'}
        />
      </StyledComponent>
    );
  }

  return (
    <StyledComponent
      componentType="select-single"
      part="container"
      schema={props.schema}
      theme={props.theme}
      className={props.className}
    >
      <SwitchElement {...props} />
    </StyledComponent>
  );
};
