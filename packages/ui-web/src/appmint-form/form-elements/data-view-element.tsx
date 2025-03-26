import { isEmpty } from '../utils';
import React, { useEffect, useState } from 'react';
import * as objectPath from 'object-path';
import { IconButtonDelete } from '../common/icon-button-delete';
import { FileThumbnail } from '../common/file-thumbnail';
import { StyledComponent } from './styling';
import { extractStylingFromSchema, getComponentPartStyling } from './styling/style-utils';
import { twMerge } from 'tailwind-merge';

interface DataViewElementProps {
  data: any;
  name?: string;
  schema: any;
  theme?: any;
  className?: string;
}

interface DataDisplayProps {
  path: string;
  pathData: any;
  schema?: any;
  theme?: any;
}

export const DataViewElement: React.FC<DataViewElementProps> = (props) => {
  // Extract styling from schema
  const customStyling = props.schema ? extractStylingFromSchema(props.schema) : undefined;

  // Get data view styling
  const containerClasses = getComponentPartStyling('data-view',  'container', '',  props.theme,  customStyling);
  const emptyMessageClasses = getComponentPartStyling('data-view',  'emptyMessage', '',  props.theme,  customStyling);
  const itemContainerClasses = getComponentPartStyling('data-view',  'itemContainer', '',  props.theme,  customStyling);

  const [data, setData] = useState<Record<string, any>>({});

  useEffect(() => {
    const watchedData: Record<string, any> = {};
    const paths = props.schema.watchedPaths?.includes('root')
      ? Object.keys(props.data)
      : props.schema.watchedPaths;

    paths?.forEach(path => {
      const value = objectPath.get(props.data, path);
      if (value !== undefined && value !== null) {
        watchedData[path] = value;
      }
    });

    setData(watchedData);
  }, [props.data, props.schema.watchedPaths]);

  return (
    <StyledComponent
      componentType="data-view"
      part="container"
      schema={props.schema}
      theme={props.theme}
      className={twMerge("w-full shadow border-white border-8 bg-gray-50 p-10", props.className)}
    >
      {isEmpty(data) && (
        <StyledComponent
          componentType="data-view"
          part="emptyMessage"
          schema={props.schema}
          theme={props.theme}
          className="text-center text-gray-500"
        >
          No Data
        </StyledComponent>
      )}

      {Object.keys(data).map((key, index) => (
        <StyledComponent
          key={index}
          componentType="data-view"
          part="itemContainer"
          schema={props.schema}
          theme={props.theme}
          className="flex flex-row justify-between"
        >
          <DataDisplay
            key={key}
            path={key}
            pathData={data[key]}
            schema={props.schema}
            theme={props.theme}
          />
        </StyledComponent>
      ))}
    </StyledComponent>
  );
};

const primitiveType = ['string', 'number', 'boolean'];

const DataDisplay: React.FC<DataDisplayProps> = (props) => {
  // Extract styling from schema
  const customStyling = props.schema ? extractStylingFromSchema(props.schema) : undefined;

  // Get data display styling
  const itemClasses = getComponentPartStyling('data-view',  'item', '',  props.theme,  customStyling);
  const valueClasses = getComponentPartStyling('data-view',  'value', '',  props.theme,  customStyling);
  const keyClasses = getComponentPartStyling('data-view',  'key', '',  props.theme,  customStyling);
  const objectContainerClasses = getComponentPartStyling('data-view',  'objectContainer', '',  props.theme,  customStyling);
  const deleteButtonClasses = getComponentPartStyling('data-view',  'deleteButton', '',  props.theme,  customStyling);

  const onDelete = () => {
    // Delete functionality would be implemented here
  };

  let renderValue;

  // Handle primitive types
  if (primitiveType.includes(typeof props.pathData)) {
    renderValue = (
      <StyledComponent
        componentType="data-view"
        part="value"
        schema={props.schema}
        theme={props.theme}
      >
        {String(props.pathData)}
      </StyledComponent>
    );
  }

  // Handle file data
  if (props.pathData?.url && props.pathData?.path) {
    renderValue = (
      <FileThumbnail
        url={props.pathData.url}
        path={props.pathData.path}
        deleteClick={onDelete}
      />
    );
  }

  // Handle arrays
  if (Array.isArray(props.pathData)) {
    renderValue = props.pathData.map((item, index) => (
      <DataDisplay
        key={index}
        path={`${props.path}.${index}`}
        pathData={item}
        schema={props.schema}
        theme={props.theme}
      />
    ));
  }

  // Handle objects
  if (typeof props.pathData === 'object' && props.pathData !== null && !Array.isArray(props.pathData) && !props.pathData?.url) {
    renderValue = (
      <StyledComponent
        componentType="data-view"
        part="objectContainer"
        schema={props.schema}
        theme={props.theme}
        className="flex flex-row justify-between"
      >
        {Object.keys(props.pathData).map((key, index) => (
          <StyledComponent
            key={index}
            componentType="data-view"
            part="objectItem"
            schema={props.schema}
            theme={props.theme}
            className="flex flex-row justify-between"
          >
            <StyledComponent
              componentType="data-view"
              part="key"
              schema={props.schema}
              theme={props.theme}
              className="mr-2"
            >
              {key}:
            </StyledComponent>
            <DataDisplay
              key={key}
              path={`${props.path}.${key}`}
              pathData={props.pathData[key]}
              schema={props.schema}
              theme={props.theme}
            />
          </StyledComponent>
        ))}
      </StyledComponent>
    );
  }

  if (!renderValue) {
    console.log('Unknown data type', props.path, props.pathData);
    renderValue = (
      <StyledComponent
        componentType="data-view"
        part="value"
        schema={props.schema}
        theme={props.theme}
        className="text-gray-400 italic"
      >
        [Unknown data type]
      </StyledComponent>
    );
  }

  return (
    <StyledComponent
      componentType="data-view"
      part="item"
      schema={props.schema}
      theme={props.theme}
      className="cursor-pointer flex items-center gap-2"
    >
      {renderValue}
      <StyledComponent
        componentType="data-view"
        part="deleteButton"
        schema={props.schema}
        theme={props.theme}
      >
        <IconButtonDelete color={'gray'} size={10} deleteHandler={onDelete} />
      </StyledComponent>
    </StyledComponent>
  );
};
