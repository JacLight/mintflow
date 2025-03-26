import React from 'react';
import { Popover } from './popover';

export const usePopover = (content, position) => {
    return {
        PopoverWrapper: ({ children }) => (
            <Popover content={content} position={position}>
                {children}
            </Popover>
        ),
    };
};

// export default usePopover;
