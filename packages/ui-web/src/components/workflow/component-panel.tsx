'use client';

import { DragEvent, useState } from 'react';
import { LucideIcon } from 'lucide-react';
import { getComponentTypes } from './node-registry';
import { IconRenderer } from '../ui/icon-renderer';
import { classNames } from '@/lib/utils';

// Component types that can be dragged onto the canvas
type ComponentType = {
    type: string;
    name: string;
    description: string;
    icon: LucideIcon;
};

// Get available component types from the registry
// You can filter which components to show by passing an array of types
// For example: const componentTypes = getComponentTypes(['info', 'dynamic', 'app-view']);
const componentTypes = getComponentTypes();

// Draggable component item
function DraggableComponent({ type, name, description, icon: Icon }: ComponentType) {
    // Handle drag start event
    const onDragStart = (event: DragEvent<HTMLDivElement>) => {
        event.dataTransfer.setData('application/reactflow/type', type);
        event.dataTransfer.setData('application/reactflow/name', name);
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <div
            className="flex cursor-grab items-center gap-3 rounded-md border bg-background p-3 shadow-sm transition-colors hover:bg-muted"
            draggable
            onDragStart={onDragStart}
        >
            <div className="flex h-10 w-10 items-center justify-center rounded-md border bg-background">
                <Icon className="h-5 w-5" />
            </div>
            <div>
                <div className="font-medium">{name}</div>
                <div className="text-xs text-muted-foreground">{description}</div>
            </div>
        </div>
    );
}

// Component panel with draggable components
export function ComponentPanel() {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="flex flex-col border-r absolute top-[60px] left-[16px] bg-white shadow-md rounded-md z-50 transition-all duration-300 ease-in-out w-64">
            <div className="p-3">
                <div className='flex items-center justify-between'>
                    <h2 className="font-semibold">Components</h2>
                    <button
                        className='p-1 shadow-sm rounded-md hover:bg-muted'
                        onClick={() => setIsOpen(!isOpen)}
                        aria-label={isOpen ? "Close components panel" : "Open components panel"}
                        title={isOpen ? "Close components panel" : "Open components panel"}
                    >
                        <IconRenderer icon={isOpen ? 'ChevronUp' : 'ChevronDown'} className='h-4 w-4' />
                    </button>
                </div>
                <p className={classNames("text-sm text-muted-foreground transition-all duration-300 pt-2",
                    isOpen ? "opacity-100 max-h-20" : "opacity-0 max-h-0 overflow-hidden"
                )}>
                    Drag and drop components onto the canvas to build your workflow.
                </p>
            </div>
            <div className={classNames(
                "flex-1 space-y-2 overflow-auto p-3 transition-all duration-300 ease-in-out",
                isOpen ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden p-0'
            )}>
                {componentTypes.map((component) => (
                    <DraggableComponent key={component.type} {...component} />
                ))}
            </div>
        </div>
    );
}
