import React, { useState } from 'react';
import { Tooltip } from './tooltip';

export const withTooltip = (Component: any, position?: 'top' | 'right' | 'bottom' | 'left' | 'context', gapY?: number, gapX?: number) => {
  return React.forwardRef((props: any, ref) => {
    const { tooltip, title, ...rest } = props;
    const [isVisible, setIsVisible] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [target, setTarget] = useState();
    const info = tooltip || title;
    if (!info) {
      return <Component ref={ref} {...props} />;
    }

    const handleMouseEnter = e => {
      setTarget(e.target);
      setMousePos({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
      setTimeout(() => {
        checkMouseStillOn(e.target);
      }, 200);
      setTimeout(() => {
        setIsVisible(false);
      }, 3000);
    };

    const checkMouseStillOn = target => {
      if (isVisible) {
        if (target) {
          const rect = target.getBoundingClientRect();
          if (mousePos.x < rect.left || mousePos.x > rect.right || mousePos.y < rect.top || mousePos.y > rect.bottom) {
            setIsVisible(false);
          } else {
            setTimeout(() => {
              checkMouseStillOn(target);
            }, 200);
          }
        }
      }
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseMove = e => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    return (
      <>
        <Component ref={ref} onMouseEnter={handleMouseEnter} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} {...rest} />
        <Tooltip content={info} isVisible={isVisible} target={target} position={position} gapY={gapY} gapX={gapX} />
      </>
    );
  });
};
