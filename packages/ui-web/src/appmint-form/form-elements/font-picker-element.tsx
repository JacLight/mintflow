import { StyleMoreFonts } from '@ui/components/stylemint/style-more-fonts';
import React from 'react';

export const FontPickerElement = (props: { path; name; value; blur, schema }) => {
  const prop: any = {};

  const handleUpdate = color => {
    if (props.blur) {
      props.blur(color?.hex || color);
    }
  };

  const { position, displayStyle, popup, icon, toggle } = props.schema || {};
  const variant = props.schema ? props.schema['x-control-variant'] : 'text';
  return (
    <div>
      <StyleMoreFonts />
    </div>
  );
};