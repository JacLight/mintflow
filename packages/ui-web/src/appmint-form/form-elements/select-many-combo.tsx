import React, { useEffect, useState } from 'react';
import { ChevronsUpDown } from 'lucide-react';
import { Combobox, ComboboxInput, ComboboxOption, ComboboxOptions, ComboboxButton } from '../common/select-components';
import { classNames, isEmpty, isNotEmpty } from '../utils';
import { ElementIcon } from './element-icon';
import { IconRenderer } from '../common/icons/icon-renderer';
import { StyledComponent } from './styling';
import { extractStylingFromSchema } from './styling/style-utils';

export const SelectManyCombo = (props: { className?; blur?; change?; focus?; mode?; value?; schema?; path?; name?; data?; options?, theme?}) => {
  const [query, setQuery] = useState('');
  const [selections, setSelections] = useState<any[]>();
  const [options, setOptions] = useState<any[]>([]);

  useEffect(() => {
    const initValue = Array.isArray(props.value) ? props.value : isEmpty(props.value) ? [] : typeof props.value === 'string' ? [{ value: props.value, label: props.value }] : [props.value];
    setSelections(initValue);
  }, []);

  useEffect(() => {
    if (isNotEmpty(props.options) && typeof props.options[0] === 'string') {
      setOptions([{ label: '', value: '' }, ...(props.options || []).map(_ => ({ value: _, label: _ }))]);
    } else {
      setOptions([{ label: '', value: '' }, ...(props.options || [])]);
    }
  }, [props.options]);

  const onChange = e => {
    e.preventDefault();
    setQuery(e.target.value);
  };

  const removeSelection = item => {
    const itemValue = typeof item === 'object' ? item.value : item;
    const itemIndex = selections.findIndex(item => item.value === itemValue || item === itemValue);
    if (itemIndex > -1) {
      const newValue = selections.filter((_, idx) => idx !== itemIndex);
      setSelections(newValue);
      if (props.schema?.type === 'array') {
        if (props.schema?.items?.type === 'string') {
          props.change(isEmpty(newValue) ? undefined : newValue.map(_ => _.value));
        } else {
          props.change(isEmpty(newValue) ? undefined : newValue);
        }
      } else if (props.schema?.type === 'string') {
        props.change(isEmpty(newValue) ? undefined : newValue[0]?.value);
      }
      props.change(isEmpty(newValue) ? undefined : newValue);
    }
  };

  const updateSelections = item => {
    if (!item) return;
    const newSelections = Array.isArray(selections) ? selections : [];
    if (newSelections.findIndex(_ => _.value === item.value || _ === item.value) > -1) return;

    let newValue;
    if (props.schema?.preSelect && item) {
      // const parentPath = props.path.includes('.') ? props.path.split('.').slice(0, -1).join('.') : ''
      // const parentData = getFormStore.getState().getItemValue(parentPath)
      // Object.keys(item).forEach(key => {
      //   if (isEmpty(parentData[key])) {
      //     parentData[key] = item[key];
      //   }
      // });
      // getFormStore.getState().setItemValue(parentPath, parentData)
    }
    if (props.schema?.type === 'array') {
      if (props.schema?.items?.properties) {
        newValue = item;
      } else {
        if (!item?.value) return;
        newValue = item?.value;
      }
      newValue = [...newSelections, newValue];
      if (props.schema?.maxItems) {
        newValue = newValue.slice(0, newValue.maxItems);
      }
    } else if (props.schema?.type === 'string') {
      newValue = item.value;
    } else {
      newValue = item;
    }
    if (!newValue) newValue = undefined;
    props.change(newValue);
    if (newValue && typeof newValue === 'string') {
      newValue = [{ value: newValue, label: newValue }];
    } else if (newValue && !Array.isArray(newValue)) {
      newValue = [newValue];
    }
    setSelections(newValue ? newValue : []);
  };

  const removeItem = item => {
    const itemValue = typeof item === 'object' ? item.value : item;
    const itemIndex = selections.findIndex(item => item.value === itemValue || item === itemValue);
    if (itemIndex > -1) {
      const newValue = selections.filter((_, idx) => idx !== itemIndex);
      setSelections(newValue);
      if (props.schema?.type === 'array') {
        if (props.schema?.items?.type === 'string') {
          props.change(isEmpty(newValue) ? undefined : newValue.map(_ => _.value));
        } else {
          props.change(isEmpty(newValue) ? undefined : newValue);
        }
      } else if (props.schema?.type === 'string') {
        props.change(isEmpty(newValue) ? undefined : newValue[0]?.value);
      }
      props.change(isEmpty(newValue) ? undefined : newValue);
    }
  };

  const onMouseEnter = (value) => {
    // const editorDocument = getPageEditorDocument();
    // editorDocument.querySelectorAll('.highlight-object').forEach(el => {
    //   el.classList.remove('highlight-object');
    // });
    // const element = editorDocument.getElementById(value);
    // element?.classList.add('highlight-object');
  };

  const onMouseLeave = (value) => {
    // const element = getPageEditorElement(value);
    // element?.classList.remove('highlight-object');
  };


  const addOrSelectItem = event => {
    if (isEmpty(query)) return;
    const item = options.find(option => option.value === query);
    if (item) {
      updateSelections(item);
      setQuery('');
      return;
    }

    const newItem = { value: query, label: query };
    setOptions([...options, newItem]);
    updateSelections(newItem);
    setQuery('');
  };

  const clearItems = () => {
    setSelections([]);
    props.change([]);
  };

  // Extract styling from schema
  const customStyling = extractStylingFromSchema(props.schema);

  const listSelected = props.schema?.listSelected || false;

  const filterOptions =
    query === ''
      ? options
      : options?.filter(item => {
        return item.label.toLowerCase().includes(query.toLowerCase()) || item.value.toLowerCase().includes(query.toLowerCase());
      });
  return (
    <Combobox value={null} onChange={updateSelections} className="w-full">
      <StyledComponent
        componentType="combo"
        part="button"
        schema={props.schema}
        theme={props.theme}
        className="relative flex rounded gap-1 bg-white shadow-sm ring-1 ring-inset p-px border-0 ring-gray-30 w-full items-center"
      >
        {listSelected && Array.isArray(selections) && isNotEmpty(selections) && (
          <StyledComponent
            componentType="combo"
            part="selectedTagsContainer"
            schema={props.schema}
            theme={props.theme}
            className="flex text-xs gap-2 px-1 overflow-auto max-w-"
          >
            {selections?.map((item, idx) => (
              <StyledComponent
                key={idx}
                componentType="combo"
                part="selectedTag"
                schema={props.schema}
                theme={props.theme}
                className="flex items-center px-1 py-1 rounded-full bg-gray-50 text-xs cursor-pointer hover:bg-orange-100"
              >
                {typeof item === 'object' && <ElementIcon icon={item?.icon} image={item?.image} className="h-5 w-5 flex-shrink-0 rounded-full" mode={props.mode} />}
                <span className="ml-1 block truncate">{typeof item === 'string' ? item : item?.label}</span>
                <StyledComponent
                  componentType="combo"
                  part="removeButton"
                  schema={props.schema}
                  theme={props.theme}
                  as="button"
                  onClick={() => removeSelection(item)}
                  className="ml-3 text-gray-400 bg-white hover:text-gray-600 focus:outline-none rounded-full shadow p-[2px]"
                >
                  <span className="sr-only">Remove</span>
                  <IconRenderer icon="X" className="h-4 w-4 hover:fill-red-500 hover:stroke-red-500" aria-hidden="true" />
                </StyledComponent>
              </StyledComponent>
            ))}
          </StyledComponent>
        )}
        {!listSelected && Array.isArray(selections) && isNotEmpty(selections) && (
          <StyledComponent
            componentType="combo"
            part="selectedSummary"
            schema={props.schema}
            theme={props.theme}
            className="flex text-xs gap-2 px-1 items-center overflow-auto flex-shrink-0 rounded-full border-gray-100 border"
          >
            <span className="ml-1 block truncate">{typeof selections[0] === 'string' ? selections[0] : selections[0].label}</span>
            {selections?.length > 1 && (
              <StyledComponent
                componentType="combo"
                part="counter"
                schema={props.schema}
                theme={props.theme}
                className="inset-y-0 rounded-r-md focus:outline-none text-sm text-purple-600"
              >
                {selections.length}
              </StyledComponent>
            )}
          </StyledComponent>
        )}
        <ComboboxInput
          className="border-0 px-2 py-1 text-gray-900 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-5 placeholder:text-sm flex-grow min-w-6"
          onChange={onChange}
          displayValue={(item: any) => item?.value}
          placeholder={props.schema?.placeholder || 'Select or add options...'}
        />
        <StyledComponent
          componentType="combo"
          part="controls"
          schema={props.schema}
          theme={props.theme}
          className="flex items-center gap-0"
        >
          {listSelected && selections?.length > 0 && (
            <StyledComponent
              componentType="combo"
              part="counter"
              schema={props.schema}
              theme={props.theme}
              className="inset-y-0 rounded-r-md focus:outline-none text-xs text-purple-600"
            >
              {selections?.length}
            </StyledComponent>
          )}
          {selections?.length > 0 && (
            <ComboboxButton
              className="inset-y-0 rounded-r-md focus:outline-none group"
              onClick={clearItems}
            >
              <IconRenderer icon="X" className="h-4 w-4 group-hover:text-sky-500 text-red-400" aria-hidden="true" />
            </ComboboxButton>
          )}
          <ComboboxButton
            className="inset-y-0 rounded-r-md focus:outline-none"
            onClick={addOrSelectItem}
          >
            <IconRenderer icon="Plus" className="h-4 w-4 text-gray-400" aria-hidden="true" />
          </ComboboxButton>
          <ComboboxButton
            className="inset-y-0 flex rounded-r-md focus:outline-none"
          >
            <ChevronsUpDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </ComboboxButton>
        </StyledComponent>
      </StyledComponent>
      {filterOptions?.length > 0 && (
        <ComboboxOptions
          className="absolute z-50 mt-1 max-h-80 w-full min-w-48 overflow-auto rounded bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
        >
          {selections?.map((itemValue, idx) => {
            const item = options.find(option => option.value === itemValue.value || option.value === itemValue);
            if (!item) return null;
            const iconOrImage = <ElementIcon icon={item.icon} image={item.image} className="h-10 w-10 flex-shrink-0 rounded-full" mode={props.mode} path={props.path} />;
            return (
              <StyledComponent
                componentType="combo"
                part="selectedOption"
                schema={props.schema}
                theme={props.theme}
                key={item.value + '-' + idx}
                onMouseEnter={() => onMouseEnter(itemValue)}
                onMouseLeave={() => onMouseLeave(itemValue)}
                className="relative hover:bg-gray-200 cursor-default select-none py-2 pl-3 pr-9 text-gray-900"
              >
                <div className='flex justify-between items-center w-full'>
                  <div className="flex items-center">
                    {iconOrImage}
                    <span className="ml-3 truncate font-semibold">{item.label}</span>
                  </div>
                  <div className='flex items-center'>
                    <StyledComponent
                      componentType="combo"
                      part="removeButton"
                      schema={props.schema}
                      theme={props.theme}
                      as="button"
                      onClick={() => removeItem(itemValue)}
                      title="Remove item"
                      aria-label="Remove item"
                    >
                      <IconRenderer icon="X" className="h-4 w-4 group-hover:text-sky-500 text-red-400" aria-hidden="true" />
                    </StyledComponent>
                  </div>
                </div>
              </StyledComponent>
            );
          })}
          {filterOptions?.map((item, idx) => {
            const isSelected = selections?.findIndex(value => value === item.value) > -1;
            if (isSelected) return null;
            const iconOrImage = <ElementIcon icon={item.icon} image={item.image} className="h-10 w-10 flex-shrink-0 rounded-full" mode={props.mode} path={props.path} />;
            return (
              <ComboboxOption
                key={item.value + '-' + idx}
                value={item}
                onMouseEnter={() => onMouseEnter(item?.value)}
                onMouseLeave={() => onMouseLeave(item?.value)}
                className={({ active }) => classNames('relative cursor-default select-none py-2 pl-3 pr-9', active ? 'bg-indigo-600 text-white' : 'text-gray-900')}
              >
                {({ active, selected }) => (
                  <div className="flex items-center">
                    {iconOrImage}
                    <span className="ml-3 truncate">{item.label}</span>
                  </div>
                )}
              </ComboboxOption>
            );
          })}
        </ComboboxOptions>
      )}
    </Combobox>
  );
};
