import React, { useState } from 'react';
import { StyledComponent } from './styling';
import { extractStylingFromSchema, getComponentPartStyling } from './styling/style-utils';
import { twMerge } from 'tailwind-merge';

export const QuestionElement = (props: { update; mode; schema; path; name; data; theme }) => {
  const [minMax, setMinMax] = useState(props.data || [0, 0]);

  // Extract styling from schema
  const customStyling = props.schema ? extractStylingFromSchema(props.schema) : undefined;

  // Get question styling
  const containerClasses = getComponentPartStyling('question',  'container', '',  props.theme,  customStyling);
  const labelClasses = getComponentPartStyling('question',  'label', '',  props.theme,  customStyling);
  const inputClasses = getComponentPartStyling('question',  'input', '',  props.theme,  customStyling);
  const rangeClasses = getComponentPartStyling('question',  'range', '',  props.theme,  customStyling);

  const handleUpdate = (e, minOrMax) => {
    e.preventDefault();
    const newMinMax = [...minMax];

    const isNumber = !isNaN(e.target.value);
    if (!isNumber) return;
    const value = parseFloat(e.target.value);
    if (minOrMax === 'min' && value > minMax[1]) return;
    if (minOrMax === 'max' && value < minMax[0]) return;
    newMinMax[minOrMax === 'min' ? 0 : 1] = e.target.value;
    setMinMax(newMinMax);
    props.update(props.path, newMinMax);
  };

  const variant = props.schema['x-control-variant'] || 'number';
  const questionText = props.schema.title || props.schema.description || 'Question';

  const [min, max] = minMax;

  return (
    <StyledComponent
      componentType="question"
      part="container"
      schema={props.schema}
      theme={props.theme}
      className="flex flex-col gap-2 w-full"
    >
      <StyledComponent
        componentType="question"
        part="label"
        schema={props.schema}
        theme={props.theme}
        as="div"
        className="text-sm font-medium"
      >
        {questionText}
      </StyledComponent>

      <StyledComponent
        componentType="question"
        part="range"
        schema={props.schema}
        theme={props.theme}
        as="div"
        className="flex gap-4 items-center"
      >
        <div className="flex items-center">
          <span className="mr-2 text-sm">Min:</span>
          <StyledComponent
            componentType="question"
            part="input"
            schema={props.schema}
            theme={props.theme}
            as="input"
            type="number"
            value={min}
            onChange={(e) => handleUpdate(e, 'min')}
            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
            aria-label="Minimum value"
          />
        </div>

        <div className="flex items-center">
          <span className="mr-2 text-sm">Max:</span>
          <StyledComponent
            componentType="question"
            part="input"
            schema={props.schema}
            theme={props.theme}
            as="input"
            type="number"
            value={max}
            onChange={(e) => handleUpdate(e, 'max')}
            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
            aria-label="Maximum value"
          />
        </div>
      </StyledComponent>
    </StyledComponent>
  );
};
