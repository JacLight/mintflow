'use client';
// ResizeHandleOverlay.js
import React, { useEffect, useRef } from 'react';
import { useSelection } from './selection-context';

interface ResizeHandleOverlayProps {
    onResizeStart: (e, d?) => void;
}

const ResizeHandleOverlay: React.FC<ResizeHandleOverlayProps> = ({ onResizeStart }) => {
    const { selectedElement } = useSelection();
    const overlayRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const overlay = overlayRef.current;
        if (!selectedElement) {
            if (overlay) overlay.style.display = 'none';
            return;
        }

        const updateOverlayPosition = () => {
            if (!overlay) return;
            const rect = selectedElement.getBoundingClientRect();
            overlay.style.display = 'block';
            overlay.style.position = 'absolute';
            overlay.style.left = `${rect.left + window.scrollX}px`;
            overlay.style.top = `${rect.top + window.scrollY}px`;
            overlay.style.width = `${rect.width}px`;
            overlay.style.height = `${rect.height}px`;
            overlay.style.pointerEvents = 'none';
            overlay.style.zIndex = '1000';
        };

        updateOverlayPosition();

        const resizeObserver = new ResizeObserver(updateOverlayPosition);
        resizeObserver.observe(selectedElement);

        const mutationObserver = new MutationObserver(updateOverlayPosition);
        mutationObserver.observe(selectedElement, {
            attributes: true,
            attributeFilter: ['style', 'class'],
        });

        window.addEventListener('scroll', updateOverlayPosition);

        return () => {
            resizeObserver.disconnect();
            mutationObserver.disconnect();
            window.removeEventListener('scroll', updateOverlayPosition);
        };
    }, [selectedElement]);

    return <div ref={overlayRef} onMouseDown={onResizeStart} />;
};

export default ResizeHandleOverlay;
