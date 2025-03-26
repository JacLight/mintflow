import { BaseModelDTO, getResponseErrorMessage } from '../utils';
import * as objectPath from 'object-path';
import { isNotEmpty } from '../utils';
import React, { useState, useRef, useEffect } from 'react';
import { SelectManyList } from './select-many-list';
import { ButtonCancel } from '../common/button-cancel';
import { slimButtonClass } from '../utils/constants';
import { BusyIcon } from '../common/icons/svg';
import { IconRenderer } from '../common/icons/icon-renderer';
import { StyledComponent } from './styling';
import { extractStylingFromSchema } from './styling/style-utils';

// Stubs for missing imports from form-view/common-imports
const CollectionHelper = {
  getInstance: () => ({
    getAll: (includeData = false) => [],
    getCollectionOptions: () => [],
    getCollectionOptionsByType: (type) => [],
  })
};

const requestQueueInstance = {
  findDataByAttribute: async (collection, property, value, options) => {
    console.log(`Finding data in ${collection} where ${property}=${value}`);
    return { data: [] };
  },
  getDataById: async (datatype, id) => {
    console.log(`Getting ${id} from ${datatype}`);
    return { sk: id, datatype, data: {} };
  },
  searchData: async (collection, keyword, options) => {
    console.log(`Searching ${collection} for ${keyword}`);
    return { data: [] };
  }
};

const infoFields = ['name', 'email', 'username', 'title', 'phone'];

