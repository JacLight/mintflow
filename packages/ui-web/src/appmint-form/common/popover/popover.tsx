import { classNames } from '../../utils';
import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';

/*
Example usage:
<div className="p-5">
    <Popover content={<div>This is the popover content</div>} position="right-10 top-16">
        <button className="bg-blue-500 text-white p-2 rounded">Click me</button>
    </Popover>
</div>

const { PopoverWrapper } = usePopover(<div>This is the popover content</div>, 'context');
<div className="p-5">
    <PopoverWrapper>
        <button className="bg-blue-500 text-white p-2 rounded">Click me</button>
    </PopoverWrapper>
</div>
*/

export const Popover = ({ children, content, position = 'bottom-10', offsetY = 0, offsetX = 0, className = '' }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [popoverStyle, setPopoverStyle] = useState({});
    const triggerRef = useRef(null);
    const contentRef = useRef(null);

    const toggleVisibility = (event) => {
        setIsVisible(vis => {
            if (!vis) {
                setTimeout(() => updatePosition(event), 0);
            }
            return !vis;
        });
    };

    const updatePosition = (event) => {
        if (!contentRef.current) return;

        if (position === 'center') {
            setPopoverStyle({
                top: `50%`,
                left: `50%`,
                transform: 'translate(-50%, -50%)'
            });
        } else if (position === 'context') {
            const clickX = event.clientX;
            const clickY = event.clientY;
            const screenW = window.innerWidth;
            const screenH = window.innerHeight;
            const rootW = contentRef.current.offsetWidth;
            const rootH = contentRef.current.offsetHeight;

            const right = (screenW - clickX) > rootW;
            const left = !right;
            const top = (screenH - clickY) > rootH;
            const bottom = !top;

            let newStyle: any = {};
            if (right) {
                newStyle.left = `${clickX + offsetX + 5}px`;
            } else {
                newStyle.left = `${clickX + offsetX - rootW - 5}px`;
            }

            if (top) {
                newStyle.top = `${clickY + offsetY + 5}px`;
            } else {
                newStyle.top = `${clickY + offsetY - rootH - 5}px`;
            }
            setPopoverStyle(newStyle);
        }
    };

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (
                contentRef.current &&
                !contentRef.current.contains(event.target) &&
                !triggerRef.current.contains(event.target)
            ) {
                setIsVisible(false);
            }
        };

        document.addEventListener('mousedown', handleOutsideClick);
        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, []);

    return (
        <>
            <div ref={triggerRef} onClick={toggleVisibility} className="cursor-pointer">
                {children}
            </div>
            {isVisible &&
                ReactDOM.createPortal(
                    <div
                        ref={contentRef}
                        className={classNames(position, className, `absolute bg-white shadow-lg p-3 rounded-md`)}
                        style={{ zIndex: 2000, ...popoverStyle }}
                    >
                        {content}
                    </div>,
                    document.body
                )}
        </>
    );
};