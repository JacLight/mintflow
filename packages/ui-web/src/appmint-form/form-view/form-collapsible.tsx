'use client';

import { twMerge } from 'tailwind-merge';
import { Transition } from '../common/select-components';
import { getElementTheme } from '../context/store';
import { classNames } from '../utils';
import { localStorageUtils } from '../utils/localstorage';
import React, { useEffect, useState } from 'react';
import { IconRenderer } from '../common/icons/icon-renderer';
import { StyledComponent } from '../form-elements/styling';

export const FormCollapsible = (props: { id?; icon?; title?; children; theme?; defaultState?; className?, ui?, arrayControl?}) => {
  const [isOpen, setOpen] = useState(props.defaultState === 'open' ? true : false);

  useEffect(() => {
    if (props.id) {
      const _isOpen = localStorageUtils.get('collapsible-' + props.id);
      if (typeof _isOpen === 'boolean') {
        setOpen(_isOpen);
      }
    }
  }, []);

  const toggle = () => {
    const newState = !isOpen;
    setOpen(newState);
    if (props.id) {
      localStorageUtils.set('collapsible-' + props.id, JSON.stringify(newState));
    }
  };

  const { classes, style } = (props.ui || {})['collapsible'] || {};
  const controlTheme = getElementTheme('collapsible', props.theme);

  return (
    <div className={twMerge(classNames('cb-collapsible', props.className, controlTheme.className, classes?.join(' ')))}>
      <StyledComponent
        componentType="collapsible"
        part="header"
        onClick={toggle}
      >
        <div className="flex justify-between items-center w-full">
          <div className="flex gap-2 items-center">
            {typeof props.icon === 'string' ? <IconRenderer icon={props.icon as any} /> : props.icon}
            {typeof props.arrayControl?.index === 'number' && props.arrayControl.index}
            {props.title && <span>{props.title}</span>}
          </div>
          <div className="flex gap-2 items-center">
            {props.arrayControl?.delete && props.arrayControl.delete}
            <div className="flex items-center gap-2">
              {isOpen ?
                <IconRenderer icon={'ChevronDown'} aria-hidden="true" size={10} /> :
                <IconRenderer icon={'ChevronRight'} aria-hidden="true" size={10} />
              }
            </div>
          </div>
        </div>
      </StyledComponent>

      {isOpen && (
        <StyledComponent
          componentType="collapsible"
          part="content"
        >
          <Transition
            show={isOpen}
            enter="transition-opacity duration-75"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="mt-1">{props.children}</div>
          </Transition>
        </StyledComponent>
      )}
    </div>
  );
};
