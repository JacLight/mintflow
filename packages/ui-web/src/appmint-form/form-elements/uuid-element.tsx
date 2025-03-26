import React, { useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { IconRenderer } from '../common/icons/icon-renderer';
import { StyledComponent } from './styling';
import { extractStylingFromSchema, getComponentPartStyling } from './styling/style-utils';
import { twMerge } from 'tailwind-merge';

interface UuidElementProps {
  path?: string;
  name?: string;
  value?: string;
  change?: (value: string) => void;
  blur?: (value: string) => void;
  focus?: () => void;
  schema?: any;
  theme?: any;
  className?: string;
}

export const UuidElement: React.FC<UuidElementProps> = (props) => {
  // Extract styling from schema
  const customStyling = props.schema ? extractStylingFromSchema(props.schema) : undefined;

  // Get uuid-element styling
  const containerClasses = getComponentPartStyling('uuid-element',  'container', '',  props.theme,  customStyling);
  const valueClasses = getComponentPartStyling('uuid-element',  'value', '',  props.theme,  customStyling);
  const buttonClasses = getComponentPartStyling('uuid-element',  'button', '',  props.theme,  customStyling);
  const iconClasses = getComponentPartStyling('uuid-element',  'icon', '',  props.theme,  customStyling);

  // State for UUID value
  const [value, setValue] = React.useState<string>(props.value || '');

  // Generate UUID on initial render if no value is provided
  useEffect(() => {
    if (!value) {
      handleUpdate();
    }
  }, []);

  // Update value when props.value changes
  useEffect(() => {
    if (props.value && props.value !== value) {
      setValue(props.value);
    }
  }, [props.value]);

  // Handle generating a new UUID
  const handleUpdate = () => {
    const uuid = uuidv4();
    setValue(uuid);

    // Notify parent component of change
    if (props.change) {
      props.change(uuid);
    }
  };

  // Handle blur event
  const handleBlur = () => {
    if (props.blur) {
      props.blur(value);
    }
  };

  // Handle focus event
  const handleFocus = () => {
    if (props.focus) {
      props.focus();
    }
  };

  return (
    <StyledComponent
      componentType="uuid-element"
      part="container"
      schema={props.schema}
      theme={props.theme}
      className={twMerge("flex items-center justify-between p-2 text-sm", props.className)}
      onBlur={handleBlur}
      onFocus={handleFocus}
    >
      <StyledComponent
        componentType="uuid-element"
        part="value"
        schema={props.schema}
        theme={props.theme}
        className="font-mono"
      >
        {value}
      </StyledComponent>
      <StyledComponent
        componentType="uuid-element"
        part="button"
        schema={props.schema}
        theme={props.theme}
        as="button"
        type="button"
        title="Regenerate UUID"
        className="p-1 rounded-full shadow bg-white hover:bg-gray-100"
        onClick={handleUpdate}
        aria-label="Regenerate UUID"
      >
        <StyledComponent
          componentType="uuid-element"
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
