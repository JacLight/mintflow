import React from 'react';
import { getRandomString } from '../utils';
import { IconRenderer } from './icons/icon-renderer';

export const ButtonAdd = (props: { handler; controlRef?; className?}) => {

  const onClick = (event) => {
    props.handler(event, props.controlRef);
  };

  const buttonClass = 'custom-button custom-button-add ' + props.className
  return (
    <button key={getRandomString()} className={buttonClass} onClick={onClick} title="Add item">
      <IconRenderer icon='Plus' />
    </button>
  );
};
