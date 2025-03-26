import { useShallow } from 'zustand/shallow';
import { useFormStore } from '../context/store';
import { FormElementRender } from '../form-elements';
import { ElementWrapperLayout } from '../form-elements/element-wrapper-layout';
import { FormRender } from './form-render';
import { FormRenderArray } from './form-render-array';
import { deepCopy } from '../utils';
import React from 'react';
import { StyledComponent } from '../form-elements/styling';

export const FormLayoutRender = ({ storeId, path, dataPath, layoutPath, className = '', arrayIndex = undefined }) => {
  const { setStateItem, setItemValue, getItemValue, getSchemaItem, theme } = useFormStore(useShallow(state => ({
    setStateItem: state.setStateItem,
    setItemValue: state.setItemValue,
    getItemValue: state.getItemValue,
    getSchemaItem: state.getSchemaItem,
    theme: state.theme
  })));
  const properties = getSchemaItem(path);
  const onEditItem = (event, itemPath) => {
    event.stopPropagation();
    event.preventDefault();
    setStateItem({ activePath: itemPath });
  };

  const addArrayItem = (e, itemPath) => {
    console.log('addArrayItem', path);
    const items = getItemValue(itemPath) || [];
    const arrayItemPath = `${itemPath}.${items.length}`;
    setItemValue(arrayItemPath, '');
  };

  console.debug('FormLayoutRender');
  const layoutSchema = getSchemaItem(layoutPath);
  const fieldNames = deepCopy(Object.keys(properties));
  return (
    <StyledComponent
      componentType="layout"
      part="container"
      schema={layoutSchema}
    >
      <div id={path} data-path={path} onClick={e => onEditItem(e, layoutPath)} className={className}>
        {Object.keys(properties).map(fieldName => {
          const fieldPath = path + '.' + fieldName;
          const { layoutGroup } = properties[fieldName] || {};
          if (layoutGroup !== layoutPath) return null;
          const field = properties[fieldName];
          const valuePath = dataPath ? dataPath + '.' + fieldName : fieldName;
          const hasControl = field['x-control'] && field['x-control'] !== 'container';
          if (!hasControl && field.type === 'object') {
            return (
              <ElementWrapperLayout mode="view" key={fieldName} path={fieldPath} name={fieldName} schema={getSchemaItem(fieldPath)} theme={theme}>
                <FormRender path={fieldPath} className="" name={fieldName} dataPath={valuePath} layoutPath={layoutPath} storeId={storeId} />
              </ElementWrapperLayout>
            );
          }
          if (!hasControl && field.type === 'array') {
            const childPath = path;
            return <FormRenderArray path={fieldPath} dataPath={valuePath} parentDataPath={dataPath} childPath={childPath} name={fieldName} fieldName={fieldName} schema={field} className={className} hasControl={hasControl} storeId={storeId} />;
          } else {
            if (field.group) {
              if (!fieldNames.includes(fieldName)) return null;
              const groupFields = Object.keys(properties)
                .filter(key => properties[key] && properties[key].group === field.group)
                .map(key => ({ key, field: properties[key] }));
              const groupPath = path + '.' + field.group;
              return (
                <StyledComponent
                  componentType="layout"
                  part="group"
                  schema={layoutSchema}
                  className="flex gap-3 w-full"
                  key={groupPath}
                >
                  {groupFields.map(({ key, field }) => {
                    fieldNames.splice(fieldNames.indexOf(key), 1);
                    const valuePath = dataPath ? dataPath + '.' + key : key;
                    const groupFieldPath = path + '.' + key;
                    return <FormElementRender mode="view" name={key} path={groupFieldPath} schema={getSchemaItem(groupFieldPath) || {}} dataPath={valuePath} parentDataPath={dataPath} storeId={storeId} />;
                  })}
                </StyledComponent>
              );
            } else {
              return <FormElementRender mode="view" name={fieldName} path={fieldPath} schema={getSchemaItem(fieldPath) || {}} dataPath={valuePath} parentDataPath={dataPath} storeId={storeId} />;
            }
          }
        })}
      </div>
    </StyledComponent>
  );
};
