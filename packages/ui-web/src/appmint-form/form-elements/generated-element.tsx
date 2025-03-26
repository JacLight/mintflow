import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { IconRenderer } from '../common/icons/icon-renderer';
import { StyledComponent } from './styling';
import { extractStylingFromSchema, getComponentPartStyling } from './styling/style-utils';
import { twMerge } from 'tailwind-merge';

interface GeneratedElementProps {
  path?: string;
  name?: string;
  schema?: any;
  theme?: any;
  className?: string;
  value?: string;
  change?: (value: string) => void;
  blur?: (value: string) => void;
}

export const GeneratedElement: React.FC<GeneratedElementProps> = (props) => {
  // Extract styling from schema
  const customStyling = props.schema ? extractStylingFromSchema(props.schema) : undefined;

  // Get generated element styling
  const containerClasses = getComponentPartStyling('generated-element',  'container', '',  props.theme,  customStyling);
  const valueClasses = getComponentPartStyling('generated-element',  'value', '',  props.theme,  customStyling);
  const buttonClasses = getComponentPartStyling('generated-element',  'button', '',  props.theme,  customStyling);
  const iconClasses = getComponentPartStyling('generated-element',  'icon', '',  props.theme,  customStyling);

  const [value, setValue] = useState<string | undefined>(props.value);

  // Update state when props.value changes
  useEffect(() => {
    if (props.value) {
      setValue(props.value);
    }
  }, [props.value]);

  const handleUpdate = () => {
    const uuid = uuidv4();
    setValue(uuid);

    // Notify parent components
    if (props.change) {
      props.change(uuid);
    }

    if (props.blur) {
      props.blur(uuid);
    }
  };

  return (
    <StyledComponent
      componentType="generated-element"
      part="container"
      schema={props.schema}
      theme={props.theme}
      className={twMerge("flex items-center justify-between p-4 text-sm", props.className)}
    >
      <StyledComponent
        componentType="generated-element"
        part="value"
        schema={props.schema}
        theme={props.theme}
        as="span"
        className="font-serif"
      >
        {value}
      </StyledComponent>

      <StyledComponent
        componentType="generated-element"
        part="button"
        schema={props.schema}
        theme={props.theme}
        as="button"
        title="Regenerate"
        className="p-1 rounded-full shadow bg-white"
        onClick={handleUpdate}
        aria-label="Generate new UUID"
      >
        <StyledComponent
          componentType="generated-element"
          part="icon"
          schema={props.schema}
          theme={props.theme}
        >
          <IconRenderer icon="RefreshCcw" />
        </StyledComponent>
      </StyledComponent>
    </StyledComponent>
  );
};
