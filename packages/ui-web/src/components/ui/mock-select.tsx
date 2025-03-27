'use client';

import * as React from 'react';

// Mock implementation of @radix-ui/react-select
const Root = ({ children, ...props }: React.PropsWithChildren<any>) => {
  return <div className="select-root" {...props}>{children}</div>;
};

const Group = ({ children, ...props }: React.PropsWithChildren<any>) => {
  return <div className="select-group" {...props}>{children}</div>;
};

const Value = ({ children, ...props }: React.PropsWithChildren<any>) => {
  return <span className="select-value" {...props}>{children}</span>;
};

const Trigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }>(
  ({ children, ...props }, ref) => {
    return (
      <button ref={ref} className="select-trigger" {...props}>
        {children}
      </button>
    );
  }
);
Trigger.displayName = 'SelectTrigger';

const Icon = ({ asChild, children, ...props }: React.PropsWithChildren<{ asChild?: boolean }>) => {
  return <span className="select-icon" {...props}>{children}</span>;
};

const ScrollUpButton = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ children, ...props }, ref) => {
    return (
      <div ref={ref} className="select-scroll-up" {...props}>
        {children}
      </div>
    );
  }
);
ScrollUpButton.displayName = 'SelectScrollUpButton';

const ScrollDownButton = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ children, ...props }, ref) => {
    return (
      <div ref={ref} className="select-scroll-down" {...props}>
        {children}
      </div>
    );
  }
);
ScrollDownButton.displayName = 'SelectScrollDownButton';

const Portal = ({ children, ...props }: React.PropsWithChildren<any>) => {
  return <div className="select-portal" {...props}>{children}</div>;
};

const Content = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { position?: string }>(
  ({ children, ...props }, ref) => {
    return (
      <div ref={ref} className="select-content" {...props}>
        {children}
      </div>
    );
  }
);
Content.displayName = 'SelectContent';

const Viewport = ({ children, ...props }: React.PropsWithChildren<any>) => {
  return <div className="select-viewport" {...props}>{children}</div>;
};

const Label = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ children, ...props }, ref) => {
    return (
      <div ref={ref} className="select-label" {...props}>
        {children}
      </div>
    );
  }
);
Label.displayName = 'SelectLabel';

const Item = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ children, ...props }, ref) => {
    return (
      <div ref={ref} className="select-item" {...props}>
        {children}
      </div>
    );
  }
);
Item.displayName = 'SelectItem';

const ItemIndicator = ({ children, ...props }: React.PropsWithChildren<any>) => {
  return <span className="select-item-indicator" {...props}>{children}</span>;
};

const ItemText = ({ children, ...props }: React.PropsWithChildren<any>) => {
  return <span className="select-item-text" {...props}>{children}</span>;
};

const Separator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ children, ...props }, ref) => {
    return (
      <div ref={ref} className="select-separator" {...props}>
        {children}
      </div>
    );
  }
);
Separator.displayName = 'SelectSeparator';

export {
  Root,
  Group,
  Value,
  Trigger,
  Icon,
  ScrollUpButton,
  ScrollDownButton,
  Portal,
  Content,
  Viewport,
  Label,
  Item,
  ItemIndicator,
  ItemText,
  Separator,
};
