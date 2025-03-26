import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';

export const Tooltip = ({ content, isVisible, target, position = 'bottom', gapY = 5, gapX = 5 }) => {
  const [positionStyle, setPositionStyle] = useState<any>({ opacity: 0 });
  const tooltipRef: any = useRef();

  useEffect(() => {
    if (isVisible && target && tooltipRef.current) {
      const targetRect = target.getBoundingClientRect();
      const tooltipRect = tooltipRef.current?.getBoundingClientRect();
      let top, left, transform;


      switch (position) {
        case 'top':
          top = targetRect.top - tooltipRect.height - gapY;
          left = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2 + gapX;
          break;
        case 'right':
          top = targetRect.top + targetRect.height / 2 - tooltipRect.height / 2 + gapY;
          left = targetRect.right + gapX;
          break;
        case 'bottom':
          top = targetRect.bottom + gapY;
          left = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2 + gapX;
          break;
        case 'left':
          top = targetRect.top + targetRect.height / 2 - tooltipRect.height / 2 + gapY;
          left = targetRect.left - tooltipRect.width - gapX;
          break;
        default:
          top = targetRect.bottom + gapY;
          left = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2 + gapX;
      }

      setPositionStyle({
        top: `${top}px`,
        left: `${left}px`,
        transform,
        opacity: 0,
      });

      setTimeout(() => {
        setPositionStyle({
          top: `${top}px`,
          left: `${left}px`,
          transform,
          opacity: 1,
        });
      }, 100);
    }
  }, [isVisible, target, position, tooltipRef]);

  if (!isVisible) {
    return null;
  }

  const initialStyle = {
    position: 'absolute',
    backgroundColor: 'black',
    color: 'white',
    padding: '4px 8px',
    borderRadius: '4px',
    zIndex: 2000,
    whiteSpace: 'nowrap',
    pointerEvents: 'none',
    opacity: 0,
  };

  return ReactDOM.createPortal(
    <div className="transiction-all duration-100 opacity-0  ease-in-out text-sm" ref={tooltipRef} style={{ ...initialStyle, ...positionStyle }}>
      {content}
    </div>,
    document.body,
  );
};
