import React from 'react';
import { withTooltip } from './tooltip';
import { classNames, getRandomString } from '@/lib/utils';
import { buttonClass, buttonHoverClass } from '@/lib-client/constants';
import { IconRenderer } from './icon-renderer';
import BusyIcon from './busy-icon';


const ButtonTooltip = withTooltip('button', 'bottom', 20, 0);
export const Button = (props: { id?, title?, onClick; controlRef?; iconSize?, isLoading?; label?; icon?; className?, unstyled?, children?}) => {

  const onClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    props.onClick(props.controlRef);
  };

  const baseStyle = props.unstyled ? '' : classNames(buttonHoverClass, buttonClass, 'w-full')
  return (
    <ButtonTooltip id={props.id || props.title || getRandomString(6)} title={props.title} className={classNames(baseStyle, props.className)} onClick={onClick}>
      {props.children ? props.children : <>
        <BusyIcon isLoading={props.isLoading} size={props.iconSize ? props.iconSize : undefined} />
        {typeof props.icon === 'string' ? <IconRenderer icon={props.icon as any} size={props.iconSize ? props.iconSize : undefined} /> : (props.icon || null)}
        {props.label && <span>{props.label}</span>}
      </>
      }
    </ButtonTooltip>
  );
};
