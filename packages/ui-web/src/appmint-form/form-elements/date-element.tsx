import React, { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { StyledComponent } from './styling';
import { extractStylingFromSchema, getComponentPartStyling } from './styling/style-utils';

export const DateElement = (props: { readOnly?; change; dataPath, focus; blur; mode; value; schema; path; name; data, className, theme?, ui?}) => {
  const [dateTime, setDateTime] = useState<any>();
  let variant = props.schema['format'] || props.schema['x-control-variant'] || 'date';
  variant = (variant === 'datetime' || variant === 'date-time') ? 'date-time' : variant;

  useEffect(() => {
    if (props.value) {
      setDateTime(new Date(props.value));
    }
  }, []);

  const getDateFromValue = e => {
    const date = new Date(e.target.value);
    if (date.toString() === 'Invalid Date') {
      return '';
    } else {
      return date.toISOString();
    }
  };

  const handleBlur = e => {
    e.preventDefault();
    props.blur(getDateFromValue(e));
  };

  const handleChange = ({ startDate, endDate }) => {
    let newDate;
    if (variant === 'date') {
      newDate = new Date(startDate);
    } else if (variant === 'time') {
      newDate = startDate;
      props.blur(startDate);
      return;
    } else {
      newDate = new Date(startDate);
    }
    if (newDate.toString() === 'Invalid Date') return;
    props.blur(newDate.toISOString());
  };

  const handleFocus = e => {
    e.preventDefault();
    props.focus(e.target.value);
  };

  const { min, max, placeholder } = props.schema;

  // Extract styling from schema
  const customStyling = extractStylingFromSchema(props.schema);

  // Get date styling
  return (
    <StyledComponent
      componentType="date"
      part="container"
      schema={props.schema}
      theme={props.theme}
      className="flex items-center"
    >
      {props.schema.prefix && (
        <StyledComponent
          componentType="date"
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
        startDate={dateTime}
        min={min}
        max={max}
        mode={variant}
        isRange={false}
        placeholder={placeholder}
      />
      {props.schema.suffix && (
        <StyledComponent
          componentType="date"
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
