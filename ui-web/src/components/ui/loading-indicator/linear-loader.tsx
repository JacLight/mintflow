'use client';

import { useSiteStore } from '@/context/site-store';
import React, { useEffect } from 'react';
import { useShallow } from 'zustand/shallow';

export const LinearLoader = () => {
  const { isLoading } = useSiteStore().ui(useShallow(state => ({ isLoading: state.isLoading })));
  const [show, setShow] = React.useState(false);
  const ref: any = React.useRef(null);


  useEffect(() => {
    if (ref.current) {
      clearTimeout(ref.current);
    }
    console.log('isLoading', isLoading);
    if (isLoading) {
      ref.current = setTimeout(() => {
        setShow(isLoading);
      }, 100);
    } else {
      ref.current = setTimeout(() => {
        setShow(isLoading);
      }, 500);
    }
  }, [isLoading]);

  if (show === true) <div className="loading-bar"></div>;
  return <div className='h-[5px]'></div>;
};
