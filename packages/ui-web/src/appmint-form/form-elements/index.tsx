'use client';
import React, { useEffect, useState } from 'react';
import { ButtonElement, elementToNameMap } from './all-elements';
import { ElementWrapperControl } from './element-wrapper-control';
import { getElementTheme, useFormStore, showNotice } from '../context/store';
import { ControlType, deepCopy, isNotEmpty, toSentenceCase, toTitleCase } from '../utils';
import { FormCollapsible } from '../form-view/form-collapsible';
import { FormPopup } from '../form-view/form-popup';
import { cleanControlType, getControlType } from '../utils/collection-helpers';
import { getWatchedPaths } from '../form-view/form-utils';
import { applyFormTransform, applyFunction } from '../form-view/form-transforms';
import { runElementRules } from '../form-view/form-rules';
import { validateFormValue } from '../form-view/form-validator';
import { twMerge } from 'tailwind-merge';
import * as objectPath from 'object-path';
import shallow, { useShallow } from 'zustand/shallow';

// Stubs for missing dependencies
const requestQueueInstance = {
  getDataById: async (datatype, id) => {
    console.log(`Getting ${id} from ${datatype}`);
    return { sk: id, datatype, data: {} };
  }
};

const genericService = {
  isUniqueInCollection: async (datatype, id, field, value, filter) => {
    console.log(`Checking if ${field}=${value} is unique in ${datatype}`);
    return true;
  }
};

