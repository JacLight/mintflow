import React, { Fragment, useState } from 'react';
import { Transition } from '../common/select-components';
import { AlertCircle, CheckCircle, Info, X, AlertTriangle } from 'lucide-react';
import { StyledComponent } from './styling';
import { extractStylingFromSchema, getComponentPartStyling } from './styling/style-utils';
import { twMerge } from 'tailwind-merge';

export const NoticeElement = ({ schema, name, value, theme, path }) => {
  // Extract styling from schema
  const customStyling = extractStylingFromSchema(schema);

  // Get notice styling
  const containerClasses = getComponentPartStyling('notice',  'container', '',  theme,  customStyling);
  const iconClasses = getComponentPartStyling('notice',  'icon', '',  theme,  customStyling);
  const titleClasses = getComponentPartStyling('notice',  'title', '',  theme,  customStyling);
  const contentClasses = getComponentPartStyling('notice',  'content', '',  theme,  customStyling);

  // Determine notice type and icon
  const type = schema?.type || 'info';
  const title = schema?.title || value;
  const content = schema?.content || schema?.description;

  // Set colors based on type
  const typeColors = {
    info: 'bg-blue-50 text-blue-800',
    success: 'bg-green-50 text-green-800',
    warning: 'bg-yellow-50 text-yellow-800',
    error: 'bg-red-50 text-red-800',
  };

  const typeIconColors = {
    info: 'text-blue-400',
    success: 'text-green-400',
    warning: 'text-yellow-400',
    error: 'text-red-400',
  };

  // Select icon based on type
  const IconComponent = {
    info: Info,
    success: CheckCircle,
    warning: AlertTriangle,
    error: AlertCircle,
  }[type] || Info;

  return (
    <StyledComponent
      componentType="notice"
      part="container"
      schema={schema}
      theme={theme}
      className={twMerge(
        'rounded-md p-4',
        typeColors[type] || typeColors.info
      )}
    >
      <div className="flex">
        <div className="flex-shrink-0">
          <StyledComponent
            componentType="notice"
            part="icon"
            schema={schema}
            theme={theme}
            as="div"
            className={twMerge(
              'h-5 w-5',
              typeIconColors[type] || typeIconColors.info
            )}
          >
            <IconComponent aria-hidden="true" />
          </StyledComponent>
        </div>
        <div className="ml-3">
          {title && (
            <StyledComponent
              componentType="notice"
              part="title"
              schema={schema}
              theme={theme}
              as="h3"
              className="text-sm font-medium"
            >
              {title}
            </StyledComponent>
          )}
          {content && (
            <StyledComponent
              componentType="notice"
              part="content"
              schema={schema}
              theme={theme}
              as="div"
              className="mt-2 text-sm"
            >
              <p>{content}</p>
            </StyledComponent>
          )}
        </div>
      </div>
    </StyledComponent>
  );
};

export default NoticeElement;
