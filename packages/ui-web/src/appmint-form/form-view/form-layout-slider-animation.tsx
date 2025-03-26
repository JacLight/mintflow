import { classNames } from '../utils';
import React, { useEffect, useRef, useState } from 'react';
export const FormLayoutSliderAnimation = ({ direction = 'horizontal', slideIndex, items, getView }) => {
  const scrollContainerRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const slideContainer = useRef(null);
  const [dim, setDim] = useState({ width: 0, height: 0 });

  useEffect(() => {
    setCurrentIndex(slideIndex);
  }, [slideIndex]);

  useEffect(() => {
    if (slideContainer.current) {
      const { width, height } = slideContainer.current.getBoundingClientRect();
      setDim({ width, height });
    }
  }, [slideContainer.current]);
  const updatePosition = index => {
    // Prevent scrolling beyond the first and last items
    const newIndex = Math.max(0, Math.min(index, items.length - 1));
    setCurrentIndex(newIndex);

    // anime({
    //   targets: scrollContainerRef.current,
    //   translateX: direction === 'horizontal' ? -newIndex * dim.width : 0,
    //   translateY: direction === 'vertical' ? -newIndex * dim.height : 0,
    //   easing: 'spring(1, 80, 15, 10)', // This will create a spring-like effect
    //   duration: 100, // Adjust duration according to your needs
    // });
  };

  useEffect(() => {
    updatePosition(currentIndex); // This ensures the position updates if the currentIndex changes elsewhere
  }, [currentIndex]);

  const prevHandler = () => {
    updatePosition(currentIndex - 1);
  };

  const nextHandler = () => {
    updatePosition(currentIndex + 1);
  };

  return (
    <div id="slide-container" ref={slideContainer} className="relative flex w-full h-full overflow-hidden items-center justify-center min-h-96">
      <div ref={scrollContainerRef} className={classNames(direction === 'horizontal' && 'flex', 'w-full h-full  items-center')}>
        {items.map((color, index) => {
          return (
            <div key={index} className="w-full h-full shrink-0 flex flex-col justify-center items-center">
              {getView(index)}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FormLayoutSliderAnimation;
