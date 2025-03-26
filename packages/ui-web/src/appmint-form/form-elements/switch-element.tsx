import React, { useState } from 'react';
import { Switch } from '../common/select-components';
import { classNames } from '../utils';
import { StyledComponent } from './styling';
import { extractStylingFromSchema, getComponentPartStyling } from './styling/style-utils';
import { twMerge } from 'tailwind-merge';

export const SwitchElement = (props: { change?; blur?; focus?; mode?; value?; schema?; path?; name?; data?; theme?; ui?}) => {
  const [enabled, setEnabled] = useState(props.value);

  const handleUpdate = update => {
    setEnabled(update);
    if (props.change) props.change(update);
  };

  // Extract styling from schema
  const customStyling = extractStylingFromSchema(props.schema);

  // Get track styling
  const trackClasses = getComponentPartStyling('switch', 'track', '', props.theme, customStyling);
  const trackOnClasses = getComponentPartStyling('switch', 'trackOn', '', props.theme, customStyling);
  const trackOffClasses = getComponentPartStyling('switch', 'trackOff', '', props.theme, customStyling);

  // Get thumb styling
  const thumbClasses = getComponentPartStyling('switch', 'thumb', '', props.theme, customStyling);
  const thumbOnClasses = getComponentPartStyling('switch', 'thumbOn', '', props.theme, customStyling);
  const thumbOffClasses = getComponentPartStyling('switch', 'thumbOff', '', props.theme, customStyling);

  // Get icon styling
  const iconClasses = getComponentPartStyling('switch', 'icon', '', props.theme, customStyling);
  const iconOffClasses = getComponentPartStyling('switch', 'iconOff', '', props.theme, customStyling);
  const iconOnClasses = getComponentPartStyling('switch', 'iconOn', '', props.theme, customStyling);

  return (
    <StyledComponent
      componentType="switch"
      part="container"
      schema={props.schema}
      theme={props.theme}
    >
      <Switch
        checked={enabled}
        onChange={handleUpdate}
        className={twMerge(
          trackClasses,
          enabled ? trackOnClasses : trackOffClasses
        )}
      >
        <span className="sr-only">Use setting</span>
        <span
          className={twMerge(
            thumbClasses,
            enabled ? thumbOnClasses : thumbOffClasses
          )}
        >
          <span
            className={twMerge(
              'absolute inset-0 flex h-full w-full items-center justify-center transition-opacity',
              enabled ? 'opacity-0 duration-100 ease-out' : 'opacity-100 duration-200 ease-in'
            )}
            aria-hidden="true"
          >
            <svg
              className={twMerge('h-3 w-3', iconClasses, iconOffClasses)}
              fill="none"
              viewBox="0 0 12 12"
            >
              <path d="M4 8l2-2m0 0l2-2M6 6L4 4m2 2l2 2" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span
            className={twMerge(
              'absolute inset-0 flex h-full w-full items-center justify-center transition-opacity',
              enabled ? 'opacity-100 duration-200 ease-in' : 'opacity-0 duration-100 ease-out'
            )}
            aria-hidden="true"
          >
            <svg
              className={twMerge('h-3 w-3', iconClasses, iconOnClasses)}
              fill="currentColor"
              viewBox="0 0 12 12"
            >
              <path d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-3.293a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z" />
            </svg>
          </span>
        </span>
      </Switch>
    </StyledComponent>
  );
};
