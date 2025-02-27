import { Position } from '@xyflow/react';
import { PathCalculationProps } from '../types';

/**
 * Calculate path for the edge (similar to smoothstep algorithm)
 * Returns the path string and the center coordinates for edge controls
 */
export const getSmoothStepPath = ({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
}: PathCalculationProps): [string, number, number] => {
    const offset = 50;
    let centerX, centerY;

    const sourceOffsetX = sourcePosition === Position.Left ? -offset : sourcePosition === Position.Right ? offset : 0;
    const sourceOffsetY = sourcePosition === Position.Top ? -offset : sourcePosition === Position.Bottom ? offset : 0;
    const targetOffsetX = targetPosition === Position.Left ? -offset : targetPosition === Position.Right ? offset : 0;
    const targetOffsetY = targetPosition === Position.Top ? -offset : targetPosition === Position.Bottom ? offset : 0;

    const sourceControlX = sourceX + sourceOffsetX;
    const sourceControlY = sourceY + sourceOffsetY;
    const targetControlX = targetX + targetOffsetX;
    const targetControlY = targetY + targetOffsetY;

    // Calculate center point for the delete button
    centerX = (sourceX + targetX) / 2;
    centerY = (sourceY + targetY) / 2;

    // Create a bezier curve path
    const path = `M${sourceX},${sourceY} C${sourceControlX},${sourceControlY} ${targetControlX},${targetControlY} ${targetX},${targetY}`;

    return [path, centerX, centerY];
};
