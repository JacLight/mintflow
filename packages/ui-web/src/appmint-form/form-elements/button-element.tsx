import React, { useEffect, useState } from 'react';
import { isEmpty, toTitleCase, toSentenceCase } from '../utils';
import { getElementTheme, useFormStore } from '../context/store';
import { classNames } from '../utils';
import { buttonsActions } from '../form-view/button-actions';
import { ElementIcon } from './element-icon';
import { StyledComponent } from './styling';
import { extractStylingFromSchema, getComponentPartStyling } from './styling/style-utils';
import { twMerge } from 'tailwind-merge';

export const ButtonElement = (props: {
  storeId;
  readOnly?;
  mode;
  children;
  path;
  dataPath;
  error?;
  name;
  timestamp?;
  theme?;
  schema?: { readOnly; disabled; theme; validations; hidden; name; title; hideLabel; position; children; image?; icon?; labelPosition; iconPosition?; error?; description; action };
}) => {
  const { path, name, schema, dataPath } = props;
  const { getStateItem, getItemValue, getSchemaItem, updateError } = useFormStore.getState();

  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const errorMsg = props.error || schema.error;
    setErrorMsg(errorMsg);
  }, [path, props.error]);

  if (isEmpty(schema) && isEmpty(props.children)) return null;
  if (isEmpty(schema)) return props.children;

  const iconPosition = schema.iconPosition || 'start';
  let labelPosition = schema.labelPosition || 'auto';
  const labelStartEnd = schema.labelPosition === 'start' || schema.labelPosition === 'end';
  const inlineControls = ['checkbox', 'radio', 'switch', 'button', 'icon-button'];
  const isInline = inlineControls.includes(schema['x-control-variant']);
  const iconStarEnd = !(schema.iconPosition === 'beforeLabel' || schema.iconPosition === 'afterLabel');

  let info = '';
  if (schema?.validations?.length > 0) {
    const hasMaxLength = schema.validations.find(v => v.validation === 'maxLength');
    const hasMinLength = schema.validations.find(v => v.validation === 'minLength');
    if (hasMaxLength && hasMinLength) {
      info = 'Min ' + hasMinLength.arg + ' Max ' + hasMaxLength.arg;
    } else if (hasMaxLength) {
      info = 'Max ' + hasMaxLength.arg;
    } else if (hasMinLength) {
      info = 'Min ' + hasMinLength.arg;
    }
  }

  // Extract styling from schema
  const customStyling = extractStylingFromSchema(schema);

  // Get button styling
  const containerClasses = getComponentPartStyling('button', 'container', '', props.theme, customStyling);
  const buttonClasses = getComponentPartStyling('button', 'button', '', props.theme, customStyling);
  const labelClasses = getComponentPartStyling('button', 'label', '', props.theme, customStyling);
  const descriptionClasses = getComponentPartStyling('button', '', 'description', props.theme, customStyling);
  const errorClasses = getComponentPartStyling('button', 'error', '', props.theme, customStyling);

  const description =
    schema.description || info ? (
      <StyledComponent
        componentType="button"
        part="description"
        schema={schema}
        theme={props.theme}
        className={classNames(iconStarEnd && labelStartEnd && schema.icon && !isInline && 'ml-8')}
      >
        {schema.description || ''} {info}
      </StyledComponent>
    ) : null;

  const error = errorMsg ? (
    <StyledComponent
      componentType="button"
      part="error"
      schema={schema}
      theme={props.theme}
    >
      {errorMsg}
    </StyledComponent>
  ) : null;
  const icon = schema.icon?.length == 2 ? schema.icon : typeof schema.icon === 'string' ? <ElementIcon icon={schema?.icon} image={schema?.image} mode={props.mode} schema={schema} theme={props.theme} /> : null;
  const caption = schema.title || schema.name || props.name;
  const label = (
    <StyledComponent
      componentType="button"
      part="label"
      schema={schema}
      theme={props.theme}
      className={classNames(labelStartEnd && !isInline && '-mt-5')}
    >
      {toSentenceCase(caption)}
    </StyledComponent>
  );

  const clickHandler = async e => {
    updateError(dataPath, null);

    console.log('ButtonElement clickHandler', path, schema);
    if (!schema?.action) {
      console.error('ButtonElement clickHandler no action found', path, schema);
    }

    const actionInfo = buttonsActions[schema.action];
    if (!actionInfo?.fn) {
      console.error('ButtonElement clickHandler no action function found', path, schema);
      return;
    }

    const formData = getItemValue('');
    const formSchema = getSchemaItem('');
    const formRules = getStateItem('formRules');
    const collectionForm = getStateItem('collectionForm');
    const email = getStateItem('email');
    await actionInfo.fn({ storeId: props.storeId, dataPath, actionSchema: schema, email, collectionForm, formData, formSchema, formRules });
  };

  return (
    <StyledComponent
      componentType="button"
      part="container"
      schema={schema}
      theme={props.theme}
      className={classNames(
        `label-${labelPosition || 'auto'}`,
        schema.hideLabel && 'hide-label',
        schema.hidden && 'opacity-60'
      )}
    >
      <StyledComponent
        componentType="button"
        part="button"
        schema={schema}
        theme={props.theme}
        as="button"
        readOnly={props.readOnly || schema.readOnly}
        disabled={schema.disabled}
        onClick={clickHandler}
      >
        {!['end', 'afterLabel'].includes(iconPosition) && icon}
        {label}
        {['end', 'afterLabel'].includes(iconPosition) && icon}
      </StyledComponent>
      {description}
      {error}
    </StyledComponent>
  );
};