export const FormElementRender = (props: { storeId; theme?: any; mode: string; name: string; path: string; dataPath: string; parentDataPath: string, schema?; arrayPath?, arrayIndex?}) => {
  const { name, path, arrayIndex } = props;
  const dataPath = props.dataPath ? props.dataPath : `${props.dataPath}.${name}`;
  const parentPath = dataPath.includes('.') ? dataPath.split('.').slice(0, -1).join('.') : '';

  const { dataPathTimestamp, theme: formTheme, datatype, storeId, activeDataPath, readOnly, dataBindValue } = useFormStore(useShallow(state => ({ dataPathTimestamp: state.timestamp?.[dataPath], theme: state.theme, datatype: state.datatype, storeId: state.storeId, activeDataPath: state.activeDataPath, readOnly: state.readOnly, dataBindValue: state.dataBindValue })));
  const { rules, getItemValue, setStateItem, applyRuleResult, getDefaultValue, setItemValue, updateError, getError, getSchemaItem, updateRepository } = useFormStore.getState();
  let schema = deepCopy(props.schema || getSchemaItem(path));

  const theme = props.theme || formTheme;
  const [ruleActions, setRuleActions] = useState<any>({});
  // const [localValue, setLocalValue] = useState<any>(null);

  useEffect(() => {
    let watchedPaths = getWatchedPaths(schema, props.parentDataPath, arrayIndex);

    if (isNotEmpty(watchedPaths)) {
      useFormStore.getState().updateWatchedPath(props.dataPath, watchedPaths);
    }
    if (schema?.rules) {
      const parentData = getItemValue(`${props.parentDataPath}`)
      const _ruleActions = runElementRules(schema, getItemValue(''), parentData);
      setRuleActions(_ruleActions);
    }
  }, []);

  useEffect(() => {
    if (schema?.fn && dataPathTimestamp) {
      const fn = schema.fn.startsWith('return') ? schema.fn : `return  ${schema.fn} `;
      const fnResult = applyFunction(fn, value, getItemValue(parentPath), getItemValue());
      console.log('FormElementRender', dataPath, schema.fn, fnResult);
      if (fnResult.status === 'success') {
        value = fnResult.value;
        setItemValue(dataPath, value, arrayIndex, true);
      } else {
        getError(dataPath) !== fnResult.message && updateError(dataPath, fnResult.message);
      }
    }

    if (schema?.rules) {
      const parentData = getItemValue(`${props.parentDataPath}`);
      const _ruleActions = runElementRules(schema, getItemValue(''), parentData);
      setRuleActions(_ruleActions);
    }
  }, [dataPathTimestamp]);

  if (!schema) return null;

  if (schema && typeof schema !== 'object') {
    console.error('FormElementRender: schema must be an object', name, path, arrayIndex, schema);
    return null;
  }

  if (arrayIndex >= 0 && schema.items && (schema?.items?.type !== 'object' || schema?.items?.type !== 'array')) {
    const itemSchema = schema.items;
    itemSchema.hideLabel = schema?.hideLabel || schema.items?.hideLabel;
    itemSchema.pattern = schema?.pattern || schema.items?.pattern;
    itemSchema.validation = schema?.validation || schema.items?.validation;
    schema = itemSchema;
  }

  if (!schema || (props?.mode === 'view' && schema?.hidden)) return null;

  if (!path && !name) {
    console.error('FormElementRender: path or name is required');
    return null;
  }

  const handleFocus = () => {
    setStateItem({ activeDataPath: dataPath });
  };

  const handleChange = newValue => {
    updateError(dataPath, null);
    const validationResult = validateFormValue(path, newValue, schema);
    if (isNotEmpty(validationResult.errors)) {
      updateError(dataPath, validationResult.message);
    }
    setItemValue(dataPath, newValue, arrayIndex);
    // setLocalValue(newValue);

    const parentData = getItemValue(`${props.parentDataPath}`);
    // const ruleResults = runFormRules(name, path, dataPath, newValue, schema, rules, data, parentData);
    // setStateItem({ ruleResults });
  };

  const handleBlur = async (newValue, isFile?) => {
    setStateItem({ activeDataPath: '' });
    updateError(dataPath, null);
    const validationResult = validateFormValue(dataPath, newValue, schema, getItemValue());
    if (isNotEmpty(validationResult.errors)) {
      updateError(dataPath, validationResult.message);
    } else {
      updateError(dataPath, null);

      if (schema.unique && newValue) {
        try {
          const recordId = ''; // Using empty string as a placeholder for id
          const isUnique = await genericService.isUniqueInCollection(datatype, recordId, name, newValue, '');
          if (isUnique) {
            updateError(dataPath, null);
          } else {
            updateError(dataPath, ' must be unique');
          }
        } catch (error) {
          const errorMessage = error?.response?.data?.message || error?.response?.data?.error || error.message;
          showNotice(errorMessage, 'error');
          updateError(dataPath, ' must be unique, error: ' + errorMessage);
        }
      }
    }
    if (schema.transform) {
      newValue = applyFormTransform(newValue, schema.transform);
    }
    if (schema.fn) {
      const fn = schema.fn.startsWith('return') ? schema.fn : `return  ${schema.fn} `;
      newValue = applyFunction(fn, newValue, getItemValue(parentPath), getItemValue());
    }
    setItemValue(dataPath, newValue, arrayIndex, false, isFile);
    // setLocalValue(newValue);
    // const arrayData = typeof arrayIndex === 'number' ? getItemValue(`${props.parentDataPath}`) : null;
    // const ruleResults = runFormRules(name, path, dataPath, newValue, schema, rules, data, arrayData);
    // setStateItem({ ruleResults });
    applyRuleResult();

    if (schema.fetchData?.datatype) {
      requestQueueInstance.getDataById(schema.fetchData?.datatype, newValue).then(res => {
        updateRepository(dataPath, res);
      }).catch(e => {
        console.error('Error fetching data', e);
        updateRepository(dataPath);
      })
    }
  };


  const ruleSchema = applyRuleResult(dataPath, deepCopy(schema));
  let value = dataBindValue ? dataBindValue : dataPath ? getItemValue(dataPath) : null;
  if (typeof value === 'undefined') {
    const defaultValue = getDefaultValue(dataPath, ruleSchema);
    if (defaultValue) {
      value = defaultValue;
    }
  }
  // const reloadValue = value !== localValue ? Date.now() : null;
  const data = dataPath ? getItemValue('') : {};
  if (props.mode === 'view' && (ruleSchema.hidden || ruleActions.hide)) return null;
  Object.keys(ruleActions || {}).forEach(actionKey => {
    if (['show', 'hide', 'disable', 'enable'].includes(actionKey)) return;
    // ruleSchema[action] = ruleActions[action];
    objectPath.set(ruleSchema, actionKey, ruleActions[actionKey]);
  });

  let controlType = ruleSchema.fieldType ? ruleSchema.fieldType : getControlType(ruleSchema);
  controlType = cleanControlType(controlType);
  const Element = elementToNameMap[controlType] || elementToNameMap.default;

  if (controlType === ControlType.button) {
    return <ButtonElement
      storeId={props.storeId}
      readOnly={readOnly}
      mode={props.mode}
      schema={ruleSchema}
      name={name}
      path={path}
      error={getError(dataPath)}
      dataPath={dataPath}
      theme={theme}
      children={null}
    />;
  }

  let schemaStyle: any = ruleSchema['x-ui'] || {};
  const uiInputStyle = schemaStyle['input'];
  const uiControlStyle = schemaStyle[controlType];
  const inputTheme = getElementTheme('input', theme)
  const controlTheme = getElementTheme(controlType, theme)

  ruleSchema.placeholder = ruleSchema?.placeholder ? ruleSchema.placeholder : toSentenceCase(ruleSchema?.title || ruleSchema?.name || name || '');
  const render = (
    <ElementWrapperControl
      isActive={activeDataPath === dataPath}
      hasValue={!!value}
      activeDataPath={activeDataPath}
      controlType={controlType}
      mode={props.mode}
      schema={ruleSchema}
      name={name}
      path={path}
      error={getError(dataPath)}
      theme={theme}
      arrayIndex={arrayIndex}
    >
      <Element
        storeId={props.storeId}
        readOnly={readOnly}
        change={handleChange}
        blur={handleBlur}
        focus={handleFocus}
        value={value}
        data={data}
        parentData={getItemValue(parentPath)}
        schema={ruleSchema}
        name={name}
        mode={props.mode}
        path={path}
        ui={ruleSchema['x-ui']}
        dataPath={dataPath}
        theme={theme}
        arrayIndex={arrayIndex}
        parentDataPath={props.parentDataPath}
        // reloadValue={reloadValue}
        updateRepository={updateRepository}
        className={twMerge('placeholder:text-xs', inputTheme?.className, controlTheme?.className, uiInputStyle?.classes?.join(' '), uiControlStyle?.classes?.join(' '))}
      />
    </ElementWrapperControl>
  );

  const caption = schema.title ? schema.title : toSentenceCase(schema.name || props.name || '');
  if (ruleSchema.collapsible)
    return (
      <FormCollapsible defaultState={ruleSchema.collapsible} theme={theme} title={caption} icon={ruleSchema.icon} ui={ruleSchema['x-ui']}>
        {render}
      </FormCollapsible>
    );
  if (ruleSchema.popup)
    return (
      <FormPopup title={ruleSchema.title || ruleSchema.name} icon={ruleSchema.icon} ui={ruleSchema['x-ui']} theme={theme} popupStyle={ruleSchema.popup}>
        {render}
      </FormPopup>
    );
  return render;
};
