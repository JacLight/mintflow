import { DragEvent, useState, useEffect } from 'react';
import { IconRenderer } from '../ui/icon-renderer';
import { classNames } from '@/lib/utils';
import {
    Node as NodeType,
    getNodes,
    groupNodesByGroup,
    ComponentType as NodeComponentType,
    ComponentGroup as NodeComponentGroup,
    getNodesWithGroups
} from '@/lib/node-service';

// Component types that can be dragged onto the canvas
type ComponentType = {
    type: string;
    id?: string;
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
function DraggableComponent({ type, id, name, description, icon }: ComponentType) {
    // Handle drag start event
    const onDragStart = (event: DragEvent<HTMLDivElement>) => {
        event.dataTransfer.setData('application/reactflow/type', type);
        event.dataTransfer.setData('application/reactflow/name', name);
        if (id) {
            event.dataTransfer.setData('application/reactflow/id', id);
        }
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
export function ComponentPanel({
    componentTypes: propComponentTypes,
    componentGroups: propComponentGroups
}: {
    componentTypes?: ComponentType[],
    componentGroups?: ComponentGroup[]
} = {}) {
    const [isOpen, setIsOpen] = useState(false);
    const [componentTypes, setComponentTypes] = useState<ComponentType[]>(propComponentTypes || []);
    const [componentGroups, setComponentGroups] = useState<ComponentGroup[]>(propComponentGroups || []);
    const [isLoading, setIsLoading] = useState(!propComponentTypes && !propComponentGroups);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortAscending, setSortAscending] = useState(true);
    const [showGroups, setShowGroups] = useState(true);

    // Use React's useEffect to load components when the component mounts
    // This is the standard React pattern for data fetching
    // Empty dependency array means this effect runs once when the component mounts
    useEffect(() => {
        // If props were provided, we don't need to fetch
        if (propComponentTypes && propComponentGroups) {
            setIsLoading(false);
            return;
        }

        // Set loading state
        setIsLoading(true);

        // Use the node service to fetch nodes with groups
        getNodesWithGroups()
            .then(({ componentTypes, componentGroups }) => {
                if (!componentTypes || componentTypes.length === 0) {
                    setError('No components available');
                    return;
                }

                setComponentTypes(componentTypes);
                setComponentGroups(componentGroups);
                setError(null);
            })
            .catch(err => {
                console.error('Error loading components:', err);
                setError('Failed to load components');
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [propComponentTypes, propComponentGroups]);

    // Handle search input change
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    // Filter and sort components based on search term and sort direction
    function getFilteredAndSortedGroups() {
        if (!componentTypes.length) return [];

        if (searchTerm) {
            // Filter components directly
            const filteredComponents = componentTypes.filter(component =>
                component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                component.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                component.type.toLowerCase().includes(searchTerm.toLowerCase())
            );

            // Create filtered groups
            const originalGroups = Object.entries(
                componentTypes.reduce((groups, component) => {
                    (component.groups || ['uncategorized']).forEach(group => {
                        if (!groups[group]) groups[group] = [];
                        groups[group].push(component);
                    });
                    return groups;
                }, {} as Record<string, ComponentType[]>)
            ).map(([name, components]) => ({ name, components }));

            // Filter the original groups
            return originalGroups.map(group => {
                const groupFilteredComponents = group.components.filter(component =>
                    filteredComponents.some(c => c.type === component.type)
                );
                return {
                    ...group,
                    components: groupFilteredComponents.sort((a, b) => {
                        const comparison = a.name.localeCompare(b.name);
                        return sortAscending ? comparison : -comparison;
                    })
                };
            }).filter(group => group.components.length > 0);
        } else {
            // Just sort the existing groups
            return componentGroups.map(group => ({
                ...group,
                components: [...group.components].sort((a, b) => {
                    const comparison = a.name.localeCompare(b.name);
                    return sortAscending ? comparison : -comparison;
                })
            }));
        }
    }

    // Get all components as a flat list, sorted
    const getAllComponentsSorted = () => {
        // Filter components based on search term
        const filtered = searchTerm
            ? componentTypes.filter(component =>
                component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                component.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                component.type.toLowerCase().includes(searchTerm.toLowerCase())
            )
            : componentTypes;

        // Sort components by name
        return [...filtered].sort((a, b) => {
            const comparison = a.name.localeCompare(b.name);
            return sortAscending ? comparison : -comparison;
        });
    };

    // Toggle sort direction
    const toggleSortDirection = () => {
        setSortAscending(!sortAscending);
    };

    // Toggle between grouped and flat view
    const toggleGroupView = () => {
        setShowGroups(!showGroups);
    };

    // Get the filtered and sorted groups
    const filteredGroups = getFilteredAndSortedGroups();

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
                                filteredGroups.length === 0 ? (
                                    <div className="text-center py-4 text-sm text-gray-500">No components available</div>
                                ) : (
                                    filteredGroups.map((group) => (
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
