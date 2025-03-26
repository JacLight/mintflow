import { IconRenderer } from '../common/icons/icon-renderer';
import React, { useState } from 'react';
import { StyledComponent } from './styling';
import { extractStylingFromSchema, getComponentPartStyling } from './styling/style-utils';
import { twMerge } from 'tailwind-merge';

export const RatingInput = (props: {
  path;
  change;
  blur;
  value;
  data;
  schema: {
    scale;
    update;
    total;
    min;
    max
  };
  theme?;
}) => {
  // Extract styling from schema
  const customStyling = props.schema ? extractStylingFromSchema(props.schema) : undefined;

  // Get rating styling
  const containerClasses = getComponentPartStyling('rating',  'container', '',  props.theme,  customStyling);
  const starsContainerClasses = getComponentPartStyling('rating',  'starsContainer', '',  props.theme,  customStyling);
  const starClasses = getComponentPartStyling('rating',  'star', '',  props.theme,  customStyling);
  const starFilledClasses = getComponentPartStyling('rating',  'starFilled', '',  props.theme,  customStyling);
  const starEmptyClasses = getComponentPartStyling('rating',  'starEmpty', '',  props.theme,  customStyling);
  const totalClasses = getComponentPartStyling('rating',  'total', '',  props.theme,  customStyling);

  const [rating, setRating] = useState<number>(props.value || 0);
  const [hover, setHover] = useState<number>(0);

  const handleRating = (newRating: number) => {
    setRating(newRating);

    // Notify parent component of change
    if (props.change) {
      props.change(newRating);
    }

    if (props.blur) {
      props.blur(newRating);
    }
  };

  const { scale = 5, total } = props.schema;

  return (
    <StyledComponent
      componentType="rating"
      part="container"
      schema={props.schema}
      theme={props.theme}
      className="flex items-center"
    >
      <StyledComponent
        componentType="rating"
        part="starsContainer"
        schema={props.schema}
        theme={props.theme}
        className="flex justify-start items-center gap-2 text-xs"
      >
        {[...Array(scale)].map((_, i) => {
          const ratingValue = i + 1;
          const isFilled = ratingValue <= (hover || rating);

          return (
            <StyledComponent
              key={ratingValue}
              componentType="rating"
              part="star"
              schema={props.schema}
              theme={props.theme}
              as="span"
              onMouseEnter={() => setHover(ratingValue)}
              onMouseLeave={() => setHover(0)}
            >
              <StyledComponent
                componentType="rating"
                part={isFilled ? "starFilled" : "starEmpty"}
                schema={props.schema}
                theme={props.theme}
                as="button"
                onClick={() => handleRating(ratingValue)}
                title={`Rate ${ratingValue} out of ${scale}`}
                aria-label={`Rate ${ratingValue} out of ${scale}`}
                className={isFilled ? "focus:outline-none" : "focus:outline-none"}
              >
                <IconRenderer
                  icon="Star"
                  className={isFilled ? "fill-yellow-400 stroke-yellow-500" : "fill-white stroke-gray-500"}
                />
              </StyledComponent>
            </StyledComponent>
          );
        })}

        {total && (
          <StyledComponent
            componentType="rating"
            part="total"
            schema={props.schema}
            theme={props.theme}
            as="span"
          >
            {total}
          </StyledComponent>
        )}
      </StyledComponent>
    </StyledComponent>
  );
};
