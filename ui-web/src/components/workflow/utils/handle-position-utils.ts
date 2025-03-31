import { Position } from '@xyflow/react';
import { NodePosition } from '../types';

/**
 * Utility function to distribute handles evenly along a container
 * @param nodeId Node ID
 * @param elements Array of elements to distribute handles for
 * @param strategy Distribution strategy
 * @param containerWidth Width of the container to distribute within
 * @param containerHeight Height of the container to distribute within
 * @returns Array of dynamic handle positions
 */
export const distributeHandles = (
    nodeId: string,
    elements: Array<{ name: string }>,
    strategy: 'distribute' | 'align' | 'auto' = 'distribute',
    containerWidth: number = 350,
    containerHeight: number = 50
): Array<{
    id: string;
    calculatedPosition: Position;
    offsetX?: number;
    offsetY?: number;
}> => {
    if (!elements || elements.length === 0) {
        return [];
    }

    // For a single element, center it
    if (elements.length === 1) {
        return [{
            id: `${nodeId}-${elements[0].name}`,
            calculatedPosition: Position.Right,
            offsetX: 0,
            offsetY: 0
        }];
    }

    // Distribute evenly along the right side
    if (strategy === 'distribute') {
        const step = containerHeight / (elements.length + 1);

        return elements.map((element, index) => {
            const y = step * (index + 1);
            return {
                id: `${nodeId}-${element.name}`,
                calculatedPosition: Position.Right,
                offsetX: 0,
                offsetY: y - (containerHeight / 2) // Center is 0
            };
        });
    }

    // Align in specific pattern (e.g., zigzag)
    if (strategy === 'align') {
        return elements.map((element, index) => {
            // Zigzag pattern
            const isEven = index % 2 === 0;
            const y = (containerHeight / (Math.ceil(elements.length / 2) + 1)) * (Math.floor(index / 2) + 1);
            const x = isEven ? 0 : 10;

            return {
                id: `${nodeId}-${element.name}`,
                calculatedPosition: Position.Right,
                offsetX: x,
                offsetY: y - (containerHeight / 2) // Center is 0
            };
        });
    }

    // Auto strategy - choose based on number of elements
    if (strategy === 'auto') {
        if (elements.length <= 3) {
            // For 2-3 elements, distribute evenly
            return distributeHandles(nodeId, elements, 'distribute', containerWidth, containerHeight);
        } else {
            // For 4+ elements, use zigzag pattern
            return distributeHandles(nodeId, elements, 'align', containerWidth, containerHeight);
        }
    }

    // Default fallback
    return elements.map((element) => ({
        id: `${nodeId}-${element.name}`,
        calculatedPosition: Position.Right
    }));
};

/**
 * React hook to calculate dynamic handle positions
 * @param nodeId Node ID
 * @param elements Array of elements to distribute handles for
 * @param options Distribution options
 * @returns Array of dynamic handle positions
 */
export const useDynamicHandlePositions = (
    nodeId: string,
    elements: Array<{ name: string }>,
    options: {
        strategy: 'distribute' | 'align' | 'auto';
        containerWidth?: number;
        containerHeight?: number;
    }
): Array<{
    id: string;
    calculatedPosition: Position;
    offsetX?: number;
    offsetY?: number;
}> => {
    if (!elements || elements.length === 0) {
        return [];
    }

    return distributeHandles(
        nodeId,
        elements,
        options.strategy,
        options.containerWidth,
        options.containerHeight
    );
};
