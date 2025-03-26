import { classNames } from '../utils';
import React, { useEffect, useState } from 'react';
import { SocialTextArea } from './social-textarea';
import { twMerge } from 'tailwind-merge';
import { getElementTheme } from '../context/store';
import { StyledComponent } from './styling';
import { extractStylingFromSchema, getComponentPartStyling } from './styling/style-utils';

export const TextElement = (props: { readOnly?; change; dataPath, focus; blur; mode; value; schema; path; name; data, className, theme?, ui?}) => {
  const [_value, setValue] = useState(props.value);

  useEffect(() => {
    if (props.schema?.dataBind) {

    }
  }, [props.value, props.schema]);


  const handleBlur = e => {
    e.preventDefault();
    props.blur(e.target.value);
  };

  const handleChange = e => {
    e.preventDefault();
    props.change(e.target.value);
  };

  const handleFocus = e => {
    e.preventDefault();
    props.focus(e.target.value);
  };

  const variant = props.schema['x-control-variant'] || 'text';

  // Extract styling from schema
  const customStyling = extractStylingFromSchema(props.schema);

  // Get text styling
  const containerClasses = getComponentPartStyling('text',  'container', '',  props.theme,  customStyling);
  const inputClasses = getComponentPartStyling('text',  'input', '',  props.theme,  customStyling);
  const textareaClasses = getComponentPartStyling('textarea',  'textarea', '',  props.theme,  customStyling);
  const prefixClasses = getComponentPartStyling('text',  'prefix', '',  props.theme,  customStyling);
  const suffixClasses = getComponentPartStyling('text',  'suffix', '',  props.theme,  customStyling);

  if (variant === 'textarea') {
    return <SocialTextArea change={props.change} blur={props.blur} focus={props.focus} value={props.value} name={props.name} id={props.path} schema={props.schema} />;
  }
  if (variant === 'textarea') {
    return (
      <StyledComponent
        componentType="textarea"
        part="textarea"
        schema={props.schema}
        theme={props.theme}
        as="textarea"
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        value={props.value}
        disabled={props.schema.disabled}
        readOnly={props.readOnly || props.schema.readOnly}
        name={props.name}
        id={props.path}
        rows={4}
        className={props.className}
        placeholder={props.schema.placeholder}
      />
    );
  }
  return (
    <StyledComponent
      componentType="text"
      part="container"
      schema={props.schema}
      theme={props.theme}
      className="flex items-center"
    >
      {props.schema.prefix && (
        <StyledComponent
          componentType="text"
          part="prefix"
          schema={props.schema}
          theme={props.theme}
        >
          {props.schema.prefix}
        </StyledComponent>
      )}
      <StyledComponent
        componentType="text"
        part="input"
        schema={props.schema}
        theme={props.theme}
        as="input"
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        value={props.value}
        disabled={props.schema.disabled}
        readOnly={props.readOnly || props.schema.readOnly}
        type={variant}
        name={props.name}
        id={props.path}
        className={props.className}
        placeholder={props.schema.placeholder}
      />
      {props.schema.suffix && (
        <StyledComponent
          componentType="text"
          part="suffix"
          schema={props.schema}
          theme={props.theme}
        >
          {props.schema.suffix}
        </StyledComponent>
      )}
    </StyledComponent>
  );
};
