import React, { useState, useEffect } from 'react';
import { StyledComponent } from './styling';
import { extractStylingFromSchema, getComponentPartStyling } from './styling/style-utils';
import { twMerge } from 'tailwind-merge';

interface OptionType {
  value: string;
  label: string;
  image?: string;
  icon?: string;
}

interface RankingControlProps {
  options: OptionType[];
  onChange: (rankings: Record<string, number>) => void;
  getOptionIconOrImage: (option: OptionType) => JSX.Element | null;
}

export const RankingInput = (props: {
  update;
  mode;
  schema;
  path;
  name;
  data;
  theme?;
  change?;
}) => {
  // Extract styling from schema
  const customStyling = props.schema ? extractStylingFromSchema(props.schema) : undefined;

  // Get ranking styling
  const containerClasses = getComponentPartStyling('ranking',  'container', '',  props.theme,  customStyling);
  const gridClasses = getComponentPartStyling('ranking',  'grid', '',  props.theme,  customStyling);
  const headerClasses = getComponentPartStyling('ranking',  'header', '',  props.theme,  customStyling);
  const headerLabelClasses = getComponentPartStyling('ranking',  'headerLabel', '',  props.theme,  customStyling);
  const rowClasses = getComponentPartStyling('ranking',  'row', '',  props.theme,  customStyling);
  const optionLabelClasses = getComponentPartStyling('ranking',  'optionLabel', '',  props.theme,  customStyling);
  const cellClasses = getComponentPartStyling('ranking',  'cell', '',  props.theme,  customStyling);
  const inputClasses = getComponentPartStyling('ranking',  'input', '',  props.theme,  customStyling);
  const selectClasses = getComponentPartStyling('ranking',  'select', '',  props.theme,  customStyling);
  const optionClasses = getComponentPartStyling('ranking',  'option', '',  props.theme,  customStyling);

  const [rankings, setRankings] = useState<Record<string, number>>({});

  const options: any = props.schema?.options || [];
  const topics: any = props.schema?.topics || [];

  // Initialize rankings on component mount
  useEffect(() => {
    // Initialize rankings if not already set
    if (Object.keys(rankings).length === 0 && options.length > 0) {
      const initialRankings = options.reduce((acc, option, index) => {
        acc[option.value] = index + 1;
        return acc;
      }, {} as Record<string, number>);
      setRankings(initialRankings);
    }
  }, [options, rankings]);

  const handleSelectChange = (optionName: string, rank: number) => {
    const newRankings = { ...rankings, [optionName]: rank };
    setRankings(newRankings);

    // Notify parent component of change
    if (props.change) {
      props.change(newRankings);
    }

    if (props.update) {
      props.update(props.path, newRankings);
    }
  };

  const getInput = (option) => {
    const variant = props.schema['x-control-variant'] || 'select';

    switch (variant) {
      case 'checkbox':
        return (
          <StyledComponent
            componentType="ranking"
            part="input"
            schema={props.schema}
            theme={props.theme}
            as="input"
            type="checkbox"
            checked={!!rankings[option.value]}
            onChange={(e) => handleSelectChange(option.value, e.target.checked ? 1 : 0)}
            className="border border-gray-300 rounded h-4 w-4"
            aria-label={`Rank ${option.label}`}
          />
        );
      case 'radio':
        return (
          <StyledComponent
            componentType="ranking"
            part="input"
            schema={props.schema}
            theme={props.theme}
            as="input"
            type="radio"
            checked={rankings[option.value] === 1}
            onChange={(e) => handleSelectChange(option.value, e.target.checked ? 1 : 0)}
            className="border border-gray-300 rounded h-4 w-4"
            aria-label={`Rank ${option.label}`}
          />
        );
      case 'slider':
        return (
          <StyledComponent
            componentType="ranking"
            part="input"
            schema={props.schema}
            theme={props.theme}
            as="input"
            type="range"
            value={rankings[option.value] || 1}
            min={1}
            max={options.length}
            onChange={(e) => handleSelectChange(option.value, parseInt(e.target.value))}
            className="w-full"
            aria-label={`Rank ${option.label}`}
          />
        );
      case 'number':
        return (
          <StyledComponent
            componentType="ranking"
            part="input"
            schema={props.schema}
            theme={props.theme}
            as="input"
            type="number"
            value={rankings[option.value] || 1}
            min={1}
            max={options.length}
            onChange={(e) => handleSelectChange(option.value, parseInt(e.target.value))}
            className="border border-gray-300 rounded px-2 py-1 w-full"
            aria-label={`Rank ${option.label}`}
          />
        );
      default:
        return (
          <StyledComponent
            componentType="ranking"
            part="select"
            schema={props.schema}
            theme={props.theme}
            as="select"
            value={rankings[option.value] || 1}
            onChange={(e) => handleSelectChange(option.value, parseInt(e.target.value))}
            className="border border-gray-300 rounded px-2 py-1 w-full"
            aria-label={`Rank ${option.label}`}
          >
            {options.map((_, i) => (
              <StyledComponent
                key={i}
                componentType="ranking"
                part="option"
                schema={props.schema}
                theme={props.theme}
                as="option"
                value={i + 1}
              >
                {i + 1}
              </StyledComponent>
            ))}
          </StyledComponent>
        );
    }
  };

  // Calculate grid template columns based on number of topics
  const gridTemplateColumns = `repeat(${topics.length + 1}, minmax(0, 1fr))`;

  return (
    <StyledComponent
      componentType="ranking"
      part="container"
      schema={props.schema}
      theme={props.theme}
      className="w-full"
    >
      <StyledComponent
        componentType="ranking"
        part="grid"
        schema={props.schema}
        theme={props.theme}
        as="div"
        className="grid"
        style={{ gridTemplateColumns }}
      >
        {/* Headers */}
        <StyledComponent
          componentType="ranking"
          part="header"
          schema={props.schema}
          theme={props.theme}
          as="div"
          className="flex items-center justify-center font-medium"
        >
          {/* Empty cell for the top-left corner */}
        </StyledComponent>

        {topics?.map((topic, index) => (
          <StyledComponent
            key={topic.value || index}
            componentType="ranking"
            part="header"
            schema={props.schema}
            theme={props.theme}
            as="div"
            className="flex items-center justify-center font-medium p-2"
          >
            <StyledComponent
              componentType="ranking"
              part="headerLabel"
              schema={props.schema}
              theme={props.theme}
              as="span"
            >
              {topic.label}
            </StyledComponent>
          </StyledComponent>
        ))}

        {/* Rows */}
        {options?.map((option, optionIndex) => (
          <React.Fragment key={option.value || optionIndex}>
            <StyledComponent
              componentType="ranking"
              part="row"
              schema={props.schema}
              theme={props.theme}
              as="div"
              className="flex items-center p-2"
            >
              <StyledComponent
                componentType="ranking"
                part="optionLabel"
                schema={props.schema}
                theme={props.theme}
                as="span"
              >
                {option.label}
              </StyledComponent>
            </StyledComponent>

            {topics?.map((topic, topicIndex) => (
              <StyledComponent
                key={`${option.value}-${topic.value || topicIndex}`}
                componentType="ranking"
                part="cell"
                schema={props.schema}
                theme={props.theme}
                as="div"
                className="flex items-center justify-center p-2"
              >
                {getInput(option)}
              </StyledComponent>
            ))}
          </React.Fragment>
        ))}
      </StyledComponent>
    </StyledComponent>
  );
};
