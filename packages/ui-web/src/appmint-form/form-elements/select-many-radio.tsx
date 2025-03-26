import React, { useEffect, useState } from 'react';
import { RadioGroup } from '../common/select-components';
import { CheckCircle } from 'lucide-react';
import { classNames } from '../utils';
import { ElementIcon } from './element-icon';
import { StyledComponent } from './styling';
import { extractStylingFromSchema, getComponentPartStyling } from './styling/style-utils';
import { twMerge } from 'tailwind-merge';

export const SelectManyRadio = (props: { blur?; change?; focus?; mode?; schema?; path?; name?; data?; value?; options?; dataPath?; className?; theme?}) => {
  const [selected, setSelected] = useState<any>();

  useEffect(() => {
    if (props.value) {
      const item = props.options?.find(i => i.value === props.value);
      setSelected(item);
    }
  }, [props.options]);

  const handleChange = item => {
    setSelected(item);
    props.change(item.value, item);
  };

  const options = [...(props.options || [])];
  const hideOptionLabel = props.schema ? props.schema['x-hide-option-label'] : undefined;

  // Extract styling from schema
  const customStyling = extractStylingFromSchema(props.schema);

  // Get radio styling
  const optionClasses = getComponentPartStyling('radio',  'option', '',  props.theme,  customStyling);
  const optionSelectedClasses = getComponentPartStyling('radio',  'optionSelected', '',  props.theme,  customStyling);
  const optionUnselectedClasses = getComponentPartStyling('radio',  'optionUnselected', '',  props.theme,  customStyling);
  const labelClasses = getComponentPartStyling('radio',  'label', '',  props.theme,  customStyling);
  const labelSelectedClasses = getComponentPartStyling('radio',  'labelSelected', '',  props.theme,  customStyling);
  const labelUnselectedClasses = getComponentPartStyling('radio',  'labelUnselected', '',  props.theme,  customStyling);
  const iconClasses = getComponentPartStyling('radio',  'icon', '',  props.theme,  customStyling);
  const checkmarkClasses = getComponentPartStyling('radio',  'checkmark', '',  props.theme,  customStyling);

  return (
    <StyledComponent
      componentType="radio"
      part="container"
      schema={props.schema}
      theme={props.theme}
    >
      <RadioGroup value={selected} onChange={handleChange} className="w-full">
        <StyledComponent
          componentType="radio"
          part="group"
          schema={props.schema}
          theme={props.theme}
        >
          {options.map(item => {
            const iconOrImage = <ElementIcon icon={item.icon} image={item.image} className="h-5 w-5 flex-shrink-0 rounded-full" mode={props.mode} path={props.path} />;
            return (
              <RadioGroup.Option
                key={item.value}
                value={item}
                className={({ active, checked }) =>
                  twMerge(
                    optionClasses,
                    checked ? optionSelectedClasses : optionUnselectedClasses,
                    active ? 'ring-2 ring-indigo-600 ring-offset-2' : ''
                  )
                }
              >
                {({ checked, active }) => (
                  <>
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center">
                        <div className={iconClasses}>
                          {iconOrImage}
                        </div>
                        {!hideOptionLabel && (
                          <RadioGroup.Label
                            as="span"
                            className={twMerge(
                              labelClasses,
                              checked ? labelSelectedClasses : labelUnselectedClasses
                            )}
                          >
                            {item.label}
                          </RadioGroup.Label>
                        )}
                      </div>
                      {checked && (
                        <CheckCircle className={checkmarkClasses} aria-hidden="true" />
                      )}
                    </div>
                    {item.description && (
                      <StyledComponent
                        componentType="radio"
                        part="description"
                        schema={props.schema}
                        theme={props.theme}
                        as="span"
                      >
                        {item.description}
                      </StyledComponent>
                    )}
                  </>
                )}
              </RadioGroup.Option>
            );
          })}
        </StyledComponent>
      </RadioGroup>
    </StyledComponent>
  );
};
