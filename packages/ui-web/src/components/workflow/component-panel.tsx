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
    groups?: string[];
};

// Group of components
type ComponentGroup = {
    name: string;
    components: ComponentType[];
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
            <div className="flex p-1 items-center justify-center rounded-md border bg-background">
                <IconRenderer icon={icon} className="h-5 w-5" />
            </div>
            <div className="flex-1">
                <div className="font-medium text-sm">{name}</div>
            </div>
        </div>
    );
}

// Component group with collapsible list of components
function ComponentGroupSection({ name, components, searchTerm }: ComponentGroup & { searchTerm: string }) {
    const [isExpanded, setIsExpanded] = useState(true);

    // Filter components based on search term
    const filteredComponents = searchTerm
        ? components.filter(component =>
            component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            component.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            component.type.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : components;

    // Don't render if no components match the search
    if (filteredComponents.length === 0) return null;

    // Format group name for display (capitalize first letter)
    const displayName = name.charAt(0).toUpperCase() + name.slice(1);

    return (
        <div className="mb-3">
            <div
                className="flex items-center justify-between py-1 px-2 bg-muted rounded cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <h3 className="text-sm font-medium">{displayName}</h3>
                <IconRenderer
                    icon={isExpanded ? 'ChevronDown' : 'ChevronRight'}
                    className="h-4 w-4 text-muted-foreground"
                />
            </div>
            {isExpanded && (
                <div className="mt-2 space-y-2 pl-2">
                    {filteredComponents.map((component) => (
                        <DraggableComponent key={component.type} {...component} />
                    ))}
                </div>
            )}
        </div>
    );
}

// Component panel with draggable components
export function ComponentPanel() {
    const [isOpen, setIsOpen] = useState(false);
    const [componentTypes, setComponentTypes] = useState<ComponentType[]>([]);
    const [componentGroups, setComponentGroups] = useState<ComponentGroup[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortAscending, setSortAscending] = useState(true);
    const [showGroups, setShowGroups] = useState(true);

    // Fetch components from the server
    useEffect(() => {
        const fetchComponents = async () => {
            try {
                setIsLoading(true);
                const mintflowClient = getMintflowClient();

                // Only fetch the fields we need for the component panel
                const response = await mintflowClient.getNodes(['id', 'name', 'groups', 'description', 'icon']);

                if (response.nodes) {
                    // Map the server response to our ComponentType format
                    const components = response.nodes.map((node: any) => ({
                        id: node.id,
                        type: 'dynamic',
                        name: node.name,
                        description: node.description || 'No description available',
                        icon: node.icon || 'Box', // Default icon if none provided
                        groups: node.groups || ['uncategorized'] // Default group if none provided
                    }));

                    // Organize components into groups
                    const groupMap = new Map<string, ComponentType[]>();

                    // First, collect all components by their groups
                    components.forEach((component: ComponentType) => {
                        component.groups?.forEach((group: string) => {
                            if (!groupMap.has(group)) {
                                groupMap.set(group, []);
                            }
                            groupMap.get(group)?.push(component);
                        });
                    });

                    // Convert the map to an array of ComponentGroup objects
                    const groups: ComponentGroup[] = Array.from(groupMap.entries()).map(([name, components]) => ({
                        name,
                        components
                    }));

                    // Sort groups alphabetically
                    groups.sort((a, b) => a.name.localeCompare(b.name));

                    // Move "uncategorized" to the end if it exists
                    const uncategorizedIndex = groups.findIndex(g => g.name === 'uncategorized');
                    if (uncategorizedIndex !== -1) {
                        const [uncategorized] = groups.splice(uncategorizedIndex, 1);
                        groups.push(uncategorized);
                    }

                    // Sort components within each group
                    groups.forEach(group => {
                        group.components.sort((a, b) => a.name.localeCompare(b.name));
                    });

                    setComponentTypes(components);
                    setComponentGroups(groups);
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

    // Handle search input change
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    // Toggle sort direction
    const toggleSortDirection = () => {
        setSortAscending(!sortAscending);

        // Sort components within each group based on the new direction
        setComponentGroups(prevGroups =>
            prevGroups.map(group => ({
                ...group,
                components: [...group.components].sort((a, b) => {
                    const comparison = a.name.localeCompare(b.name);
                    return sortAscending ? -comparison : comparison; // Note the inversion because we've already toggled sortAscending
                })
            }))
        );
    };

    // Toggle between grouped and flat view
    const toggleGroupView = () => {
        setShowGroups(!showGroups);
    };

    // Get all components as a flat list, sorted
    const getAllComponentsSorted = () => {
        return [...componentTypes].sort((a, b) => {
            const comparison = a.name.localeCompare(b.name);
            return sortAscending ? comparison : -comparison;
        }).filter(component =>
            !searchTerm ||
            component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            component.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            component.type.toLowerCase().includes(searchTerm.toLowerCase())
        );
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
                            <button
                                onClick={toggleGroupView}
                                className={classNames(
                                    "p-1 border rounded-md hover:bg-muted focus:outline-none focus:ring-1 focus:ring-blue-500",
                                    showGroups ? "bg-muted" : ""
                                )}
                                aria-label={showGroups ? "Show flat list" : "Show grouped list"}
                                title={showGroups ? "Show flat list" : "Show grouped list"}
                            >
                                <IconRenderer icon="Layers" className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="p-3">
                            {showGroups ? (
                                // Grouped view
                                componentGroups.length === 0 ? (
                                    <div className="text-center py-4 text-sm text-gray-500">No components available</div>
                                ) : (
                                    componentGroups.map((group) => (
                                        <ComponentGroupSection
                                            key={group.name}
                                            name={group.name}
                                            components={group.components}
                                            searchTerm={searchTerm}
                                        />
                                    ))
                                )
                            ) : (
                                // Flat view
                                <div className="space-y-2">
                                    {getAllComponentsSorted().length === 0 ? (
                                        <div className="text-center py-4 text-sm text-gray-500">No matching components</div>
                                    ) : (
                                        getAllComponentsSorted().map((component) => (
                                            <DraggableComponent key={component.type} {...component} />
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
