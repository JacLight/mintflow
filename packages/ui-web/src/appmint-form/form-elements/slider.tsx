import React, { useEffect, useState } from 'react';
import { StyledComponent } from './styling';
import { extractStylingFromSchema, getComponentPartStyling } from './styling/style-utils';
import { twMerge } from 'tailwind-merge';
import { classNames } from '../utils';

interface SliderProps {
  storeId?: string;
  name?: string;
  schema?: any;
  value?: number;
  change: (value: number) => void;
  blur?: (value: number) => void;
  focus?: (value: number) => void;
  ui?: any;
  theme?: any;
  className?: string;
  path?: string;
}

export const SliderElement: React.FC<SliderProps> = ({
  schema,
  name,
  storeId,
  value,
  change,
  blur,
  focus,
  className,
  ui,
  theme,
  path
}) => {
  // Extract styling from schema
  const customStyling = schema ? extractStylingFromSchema(schema) : undefined;

  // Get slider styling
  const containerClasses = getComponentPartStyling('slider', 'container', '', theme, customStyling);
  const trackClasses = getComponentPartStyling('slider', 'track', '', theme, customStyling);
  const thumbClasses = getComponentPartStyling('slider', 'thumb', '', theme, customStyling);
  const railClasses = getComponentPartStyling('slider', 'rail', '', theme, customStyling);
  const valueClasses = getComponentPartStyling('slider', 'value', '', theme, customStyling);
  const inputClasses = getComponentPartStyling('slider', 'input', '', theme, customStyling);

  const [sliderValue, setSliderValue] = useState<number>(value || 0);

  useEffect(() => {
    if (value !== undefined) {
      setSliderValue(value);
    }
  }, [value, storeId, name]);

  const handleBlur = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(event.target.value);
    setSliderValue(newValue);
    if (blur) {
      blur(newValue);
    }
  };

  const handleFocus = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(event.target.value);
    setSliderValue(newValue);
    if (focus) {
      focus(newValue);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(event.target.value);
    setSliderValue(newValue);
    if (change) {
      change(newValue);
    }
  };

  // Parse schema values
  let max = (schema?.max && typeof schema?.max === 'string' ? parseFloat(schema?.max) : schema?.max) || 100;
  let min = (schema?.min && typeof schema?.min === 'string' ? parseFloat(schema?.min) : schema?.min) || 0;
  let step = (schema?.step && typeof schema?.step === 'string' ? parseFloat(schema?.step) : schema?.step) || 1;

  // Calculate percentage for the gradient background
  const percentage = ((sliderValue - min) / (max - min)) * 100;

  // Format the displayed value
  const formattedValue = isNaN(sliderValue) ? '0' :
    Number.isInteger(sliderValue) ? sliderValue.toString() : sliderValue.toFixed(1);
  const variant = schema?.['x-control-variant'] || 'horizontal';

  const showInput = schema['x-show-input'];
  const showValue = schema['x-show-value'] || true;

  return (
    <StyledComponent
      componentType="slider"
      part="container"
      schema={schema}
      theme={theme}
      className={classNames("relative flex gap-4 items-center justify-between", variant === 'vertical' ? '  rotate-90 w-fit min-w-24' : 'w-full')}
    >
      <StyledComponent
        componentType="slider"
        part="track"
        schema={schema}
        theme={theme}
        className="relative w-full"
      >
        <StyledComponent
          componentType="slider"
          part="rail"
          schema={schema}
          theme={theme}
          as="div"
          className="w-full h-2 bg-gray-200 rounded-full"
        />

        <StyledComponent
          as="input"
          componentType="slider"
          part="thumb"
          schema={schema}
          theme={theme}
          key={`${storeId}-${name}`}
          type="range"
          min={min}
          max={max}
          step={step}
          value={sliderValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          title={schema?.title || name || "Slider"}
          aria-label={schema?.title || name || "Slider"}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={sliderValue}
          className="w-full h-2 absolute top-0 left-0 appearance-none cursor-pointer bg-transparent outline-none"
          style={{
            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${percentage}%, transparent ${percentage}%, transparent 100%)`,
            WebkitAppearance: 'none',
          }}
        />
      </StyledComponent>

      {showInput ? (
        <StyledComponent
          componentType="slider"
          part="input"
          schema={schema}
          theme={theme}
          as="input"
          type="number"
          min={min}
          max={max}
          step={step}
          value={sliderValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          title={schema?.title || name || "Value input"}
          aria-label={schema?.title || name || "Value input"}
          className="w-full max-w-14 bg-sky-50 rounded outline-none text-sm border border-sky-500 p-px text-right"
        />
      ) : (
        showValue && (
          <StyledComponent
            componentType="slider"
            part="value"
            schema={schema}
            theme={theme}
            as="div"
            className="text-xs font-semibold text-gray-600 min-w-8 text-right"
          >
            {formattedValue}
          </StyledComponent>
        )
      )}
    </StyledComponent>
  );
};
