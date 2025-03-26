import { CommonColorPicker } from '../common/color-picker';
import { twMerge } from 'tailwind-merge';
import React from 'react';
import { StyledComponent } from './styling';
import { extractStylingFromSchema, getComponentPartStyling } from './styling/style-utils';

export const ColorElement = (props: { path; name; value; blur, schema, theme, className }) => {
  const prop: any = {};

  const handleUpdate = color => {
    if (props.blur) {
      props.blur(color?.hex || color);
    }
  };

  const { position, displayStyle, popup, icon, toggle } = props.schema || {};
  const variant = props.schema ? props.schema['x-control-variant'] : 'text';

  // Extract styling from schema
  const customStyling = extractStylingFromSchema(props.schema);

  // Get color picker styling
  const containerClasses = getComponentPartStyling('color',  'container', '',  props.theme,  customStyling);
  const inputClasses = getComponentPartStyling('color',  'input', '',  props.theme,  customStyling);
  const previewClasses = getComponentPartStyling('color',  'preview', '',  props.theme,  customStyling);
  const paletteClasses = getComponentPartStyling('color',  'palette', '',  props.theme,  customStyling);
  const paletteItemClasses = getComponentPartStyling('color',  'paletteItem', '',  props.theme,  customStyling);

  return (
    <StyledComponent
      componentType="color"
      part="container"
      schema={props.schema}
      theme={props.theme}
    >
      <CommonColorPicker
        className={twMerge(inputClasses, props.className)}
        type={variant}
        icon={icon || 'MdFormatColorFill'}
        toggle={toggle}
        updateColor={handleUpdate}
        color={props.value}
        // Pass styling through the style prop since the component doesn't accept the specific class props
        style={{
          preview: previewClasses,
          palette: paletteClasses,
          paletteItem: paletteItemClasses
        }}
      />
    </StyledComponent>
  );
};
{/* <ColorPicker palette={palette} onChange={handleChange} value={value} defaultValue={value} /> */ }
