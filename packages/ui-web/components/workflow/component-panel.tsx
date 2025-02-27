'use client';

import { DragEvent } from 'react';
import { LucideIcon } from 'lucide-react';
import { getComponentTypes } from './node-registry';

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
    return (
        <div className="flex w-64 flex-col border-r bg-muted/20">
            <div className="p-4">
                <h2 className="mb-2 text-lg font-semibold">Components</h2>
                <p className="text-sm text-muted-foreground">
                    Drag and drop components onto the canvas to build your workflow.
                </p>
            </div>
            <div className="flex-1 space-y-2 overflow-auto p-4">
                {componentTypes.map((component) => (
                    <DraggableComponent key={component.type} {...component} />
                ))}
            </div>
        </div>
    );
}
