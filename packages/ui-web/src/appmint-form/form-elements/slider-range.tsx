import React, { useState, useEffect } from 'react';
import { StyledComponent } from './styling';
import { extractStylingFromSchema, getComponentPartStyling } from './styling/style-utils';
import { twMerge } from 'tailwind-merge';
import { classNames } from '../utils';

interface SliderRangeProps {
  min?: number;
  max?: number;
  step?: number;
  data?: [number, number];
  blur?: (minValue: number, maxValue: number) => void;
  change?: (minValue: number, maxValue: number) => void;
  schema?: any;
  theme?: any;
  path?: string;
  name?: string;
  storeId?: string;
}

export const SliderRangeElement: React.FC<SliderRangeProps> = ({
  min = 0,
  max = 100,
  step = 1,
  data = [0, 0],
  blur,
  change,
  schema,
  theme,
  path,
  name,
  storeId,
}) => {
  // Extract styling from schema
  const customStyling = schema ? extractStylingFromSchema(schema) : undefined;

  // Get slider range styling
  const containerClasses = getComponentPartStyling('slider-range', 'container', '', theme, customStyling);
  const trackClasses = getComponentPartStyling('slider-range', 'track', '', theme, customStyling);
  const thumbClasses = getComponentPartStyling('slider-range', 'thumb', '', theme, customStyling);
  const railClasses = getComponentPartStyling('slider-range', 'rail', '', theme, customStyling);
  const valueClasses = getComponentPartStyling('slider-range', 'value', '', theme, customStyling);
  const inputClasses = getComponentPartStyling('slider-range', 'input', '', theme, customStyling);

  // Parse schema values if provided
  const schemaMin = schema?.min !== undefined ?
    (typeof schema.min === 'string' ? parseFloat(schema.min) : schema.min) : min;
  const schemaMax = schema?.max !== undefined ?
    (typeof schema.max === 'string' ? parseFloat(schema.max) : schema.max) : max;
  const schemaStep = schema?.step !== undefined ?
    (typeof schema.step === 'string' ? parseFloat(schema.step) : schema.step) : step;

  // Use schema values if available, otherwise use props
  const actualMin = schemaMin !== undefined ? schemaMin : min;
  const actualMax = schemaMax !== undefined ? schemaMax : max;
  const actualStep = schemaStep !== undefined ? schemaStep : step;

  console.log('actualMin', actualMin);
  const [minValue, setMinValue] = useState(data[0] || actualMin);
  const [maxValue, setMaxValue] = useState(data[1] || actualMax);
  const [initDone, setInitDone] = useState(false);

  // Update state when data prop changes
  useEffect(() => {
    setInitDone(true);
  }, []);

  useEffect(() => {
    if (initDone && data && Array.isArray(data) && data.length === 2) {
      setMinValue(data[0]);
      setMaxValue(data[1]);
    }
  }, [data]);

  const handleMinChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(event.target.value, 10);
    if (newValue <= maxValue) {
      setMinValue(newValue);

      if (change) {
        change(newValue, maxValue);
      }
    }
  };

  const handleMaxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(event.target.value, 10);
    if (newValue >= minValue) {
      setMaxValue(newValue);

      if (change) {
        change(minValue, newValue);
      }
    }
  };

  const handleMinBlur = () => {
    if (blur) {
      blur(minValue, maxValue);
    }
  };

  const handleMaxBlur = () => {
    if (blur) {
      blur(minValue, maxValue);
    }
  };

  // Calculate percentages for the gradient backgrounds
  const minPercentage = ((minValue - actualMin) / (actualMax - actualMin)) * 100;
  const maxPercentage = ((maxValue - actualMin) / (actualMax - actualMin)) * 100;
  const variant = schema?.['x-control-variant'] || 'horizontal';

  // Format the displayed values
  const formattedMinValue = Number.isInteger(minValue) ? minValue.toString() : minValue.toFixed(1);
  const formattedMaxValue = Number.isInteger(maxValue) ? maxValue.toString() : maxValue.toFixed(1);

  const showInput = schema['x-show-input'];
  const showValue = schema['x-show-value'] || true;

  return (
    <StyledComponent
      componentType="slider-range"
      part="container"
      schema={schema}
      theme={theme}
      className={classNames("flex items-center gap-4", variant === 'vertical' ? 'rotate-90 w-fit min-w-24' : 'w-full')}
    >
      <StyledComponent
        componentType="slider-range"
        part="track"
        schema={schema}
        theme={theme}
        className="relative w-full h-2"
      >
        {/* Rail background */}
        <StyledComponent
          componentType="slider-range"
          part="rail"
          schema={schema}
          theme={theme}
          as="div"
          className="w-full h-2 bg-gray-200 rounded-full absolute"
        />

        {/* Selected range indicator */}
        <div
          className="absolute h-2 bg-blue-500 rounded-full"
          style={{
            left: `${minPercentage}%`,
            width: `${maxPercentage - minPercentage}%`
          }}
        />

        {/* We need a different approach to make both thumbs work */}
        <div className="relative w-full h-2">
          {/* Min thumb - custom implementation */}
          <div
            className="absolute w-4 h-4 bg-white border-2 border-blue-500 rounded-full cursor-pointer -mt-1 -ml-2 z-10"
            style={{
              left: `${minPercentage}%`
            }}
            onMouseDown={(e) => {
              e.preventDefault(); // Prevent text selection during drag

              // Get initial position and track dimensions
              const trackElement = e.currentTarget.parentElement;
              if (!trackElement) return;

              const trackRect = trackElement.getBoundingClientRect();
              const trackWidth = trackRect.width;
              const trackLeft = trackRect.left;
              const range = actualMax - actualMin;

              // Store the current value for the blur callback
              let currentMinValue = minValue;

              const handleMouseMove = (moveEvent: MouseEvent) => {
                // Calculate position as percentage of track width
                const mouseX = Math.max(trackLeft, Math.min(trackLeft + trackWidth, moveEvent.clientX));
                const positionPercentage = (mouseX - trackLeft) / trackWidth;

                // Calculate new value based on position percentage
                let newValue = actualMin + (positionPercentage * range);

                // Apply step if needed
                if (actualStep > 0) {
                  newValue = Math.round(newValue / actualStep) * actualStep;
                }

                // Constrain to min/max and ensure it doesn't exceed maxValue
                newValue = Math.max(actualMin, Math.min(maxValue, newValue));

                // Only update if value changed
                if (newValue !== currentMinValue) {
                  currentMinValue = newValue;
                  setMinValue(newValue);
                  if (change) change(newValue, maxValue);
                }
              };

              const handleMouseUp = () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
                if (blur) blur(currentMinValue, maxValue);
              };

              document.addEventListener('mousemove', handleMouseMove);
              document.addEventListener('mouseup', handleMouseUp);
            }}
          />

          {/* Max thumb - custom implementation */}
          <div
            className="absolute w-4 h-4 bg-white border-2 border-blue-500 rounded-full cursor-pointer -mt-1 -ml-2 z-20"
            style={{
              left: `${maxPercentage}%`
            }}
            onMouseDown={(e) => {
              e.preventDefault(); // Prevent text selection during drag

              // Get initial position and track dimensions
              const trackElement = e.currentTarget.parentElement;
              if (!trackElement) return;

              const trackRect = trackElement.getBoundingClientRect();
              const trackWidth = trackRect.width;
              const trackLeft = trackRect.left;
              const range = actualMax - actualMin;

              // Store the current value for the blur callback
              let currentMaxValue = maxValue;

              const handleMouseMove = (moveEvent: MouseEvent) => {
                // Calculate position as percentage of track width
                const mouseX = Math.max(trackLeft, Math.min(trackLeft + trackWidth, moveEvent.clientX));
                const positionPercentage = (mouseX - trackLeft) / trackWidth;

                // Calculate new value based on position percentage
                let newValue = actualMin + (positionPercentage * range);

                // Apply step if needed
                if (actualStep > 0) {
                  newValue = Math.round(newValue / actualStep) * actualStep;
                }

                // Constrain to min/max and ensure it doesn't go below minValue
                newValue = Math.max(minValue, Math.min(actualMax, newValue));

                // Only update if value changed
                if (newValue !== currentMaxValue) {
                  currentMaxValue = newValue;
                  setMaxValue(newValue);
                  if (change) change(minValue, newValue);
                }
              };

              const handleMouseUp = () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
                if (blur) blur(minValue, currentMaxValue);
              };

              document.addEventListener('mousemove', handleMouseMove);
              document.addEventListener('mouseup', handleMouseUp);
            }}
          />
        </div>
      </StyledComponent>

      {/* Value display options */}
      {showInput ? (
        <div className="flex justify-between items-center gap-2">
          <StyledComponent
            componentType="slider-range"
            part="input"
            schema={schema}
            theme={theme}
            as="input"
            type="number"
            min={actualMin}
            max={maxValue}
            step={actualStep}
            value={minValue}
            onChange={handleMinChange}
            onBlur={handleMinBlur}
            title={`Minimum ${schema?.title || name || "value"}`}
            aria-label={`Minimum ${schema?.title || name || "value"}`}
            className="w-14 bg-sky-50 rounded outline-none text-sm border border-sky-500 p-px text-right"
          />
          <span className="text-xs font-semibold text-gray-600">to</span>
          <StyledComponent
            componentType="slider-range"
            part="input"
            schema={schema}
            theme={theme}
            as="input"
            type="number"
            min={minValue}
            max={actualMax}
            step={actualStep}
            value={maxValue}
            onChange={handleMaxChange}
            onBlur={handleMaxBlur}
            title={`Maximum ${schema?.title || name || "value"}`}
            aria-label={`Maximum ${schema?.title || name || "value"}`}
            className="w-14 bg-sky-50 rounded outline-none text-sm border border-sky-500 p-px text-right"
          />
        </div>
      ) : (
        showValue && (
          <div className="flex gap-4 items-center min-w-8">
            <StyledComponent
              componentType="slider-range"
              part="value"
              schema={schema}
              theme={theme}
              as="div"
              className="text-xs font-semibold text-gray-600  text-right"
            >
              {formattedMinValue}
            </StyledComponent>
            <StyledComponent
              componentType="slider-range"
              part="value"
              schema={schema}
              theme={theme}
              as="div"
              className="text-xs font-semibold text-gray-600  text-right"
            >
              {formattedMaxValue}
            </StyledComponent>
          </div>
        )
      )}
    </StyledComponent>
  );
};
