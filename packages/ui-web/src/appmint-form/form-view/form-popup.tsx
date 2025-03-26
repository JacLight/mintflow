import { Popover } from '../common/popover';
import { classNames } from '../utils';
import { getElementTheme } from '../context/store';
import React from 'react';
import { twMerge } from 'tailwind-merge';
import { IconRenderer } from '../common/icons/icon-renderer';

export const FormPopup = (props: { icon; title; children, theme?, ui?, popupStyle?}) => {

  const { classes, style } = (props.ui || {})['popup'] || {};
  const controlTheme = getElementTheme('popup', props.theme);

  return (
    <>
      <Popover position="context" className={twMerge("min-w-[600px] max-h-[800px] overflow-auto", controlTheme.className, classes?.join(' '))} offsetY={-20} content={<div>{props.children}</div>}>
        <div className='relative'>
          <button className={classNames('absolute z-10 right-1 top-1 text-sm group rounded flex items-center gap-2 bg-white border border-gray-100 hover:bg-cyan-100 p-1 hover:scale-125 duration-300 ease-in-out transition-all')}>
            <IconRenderer icon={props.icon ? props.icon : 'MdOpenInNew'} className={''} />
            {props.title && <span> {props.title}</span>}
          </button>
        </div>
      </Popover>
      {
        props.popupStyle === 'mini' && (
          <div className='max-h-24 overflow-hidden'>
            {props.children}
          </div>
        )
      }
    </>
  );
};
