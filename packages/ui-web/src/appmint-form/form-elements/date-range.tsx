import { classNames } from '../utils';
import React, { useEffect, useState } from 'react';
import { DateTimePicker } from './date-time-picker';
import { extractStylingFromSchema, getComponentPartStyling } from './styling/style-utils';
import { twMerge } from 'tailwind-merge';
import { StyledComponent } from './styling';

export const DateRangeElement = (props: {
  change;
  focus;
  blur;
  mode;
  value;
  schema;
  path;
  name;
  data;
  theme?; // Add theme prop
  ui?; // Add ui prop for backward compatibility
}) => {
  const [dateTime, setDateTime] = useState<any>();
  let variant = props.schema['x-control-variant'] || 'date';
  variant = (variant === 'date-time' || variant === 'datetime') ? 'date-time' : variant;

  useEffect(() => {
    if (Array.isArray(props.value)) {
      setDateTime(props.value);
    }
  }, []);

  const handleChange = ({ startDate, endDate }) => {
    let newDate;
    if (variant === 'time') {
      newDate = [startDate, endDate];
      props.blur([startDate, endDate]);
      return;
    } else {
      newDate = [new Date(startDate), new Date(endDate)];
    }
    if (newDate[0].toString() === 'Invalid Date') return;
    props.blur(newDate);
  };

  const handleFocus = e => {
    e.preventDefault();
    props.focus();
  };

  const { min, max, disabled, readOnly, prefix, suffix, placeholder } = props.schema;
  const [startDate, endDate] = dateTime || [null, null];
  // Extract styling from schema
  const customStyling = extractStylingFromSchema(props.schema);
  const inputClasses = getComponentPartStyling('date-range', 'input', '', props.theme, customStyling);

  return (
    <StyledComponent
      componentType="date-range"
      part="container"
      schema={props.schema}
      theme={props.theme}
      className="flex items-center"
    >
      {prefix && (
        <StyledComponent
          componentType="date-range"
          part="prefix"
          schema={props.schema}
          theme={props.theme}
        >
          {prefix}
        </StyledComponent>
      )}
      <DateTimePicker
        onChange={handleChange}
        startDate={startDate}
        endDate={endDate}
        disabled={disabled}
        readOnly={readOnly}
        min={min}
        max={max}
        mode={variant}
        isRange={true}
        className={inputClasses}
        placeholder={placeholder}
      />
      {suffix && (
        <StyledComponent
          componentType="date-range"
          part="suffix"
          schema={props.schema}
          theme={props.theme}
        >
          {suffix}
        </StyledComponent>
      )}
    </StyledComponent>
  );
};
