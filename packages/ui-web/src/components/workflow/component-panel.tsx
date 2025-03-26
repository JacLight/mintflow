'use client';

import { DragEvent, useState, useEffect } from 'react';
import { LucideIcon } from 'lucide-react';
import { IconRenderer } from '../ui/icon-renderer';
import { classNames } from '@/lib/utils';
import { getMintflowClient } from '@/lib/mintflow-client';

// Component types that can be dragged onto the canvas
type ComponentType = {
    type: string;
    name: string;
    description: string;
    icon: string | React.ReactNode;
};

// Draggable component item
function DraggableComponent({ type, name, description, icon }: ComponentType) {
    // Handle drag start event
    const onDragStart = (event: DragEvent<HTMLDivElement>) => {
        event.dataTransfer.setData('application/reactflow/type', type);
        event.dataTransfer.setData('application/reactflow/name', name);
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <div
            className="flex cursor-grab items-center gap-3 rounded-md border bg-background p-2 shadow-sm transition-colors hover:bg-muted"
            draggable
            onDragStart={onDragStart}
            title={description}
        >
            <div className="flex  p-1 items-center justify-center rounded-md border bg-background">
                <IconRenderer icon={icon} className="h-5 w-5" />
            </div>
            <div className="flex-1">
                <div className="font-medium text-sm">{name}</div>
            </div>
        </div>
    );
}

// Component panel with draggable components
export function ComponentPanel() {
    const [isOpen, setIsOpen] = useState(false);
    const [componentTypes, setComponentTypes] = useState<ComponentType[]>([]);
    const [filteredComponents, setFilteredComponents] = useState<ComponentType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortAscending, setSortAscending] = useState(true);

    // Fetch components from the server
    useEffect(() => {
        const fetchComponents = async () => {
            try {
                setIsLoading(true);
                const mintflowClient = getMintflowClient();

                // Only fetch the fields we need for the component panel
                const response = await mintflowClient.getNodes(['id', 'name', 'description', 'icon']);

                if (response.nodes) {
                    // Map the server response to our ComponentType format
                    const components = response.nodes.map((node: any) => ({
                        type: node.id,
                        name: node.name,
                        description: node.description || 'No description available',
                        icon: node.icon || 'Box' // Default icon if none provided
                    }));

                    setComponentTypes(components);
                    setFilteredComponents(components);
                    setError(null);
                } else {
                    setError('Failed to fetch components');
                }
            } catch (err) {
                console.error('Error fetching components:', err);
                setError('Failed to load components');
            } finally {
                setIsLoading(false);
            }
        };

        fetchComponents();
    }, []);

    // Filter and sort components when search term or sort direction changes
    useEffect(() => {
        if (!componentTypes.length) return;

        // Filter components based on search term
        let filtered = componentTypes;
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = componentTypes.filter(
                component =>
                    component.name.toLowerCase().includes(term) ||
                    component.description.toLowerCase().includes(term) ||
                    component.type.toLowerCase().includes(term)
            );
        }

        // Sort components by name (ascending or descending)
        filtered = [...filtered].sort((a, b) => {
            const comparison = a.name.localeCompare(b.name);
            return sortAscending ? comparison : -comparison;
        });

        setFilteredComponents(filtered);
    }, [componentTypes, searchTerm, sortAscending]);

    // Handle search input change
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    // Toggle sort direction
    const toggleSortDirection = () => {
        setSortAscending(!sortAscending);
    };

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
                <p className={classNames("text-sm text-muted-foreground transition-all duration-300",
                    isOpen ? "opacity-100 max-h-20 pt-2" : "opacity-0 max-h-0 overflow-hidden "
                )}>
                    Drag and drop components onto the canvas to build your workflow.
                </p>
            </div>
            <div className={classNames(
                "flex-1 overflow-auto transition-all duration-300 ease-in-out",
                isOpen ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden p-0'
            )}>
                {isLoading ? (
                    <div className="text-center py-4">Loading components...</div>
                ) : error ? (
                    <div className="text-center py-4 text-red-500">{error}</div>
                ) : componentTypes.length === 0 ? (
                    <div className="text-center py-4">No components available</div>
                ) : (
                    <>
                        <div className="flex items-center gap-2 p-3 pb-2 border-b">
                            <div className="flex-1 relative">
                                <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400">
                                    <IconRenderer icon="Search" className="h-4 w-4" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search components..."
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    className="w-full pl-8 pr-2 py-1 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    aria-label="Search components"
                                />
                            </div>
                            <button
                                onClick={toggleSortDirection}
                                className="p-1 border rounded-md hover:bg-muted focus:outline-none focus:ring-1 focus:ring-blue-500"
                                aria-label={sortAscending ? "Sort descending" : "Sort ascending"}
                                title={sortAscending ? "Sort descending" : "Sort ascending"}
                            >
                                <IconRenderer icon={sortAscending ? "ArrowUp" : "ArrowDown"} className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="space-y-2 p-3">
                            {filteredComponents.length === 0 ? (
                                <div className="text-center py-4 text-sm text-gray-500">No matching components</div>
                            ) : (
                                filteredComponents.map((component) => (
                                    <DraggableComponent key={component.type} {...component} />
                                ))
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
