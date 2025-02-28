'use client';

import React, { useRef, useState, useEffect, forwardRef } from 'react';
import { useSelection } from './selection-context';
import { isEditableElement, isVoidElement } from './utils';

interface EditableElementProps {
    tag?: keyof JSX.IntrinsicElements;
    children?: React.ReactNode;
    [key: string]: any;
}

const EditableElement = forwardRef<HTMLElement, EditableElementProps>(({ tag: Tag = 'div', children, ...props }, ref) => {
    const elementRef = useRef(null);
    const combinedRef = (ref as React.MutableRefObject<HTMLElement>) || elementRef;
    const { selectedElement, setSelectedElement } = useSelection();

    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const isSelected =
        isMounted && selectedElement === combinedRef.current && combinedRef.current != null;

    const voidElement = isVoidElement(Tag);
    const editableElement = isEditableElement(Tag);

    // State and refs for dragging
    const position = useRef({ x: 0, y: 0 });
    const startPosition = useRef({ x: 0, y: 0 });
    const isDragging = useRef(false);

    // State for editing
    const [isEditing, setIsEditing] = useState(false);
    const [content, setContent] = useState(children);

    // Update content if children prop changes
    useEffect(() => {
        setContent(children);
    }, [children]);

    // Event handlers
    const handleMouseDown = (e) => {
        e.stopPropagation();
        setSelectedElement(combinedRef.current);

        if (e.target.dataset.resizeHandle) return; // Ignore if resize handle is clicked

        if (!isEditing) {
            isDragging.current = true;
            startPosition.current = {
                x: e.clientX - position.current.x,
                y: e.clientY - position.current.y,
            };

            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }
    };

    const handleMouseMove = (e) => {
        if (!isDragging.current) return;

        position.current = {
            x: e.clientX - startPosition.current.x,
            y: e.clientY - startPosition.current.y,
        };

        combinedRef.current.style.transform = `translate(${position.current.x}px, ${position.current.y}px)`;
    };

    const handleMouseUp = () => {
        isDragging.current = false;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    };

    const handleDoubleClick = (e) => {
        e.stopPropagation();
        if (editableElement) {
            setIsEditing(true);
        }
    };

    const handleBlur = () => {
        setIsEditing(false);
    };

    const handleChange = (e) => {
        setContent(e.target.value);
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);

    // Build the element's props
    const elementProps = {
        ref: combinedRef,
        ...props,
        onMouseDown: handleMouseDown,
        onDoubleClick: handleDoubleClick,
        style: {
            ...props.style,
            transform: `translate(${position.current.x}px, ${position.current.y}px)`,
            userSelect: isEditing ? 'text' : 'none',
            cursor: isEditing ? 'text' : 'move',
            position: props.style?.position || 'relative',
        },
        className: `${props.className || ''} ${isSelected ? 'selected' : ''}`,
    };

    // Render the element
    if (isEditing && editableElement) {
        // Render an input for editing
        return React.createElement('input', {
            ref: combinedRef,
            type: 'text',
            value: content,
            onChange: handleChange,
            className: elementProps.className,
            onBlur: handleBlur,
            autoFocus: true,
            style: {
                ...elementProps.style,
                height: 'auto',
                boxSizing: 'border-box',
            },
        });
    } else {
        return React.createElement(
            Tag,
            elementProps,
            voidElement ? null : content
        );
    }
});

export default React.memo(EditableElement);
