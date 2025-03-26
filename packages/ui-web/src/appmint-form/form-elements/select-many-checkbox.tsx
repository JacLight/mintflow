import React, { useState } from 'react';
import { ElementIcon } from './element-icon';
import { classNames } from '../utils';
import { SwitchElement } from './switch-element';
import { StyledComponent } from './styling';
import { extractStylingFromSchema, getComponentPartStyling } from './styling/style-utils';
import { twMerge } from 'tailwind-merge';

export const SelectManyCheckbox = (props: { blur; focus; mode; schema; path; name; data; options, variant, theme?, className?}) => {
  const [selections, setSelections] = useState<any[]>([]);

  const updateSelections = item => {
    if (!item) return;
    let newValue;
    if (selections.findIndex(_ => _.value === item.value) > -1) {
      newValue = selections.filter(selection => selection.value !== item.value);
      setSelections(newValue);
    } else {
      newValue = [...selections, item];
      setSelections(newValue);
    }
    props.blur(newValue);
  };

  const hideOptionLabel = props.schema ? props.schema['x-hide-option-label'] : undefined;
  const optionDirection = props.schema ? props.schema['x-hide-option-direction'] : undefined;

  // Extract styling from schema
  const customStyling = extractStylingFromSchema(props.schema);

  // Get checkbox styling
  const containerClasses = getComponentPartStyling('checkbox',  'container', '',  props.theme,  customStyling);
  const inputClasses = getComponentPartStyling('checkbox',  'input', '',  props.theme,  customStyling);
  const labelClasses = getComponentPartStyling('checkbox',  'label', '',  props.theme,  customStyling);
  const descriptionClasses = getComponentPartStyling('checkbox',  'description', '',  props.theme,  customStyling);

  const getInputType = (item, isSelected) => {
    if (props.variant === 'switch') {
      return <div><SwitchElement change={e => updateSelections(item)} value={isSelected} mode={props.mode} schema={props.schema} path={props.path} name={props.name} data={props.data} /></div>
    } else if (props.variant === 'checkbox') {
      return (
        <StyledComponent
          componentType="checkbox"
          part="input"
          schema={props.schema}
          theme={props.theme}
          as="input"
          id={`checkbox-${item.value}`}
          aria-describedby={`description-${item.value}`}
          onChange={e => updateSelections(item)}
          checked={isSelected}
          name={item.label}
          type="checkbox"
        />
      )
    }
    return <></>;
  }

  return (
    <StyledComponent
      componentType="checkbox"
      part="container"
      schema={props.schema}
      theme={props.theme}
      as="fieldset"
    >
      <legend className="sr-only">{props.schema.title || 'Options'}</legend>
      <div className={classNames(optionDirection === 'horizontal' ? 'flex gap-2 flex-wrap' : 'space-y-3', "")}>
        {props.options?.map((item: any) => {
          const isSelected = selections.findIndex(_ => _.value === item.value) > -1;
          const itemId = `checkbox-${item.value}`;
          return (
            <StyledComponent
              key={item.value}
              componentType="checkbox"
              part="option"
              schema={props.schema}
              theme={props.theme}
              as="div"
              className={classNames(
                isSelected ? "bg-cyan-100" : "",
                optionDirection === 'horizontal' ? 'w-fit p-2' : 'w-full px-2 py-1',
                "relative block group border-gray-200 text-xs border rounded-lg"
              )}
              onClick={() => updateSelections(item)}
            >
              <div className='flex gap-3 items-center'>
                <ElementIcon icon={item.icon} image={item.image} className="flex-shrink-0 rounded-full" mode={props.mode} path={props.path} />
                {getInputType(item, isSelected)}
                {item.label && !hideOptionLabel && (
                  <StyledComponent
                    componentType="checkbox"
                    part="label"
                    schema={props.schema}
                    theme={props.theme}
                    as="label"
                    htmlFor={itemId}
                  >
                    {item.label}
                  </StyledComponent>
                )}
              </div>
              {item.description && (
                <StyledComponent
                  componentType="checkbox"
                  part="description"
                  schema={props.schema}
                  theme={props.theme}
                  as="p"
                  id={`description-${item.value}`}
                >
                  {item.description}
                </StyledComponent>
              )}
            </StyledComponent>
          );
        })}
      </div>
    </StyledComponent>
  );
};
