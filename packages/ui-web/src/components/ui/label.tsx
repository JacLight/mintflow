import * as React from 'react';

import { classNames } from '@/lib-client/helpers';

export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> { }

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, htmlFor, ...props }, ref) => {
    return (
      <label
        className={classNames(
          'block text-sm font-medium text-muted-foreground',
          className
        )}
        htmlFor={htmlFor}
        ref={ref}
        {...props}
      />
    );
  }
);
Label.displayName = 'Label';

export { Label };
