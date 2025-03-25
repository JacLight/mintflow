'use client';

import React from 'react';
import { SelectionProvider } from './selection-context';
import EditableElement from './editable-element';
import ResizeHandleOverlay from './resize-handle';

const EditableComponent = () => {
    interface ResizeEvent extends MouseEvent {
        clientX: number;
        clientY: number;
    }

    interface SelectedElement extends HTMLElement {
        offsetWidth: number;
        offsetHeight: number;
        style: CSSStyleDeclaration;
    }

    const handleResizeStart = (e: ResizeEvent, selectedElement: SelectedElement) => {
        e.stopPropagation();

        const startWidth = selectedElement.offsetWidth;
        const startHeight = selectedElement.offsetHeight;
        const startX = e.clientX;
        const startY = e.clientY;

        const handleMouseMove = (e: ResizeEvent) => {
            const newWidth = Math.max(startWidth + (e.clientX - startX), 10);
            const newHeight = Math.max(startHeight + (e.clientY - startY), 10);

            selectedElement.style.width = `${newWidth}px`;
            selectedElement.style.height = `${newHeight}px`;
        };

        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    return (
        <SelectionProvider>
            <div>
                {/* Your content */}
                <EditableElement tag="section" style={{ padding: '10px' }} className='bg-gray-100 p-4 m-4'>
                    <EditableElement tag='span'>Editable Section</EditableElement>
                    <EditableElement tag="div" style={{ padding: '10px' }} className='bg-cyan-100 p-4 m-4'>
                        Editable DIV
                    </EditableElement>
                    <EditableElement tag="p" style={{ padding: '10px' }} className='bg-purple-100 p-4 m-4'>
                        Editable Paragraph
                    </EditableElement>
                    <EditableElement
                        tag="img"
                        src="https://images.pexels.com/photos/276583/pexels-photo-276583.jpeg?auto=compress&cs=tinysrgb&h=350"
                        alt="Sample Image"
                    />
                </EditableElement>
                <EditableElement
                    tag="img"
                    src="https://images.pexels.com/photos/276583/pexels-photo-276583.jpeg?auto=compress&cs=tinysrgb&h=350"
                    alt="Sample Image"
                />
                {/* Add more elements as needed */}
                <ResizeHandleOverlay onResizeStart={handleResizeStart} />
            </div>
        </SelectionProvider>
    );
};

export default EditableComponent;
