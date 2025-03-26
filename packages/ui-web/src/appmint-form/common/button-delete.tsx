import { getRandomString } from '../utils';
import React, { useState, useEffect, useRef } from 'react';
import { IconRenderer } from './icons/icon-renderer';

export const ButtonDelete = (props: { deleteHandler; icon?; iconColor?; controlRef?; className?; style?, unStyled?, reset?, size?}) => {
  const [isActive, setActive] = useState(false);
  const { deleteHandler, controlRef, className, style, unStyled } = props;
  const ref = useRef(null);

  useEffect(() => {
    if (props.reset) {
      setActive(false);
    }
  }, [props.reset]);

  const confirmClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (!isActive) {
      setActive(true);
      setTimeout(() => {
        setActive(false);
      }, 3000);
    } else {
      setActive(false);
      deleteHandler(controlRef);
    }
  };

  let buttonClass;
  if (unStyled) {
    buttonClass = isActive ? 'custom-button-red  custom-button-delete ' + className : ' custom-button-delete ' + className;
  } else {
    buttonClass = isActive ? 'custom-button-red custom-button custom-button-delete ' + className : 'custom-button custom-button-delete ' + className;
  }

  return (
    <button ref={ref} key={getRandomString()} className={buttonClass} onClick={confirmClick} onBlur={e => setActive(false)} style={style}>
      {isActive ? <IconRenderer icon='Check' size={props.size} /> : <IconRenderer icon='Trash' size={props.size} />}
    </button>
  );
};