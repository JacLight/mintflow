import React from 'react';
import { classNames } from '../utils';
import { isEmpty } from '../utils';
import { toSentenceCase, toTitleCase } from '../utils';
import { getElementTheme } from '../context/store';
import { twMerge } from 'tailwind-merge';
import { FormCollapsible } from '../form-view/form-collapsible';
import { FormPopup } from '../form-view/form-popup';
import { ElementIcon } from './element-icon';
import { StyledComponent } from './styling';
import { extractStylingFromSchema, getComponentPartStyling } from './styling/style-utils';

export const ElementWrapperLayout = (props: {
  mode;
  children;
  path;
  name;
  theme?;
  schema?: { name; title; hideLabel; layout?; position; children; icon?; image?; labelPosition; iconPosition?; error?; description?; collapsible; popup; operations };
  arrayControl?;
}) => {
  const { path, name, schema } = props;

  if (isEmpty(schema) && isEmpty(props.children)) return null;
  if (isEmpty(schema)) return props.children;

  const iconPosition = schema.iconPosition || 'start';
  const labelPosition = schema.labelPosition || 'top';

  // Extract styling from schema
  const customStyling = extractStylingFromSchema(schema);

  const description = schema.description ? (
    <StyledComponent
      componentType="layout"
      part="description"
      schema={schema}
      theme={props.theme}
      className="cb-control-error"
    >
      {schema.description}
    </StyledComponent>
  ) : null;

  const error = schema.error ? (
    <StyledComponent
      componentType="layout"
      part="error"
      schema={schema}
      theme={props.theme}
      className="cb-control-help"
    >
      {schema.error}
    </StyledComponent>
  ) : null;
  const icon = schema.icon?.length == 2 ? schema.icon : typeof schema.icon === 'string' ? <ElementIcon icon={schema?.icon} image={schema?.image} mode={props.mode} /> : null;

  let elements;
  if (!schema.collapsible && icon && (iconPosition === 'start' || iconPosition === 'end')) {
    elements = (
      <StyledComponent
        componentType="layout"
        part="input"
        schema={schema}
        theme={props.theme}
        className="cb-input w-full flex gap-2"
      >
        {iconPosition === 'start' && icon} {props.children} {iconPosition === 'end' && icon}
      </StyledComponent>
    );
  } else {
    elements = (
      <StyledComponent
        componentType="layout"
        part="input"
        schema={schema}
        theme={props.theme}
        className="cb-input w-full"
      >
        {props.children}
      </StyledComponent>
    );
  }

  const caption = schema.title ? schema.title : toSentenceCase(schema.name || props.name || '');
  let label;

  if (caption && !schema.collapsible && !schema.hideLabel) {
    if ((iconPosition === 'beforeLabel' || iconPosition === 'afterLabel')) {
      label = (
        <StyledComponent
          componentType="layout"
          part="label"
          schema={schema}
          theme={props.theme}
          className="cb-label-with-icon flex gap-2 text-xs items-center"
        >
          {iconPosition === 'beforeLabel' && icon}
          <StyledComponent
            componentType="layout"
            part="label-inner"
            schema={schema}
            theme={props.theme}
            className="cb-label"
          >
            {caption}
          </StyledComponent>
          {iconPosition === 'afterLabel' && icon}
        </StyledComponent>
      );
    } else {
      label = (
        <StyledComponent
          componentType="layout"
          part="label"
          schema={schema}
          theme={props.theme}
          className="cb-label text-xs"
        >
          {caption}
        </StyledComponent>
      );
    }
  }

  let render;
  if (!schema.collapsible) {
    const hasFlex = ['start', 'end'].includes(labelPosition) || schema.layout === 'horizontal';
    render = (
      <StyledComponent
        componentType="layout"
        part="control-input"
        schema={schema}
        theme={props.theme}
        className={classNames(hasFlex && 'flex', 'gap-4 items-center', 'cb-control-input w-full')}
      >
        {!['end', 'bottom'].includes(labelPosition) && label}
        {elements}
        {['end', 'bottom'].includes(labelPosition) && label}
      </StyledComponent>
    );
  }

  if (schema.collapsible)
    render = (
      <FormCollapsible defaultState={schema.collapsible} theme={props.theme} title={caption} icon={icon} arrayControl={props.arrayControl}>
        {elements}
      </FormCollapsible>
    );
  if (schema.popup)
    return (
      <FormPopup title={label} icon={icon}>
        {elements}
      </FormPopup>
    );

  return (
    <StyledComponent
      componentType="layout"
      part={props.arrayControl ? 'container-array' : 'container'}
      schema={schema}
      theme={props.theme}
      className={`cb-layout ${labelPosition || 'top'} ${schema.hideLabel ? 'hide-label' : ''}`}
    >
      {render}
    </StyledComponent>
  );
};
