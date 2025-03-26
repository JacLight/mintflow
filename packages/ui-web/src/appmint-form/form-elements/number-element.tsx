import { classNames } from '../utils';
import { getElementTheme } from '../context/store';
import { twMerge } from 'tailwind-merge';
import React, { useState } from 'react';
import { SliderElement } from './slider';
import { StyledComponent } from './styling';
import { extractStylingFromSchema, getComponentPartStyling } from './styling/style-utils';

export const NumberElement = (props: { change; blur; focus; mode; storeId; schema; path; name; value, className, ui?, theme }) => {
  const handleBlur = e => {
    e.preventDefault();
    props.blur(e.target.value * 1);
  };

  const handleChange = e => {
    e.preventDefault();
    props.change(e.target.value * 1);
  };

  const handleFocus = e => {
    e.preventDefault();
    props.focus(e.target.value * 1);
  };

  const variant = props.schema['x-control-variant'] || 'number';

  // Extract styling from schema
  const customStyling = extractStylingFromSchema(props.schema);

  // Get number styling
  const containerClasses = getComponentPartStyling('number', 'container', '', props.theme, customStyling);
  const inputClasses = getComponentPartStyling('number', 'input', '', props.theme, customStyling);
  const prefixClasses = getComponentPartStyling('number', 'prefix', '', props.theme, customStyling);
  const suffixClasses = getComponentPartStyling('number', 'suffix', '', props.theme, customStyling);
  const stepperClasses = getComponentPartStyling('number', 'stepper', '', props.theme, customStyling);
  const stepperUpClasses = getComponentPartStyling('number', 'stepperUp', '', props.theme, customStyling);
  const stepperDownClasses = getComponentPartStyling('number', 'stepperDown', '', props.theme, customStyling);

  if (variant === 'vertical' || variant === 'horizontal' || variant === 'slider') {
    return <SliderElement name={props.name} storeId={props.storeId} change={props.change} blur={props.blur} focus={props.focus} value={props.value} schema={props.schema} className={props.className} ui={props.ui} theme={props.theme} />;
  }

  const { schema } = props;
  let max = (schema?.max && typeof schema?.max === 'string' ? parseFloat(schema?.max) : schema?.max) || 100;
  let min = (schema?.min && typeof schema?.min === 'string' ? parseFloat(schema?.min) : schema?.min) || 0;
  let step = (schema?.step && typeof schema?.step === 'string' ? parseFloat(schema?.step) : schema?.step) || 1;

  return (
    <StyledComponent
      componentType="number"
      part="container"
      schema={props.schema}
      theme={props.theme}
      className="flex items-center"
    >
      {props.schema.prefix && (
        <StyledComponent
          componentType="number"
          part="prefix"
          schema={props.schema}
          theme={props.theme}
        >
          {props.schema.prefix}
        </StyledComponent>
      )}
      <StyledComponent
        componentType="number"
        part="input"
        schema={props.schema}
        theme={props.theme}
        as="input"
        key={`${props.storeId}-${props.path}-${props.name}`}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        value={props.value}
        disabled={props.schema.disabled}
        readOnly={props.schema.readOnly}
        type={variant}
        min={min}
        max={max}
        step={step}
        name={props.name}
        id={props.path}
        className={props.className}
        placeholder={props.schema.placeholder}
      />
      {props.schema.suffix && (
        <StyledComponent
          componentType="number"
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
