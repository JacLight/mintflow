import { getRandomString } from '../utils';
import React, { useEffect } from 'react';
import { IconRenderer } from './icons/icon-renderer';

export const ButtonCancel = (props: { handler; controlRef?, className?}) => {
  useEffect(() => { });

  const confirmClick = () => {
    props.handler(props.controlRef);
  };

  return (
    <button key={getRandomString()} className={"custom-button custom-button-add " + (props.className || "")} onClick={confirmClick}>
      <IconRenderer icon='X' />
    </button>
  );
};
