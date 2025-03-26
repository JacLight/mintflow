import { IconRenderer } from '../common/icons/icon-renderer';
import { classNames } from '../utils';
import { twMerge } from 'tailwind-merge';
import React from 'react';
import { StyledComponent } from './styling';
import { extractStylingFromSchema, getComponentPartStyling } from './styling/style-utils';

export const ElementIcon = (props: { icon; mode; image; className?; defaultIcon?; path?, theme?, ui?, schema?}) => {
  const { image, icon = props.defaultIcon } = props;

  // Extract styling from schema or ui
  const customStyling = props.schema ? extractStylingFromSchema(props.schema) :
    props.ui ? convertUiToStyling(props.ui) : undefined;

  if (image) {
    if (props.path) {
      return (
        <StyledComponent
          componentType="control-image"
          part="image"
          schema={props.schema}
          theme={props.theme}
          as="img"
          src={image?.url || image}
          alt=""
          className={props.className || 'w-10 h-10'}
        />
      );
    } else {
      return (
        <img
          src={image?.url || image}
          alt=""
          className={twMerge(
            getComponentPartStyling('control-image',  'image', '',  props.theme,  customStyling),
            props.className || 'w-10 h-10'
          )}
        />
      );
    }
  }

  if (icon) {
    if (icon.length === 2) {
      return icon;
    } else {
      return (
        <IconRenderer
          icon={icon}
          className={twMerge(
            getComponentPartStyling('control-icon',  'icon', '',  props.theme,  customStyling),
            props.className
          )}
        />
      );
    }
  }

  return null;
};

// Helper function to convert legacy ui format to styling format
const convertUiToStyling = (ui: any) => {
  const styling: any = {};

  if (ui.icon && ui.icon.classes) {
    styling.icon = Array.isArray(ui.icon.classes) ? ui.icon.classes.join(' ') : ui.icon.classes;
  }

  if (ui.image && ui.image.classes) {
    styling.image = Array.isArray(ui.image.classes) ? ui.image.classes.join(' ') : ui.image.classes;
  }

  return styling;
};
