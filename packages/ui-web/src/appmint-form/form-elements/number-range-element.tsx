import React, { useState, useEffect } from 'react';
import { SliderRangeElement } from './slider-range';
import { StyledComponent } from './styling';
import { extractStylingFromSchema, getComponentPartStyling } from './styling/style-utils';
import { twMerge } from 'tailwind-merge';

interface NumberRangeElementProps {
  change?: (value: [number, number]) => void;
  blur?: (value: [number, number]) => void;
  focus?: (value: [number, number]) => void;
  mode?: string;
  schema?: any;
  path?: string;
  name?: string;
  value?: [number, number];
  theme?: any;
  storeId?: string;
}

export const NumberRangeElement: React.FC<NumberRangeElementProps> = (props) => {
  // Extract styling from schema
  const customStyling = props.schema ? extractStylingFromSchema(props.schema) : undefined;

  // Get number range styling
  const containerClasses = getComponentPartStyling('number-range', 'container', '', props.theme, customStyling);
  const minInputContainerClasses = getComponentPartStyling('number-range', 'minInputContainer', '', props.theme, customStyling);
  const maxInputContainerClasses = getComponentPartStyling('number-range', 'maxInputContainer', '', props.theme, customStyling);
  const minInputClasses = getComponentPartStyling('number-range', 'minInput', '', props.theme, customStyling);
  const maxInputClasses = getComponentPartStyling('number-range', 'maxInput', '', props.theme, customStyling);
  const separatorClasses = getComponentPartStyling('number-range', 'separator', '', props.theme, customStyling);

  const [minMax, setMinMax] = useState<[number, number]>(props.value || [0, 0]);

  // Update state when props.value changes
  useEffect(() => {
    if (props.value) {
      setMinMax(props.value);
    }
  }, [props.value]);

  const handleUpdate = (e: React.ChangeEvent<HTMLInputElement>, minOrMax: 'min' | 'max') => {
    e.preventDefault();
    const newMinMax = [...minMax] as [number, number];

    const isNumber = !isNaN(parseFloat(e.target.value));
    if (!isNumber) return;

    const value = parseFloat(e.target.value);

    // Validate min/max constraints
    if (minOrMax === 'min' && value > minMax[1]) return;
    if (minOrMax === 'max' && value < minMax[0]) return;

    newMinMax[minOrMax === 'min' ? 0 : 1] = value;
    setMinMax(newMinMax);

    // Notify parent components
    if (props.change) {
      props.change(newMinMax);
    }

    if (props.blur) {
      props.blur(newMinMax);
    }
  };

  const handleFocus = () => {
    if (props.focus) {
      props.focus(minMax);
    }
  };

  const variant = props.schema?.['x-control-variant'] || 'number';

  // Use SliderRangeElement for slider variants
  if (variant === 'vertical' || variant === 'horizontal') {
    // Create adapter functions to handle the type differences between components
    const handleSliderBlur = (minValue: number, maxValue: number) => {
      if (props.blur) {
        props.blur([minValue, maxValue]);
      }
    };

    const handleSliderChange = (minValue: number, maxValue: number) => {
      if (props.change) {
        props.change([minValue, maxValue]);
      }
    };

    return (
      <SliderRangeElement
        blur={handleSliderBlur}
        change={handleSliderChange}
        data={minMax}
        max={props.schema?.max}
        min={props.schema?.min}
        step={props.schema?.step}
        schema={props.schema}
        theme={props.theme}
        path={props.path}
        name={props.name}
        storeId={props.storeId}
      />
    );
  }

  const [min, max] = minMax || [0, 0];

  return (
    <StyledComponent
      componentType="number-range"
      part="container"
      schema={props.schema}
      theme={props.theme}
      className="flex gap-2 items-center w-full"
    >
      <StyledComponent
        componentType="number-range"
        part="minInputContainer"
        schema={props.schema}
        theme={props.theme}
        className="w-full rounded border-0 text-gray-900 bg-white/20 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:text-sm sm:leading-5"
      >
        <StyledComponent
          componentType="number-range"
          part="minInput"
          schema={props.schema}
          theme={props.theme}
          as="input"
          onChange={(e) => handleUpdate(e, 'min')}
          onFocus={handleFocus}
          value={min}
          disabled={props.schema?.disabled}
          readOnly={props.schema?.readOnly}
          type="number"
          name={props.name ? `${props.name}-min` : undefined}
          id={props.path ? `${props.path}-min` : undefined}
          className="w-full flex-1 border-0 bg-transparent text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-5"
          placeholder={props.schema?.placeholder || "Min"}
          max={props.schema?.max}
          min={props.schema?.min}
          step={props.schema?.step}
          aria-label={`Minimum ${props.schema?.title || props.name || "value"}`}
        />
      </StyledComponent>

      <StyledComponent
        componentType="number-range"
        part="separator"
        schema={props.schema}
        theme={props.theme}
        className="text-gray-500"
      >
        -
      </StyledComponent>

      <StyledComponent
        componentType="number-range"
        part="maxInputContainer"
        schema={props.schema}
        theme={props.theme}
        className="w-full rounded border-0 text-gray-900 bg-white/20 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:text-sm sm:leading-5"
      >
        <StyledComponent
          componentType="number-range"
          part="maxInput"
          schema={props.schema}
          theme={props.theme}
          as="input"
          onChange={(e) => handleUpdate(e, 'max')}
          onFocus={handleFocus}
          value={max}
          disabled={props.schema?.disabled}
          readOnly={props.schema?.readOnly}
          type="number"
          name={props.name ? `${props.name}-max` : undefined}
          id={props.path ? `${props.path}-max` : undefined}
          className="w-full flex-1 border-0 bg-transparent text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-5"
          placeholder={props.schema?.placeholder || "Max"}
          max={props.schema?.max}
          min={props.schema?.min}
          step={props.schema?.step}
          aria-label={`Maximum ${props.schema?.title || props.name || "value"}`}
        />
      </StyledComponent>
    </StyledComponent>
  );
};