export const DataLookupCombo = (props: { schema; change; theme?}) => {
  // Extract styling from schema
  const customStyling = extractStylingFromSchema(props.schema);
  const [datatype, setDatatype] = useState(props.schema?.datatype);
  const [keyword, setKeyword] = useState('');
  const [result, setResult] = useState<BaseModelDTO<any>>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [formattedItems, setFormattedItems] = useState([]);
  const [maxItems, setMaxItems] = useState(1);
  const [minItems, setMinItems] = useState(1);

  useEffect(() => {
    setDatatype(props?.schema?.datatype);
    const maxItems = props.schema.type === 'array' ? 100 : typeof props.schema.maxItems !== 'undefined' ? props.schema.maxItems : 1;
    const minItems = typeof props.schema.minItems !== 'undefined' ? props.schema.minItems : 1;
    setMaxItems(maxItems);
    setMinItems(minItems);
  }, []);

  useEffect(() => {
    if (props.change) {
      if (props.schema && props.schema?.type !== 'array') {
        const [firstValue] = formattedItems
        props.change(firstValue);
      } else {
        props.change(formattedItems);
      }
    }
  }, [formattedItems]);

  const debouncedRef = useRef(null);

  const handleSearch = () => {
    setError(null);
    setIsLoading(true);
    requestQueueInstance
      .searchData(datatype, keyword, null)
      .then((res: any) => {
        setResult(res);
      })
      .catch(e => {
        console.error(e);
        setError(getResponseErrorMessage(e));
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const onKeywordChange = event => {
    setError(null);
    event.preventDefault();
    const value = event.target.value;
    setKeyword(value);
    if (value.length >= 2) {
      if (debouncedRef.current) {
        clearTimeout(debouncedRef.current);
      }
      debouncedRef.current = setTimeout(() => {
        handleSearch();
      }, 500);
    } else if (value.length === 0) {
      setResult({} as any);
      if (debouncedRef.current) {
        clearTimeout(debouncedRef.current);
      }
    }
  };

  const toggleSelection = (event, result) => {
    setError(null);
    event.preventDefault();
    const alreadySelected = selectedItems.findIndex(item => item.sk === result.sk);
    if (alreadySelected >= 0) {
      setSelectedItems(selectedItems.filter(item => item.sk !== result.sk));
      return;
    }
    if (selectedItems.length >= maxItems) {
      setError(`Maximum items allowed is ${maxItems}`);
      return;
    }
    setSelectedItems([...selectedItems, result]);

    const properties = props.schema.properties || props.schema.items.properties || props.schema.items;
    if (typeof properties === 'object') {
      const formattedItem = {};
      Object.keys(properties).forEach(key => {
        const value = objectPath.get(result, key);
        objectPath.set(formattedItem, key, value);
      });
      setFormattedItems([...formattedItems, formattedItem]);
    } else if (typeof properties === 'string') {
      const formattedItem = objectPath.get(result.data, properties);
      setFormattedItems([...formattedItems, formattedItem]);
    } else {
      setFormattedItems([...formattedItems, result]);
    }
  };

  const isSelected = id => {
    return selectedItems.findIndex(item => item.sk === id) >= 0;
  };

  const removeItem = id => {
    setError(null);
    setSelectedItems(selectedItems.filter(item => item.sk !== id));
    setFormattedItems(formattedItems.filter(item => item.sk !== id));
  };

  return (
    <StyledComponent
      componentType="data-lookup"
      part="container"
      schema={props.schema}
      theme={props.theme}
      className="relative"
    >
      {error && (
        <StyledComponent
          componentType="data-lookup"
          part="error"
          schema={props.schema}
          theme={props.theme}
          className="text-red-500 text-xs text-center"
        >
          {error}
        </StyledComponent>
      )}
      {selectedItems && (
        <StyledComponent
          componentType="data-lookup"
          part="selectedItems"
          schema={props.schema}
          theme={props.theme}
          className="mb-2"
        >
          {selectedItems?.map((item: any) => (
            <LookupItem key={item.sk} item={item} remove={removeItem} theme={props.theme} schema={props.schema} />
          ))}
        </StyledComponent>
      )}
      <StyledComponent
        componentType="data-lookup"
        part="controls"
        schema={props.schema}
        theme={props.theme}
        className="flex gap-1"
      >
        <SelectManyList change={setDatatype} options={CollectionHelper.getInstance().getCollectionOptions()} schema={{ placeholder: 'Select Datatype' }} />
        <StyledComponent
          componentType="data-lookup"
          part="input"
          schema={props.schema}
          theme={props.theme}
          as="input"
          type="text"
          placeholder="Enter name to search"
          value={keyword}
          onChange={onKeywordChange}
          className="flex-grow rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
        <StyledComponent
          componentType="data-lookup"
          part="searchButton"
          schema={props.schema}
          theme={props.theme}
          as="button"
          title="Search"
          onClick={handleSearch}
          className={`${slimButtonClass} flex items-center gap-2 shadow-none`}
        >
          <BusyIcon isLoading={isLoading} notLoadingMessage={<IconRenderer icon='Search' />} />
        </StyledComponent>
      </StyledComponent>
      {isNotEmpty(result) && (
        <StyledComponent
          componentType="data-lookup"
          part="results"
          schema={props.schema}
          theme={props.theme}
          className="bg-white rounded-lg shadow-md p-4 max-h-96 overflow-auto mt-2 absolute z-10"
        >
          <StyledComponent
            componentType="data-lookup"
            part="resultsHeader"
            schema={props.schema}
            theme={props.theme}
            className="flex justify-between items-center"
          >
            <StyledComponent
              componentType="data-lookup"
              part="resultsCount"
              schema={props.schema}
              theme={props.theme}
              className="text-sm font-semibold mb-2"
            >
              {result?.total} Matching Results:
            </StyledComponent>
            <ButtonCancel handler={() => setResult({} as any)} />
          </StyledComponent>
          <StyledComponent
            componentType="data-lookup"
            part="resultsList"
            schema={props.schema}
            theme={props.theme}
            as="ul"
            className="space-y-2"
          >
            {result?.data.map((result: any) => (
              <StyledComponent
                key={result.sk}
                componentType="data-lookup"
                part="resultsItem"
                schema={props.schema}
                theme={props.theme}
                as="li"
                onClick={e => toggleSelection(e, result)}
                className={isSelected(result.sk) ? 'bg-orange-100 p-2 rounded-md hover:bg-cyan-100 cursor-pointer' : 'bg-gray-50 p-2 rounded-md hover:bg-cyan-100 cursor-pointer'}
              >
                <LookupItem item={result} theme={props.theme} schema={props.schema} />
              </StyledComponent>
            ))}
          </StyledComponent>
        </StyledComponent>
      )}
    </StyledComponent>
  );
};

const LookupItem = ({ item, remove = null, theme, schema }) => {
  // Extract styling from schema
  const customStyling = extractStylingFromSchema(schema);
  const getTitle = () => {
    for (let field of infoFields) {
      if (item.data[field]) {
        return item.data[field];
      }
    }
  }
  return (
    <StyledComponent
      componentType="data-lookup"
      part="item"
      schema={schema}
      theme={theme}
      className={remove ? 'shadow px-2 py-1 rounded-lg w-full text-gray-400 text-xs flex gap-4 items-center overflow-auto' : 'text-gray-400 text-xs flex gap-4 items-center overflow-auto'}
    >
      {remove && (
        <StyledComponent
          componentType="data-lookup"
          part="removeButton"
          schema={schema}
          theme={theme}
          as="button"
          title="Remove Item"
          onClick={e => remove(item.sk)}
          className="text-red-500"
        >
          <IconRenderer icon="X" />
        </StyledComponent>
      )}
      <StyledComponent
        componentType="data-lookup"
        part="itemTitle"
        schema={schema}
        theme={theme}
      >
        <div className="text-[9px]">title</div>
        <div className='whitespace-nowrap text-gray-500'> {getTitle()}</div>
      </StyledComponent>
      {/* <div>
        <div className="text-[9px]">id</div>
        <div className="">{item.sk}</div>
      </div> */}
      <StyledComponent
        componentType="data-lookup"
        part="itemDate"
        schema={schema}
        theme={theme}
      >
        <div className="text-[9px]">modified</div>
        <div className="whitespace-nowrap">{new Date(item.modifydate).toUTCString()}</div>
      </StyledComponent>
    </StyledComponent>
  );
};
