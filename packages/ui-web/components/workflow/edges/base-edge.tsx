import { useCallback } from 'react';
import { EdgeProps, getBezierPath, useReactFlow } from '@xyflow/react';
import { Trash2 } from 'lucide-react';
import { ButtonDelete } from '@/components/ui/button-delete';

export default function CustomEdge({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
}: EdgeProps) {
    const { setEdges } = useReactFlow();

    const [edgePath, labelX, labelY] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

    const onEdgeDelete = useCallback(
        (event: React.MouseEvent, edgeId: string) => {
            event.stopPropagation();
            setEdges((edges) => edges.filter((edge) => edge.id !== edgeId));
        },
        [setEdges]
    );

    return (
        <>
            <path
                id={id}
                style={style}
                className="react-flow__edge-path"
                d={edgePath}
                markerEnd={markerEnd}
            />
            <foreignObject
                width={20}
                height={20}
                x={labelX - 10}
                y={labelY - 10}
                className="edge-delete-button"
                requiredExtensions="http://www.w3.org/1999/xhtml"
            >
                <ButtonDelete onDelete={(event) => onEdgeDelete(event, id)} className='flex p-0 h-full w-full items-center justify-center rounded-full bg-white border border-gray-200 cursor-pointer hover:bg-red-50 hover:border-red-200"' />
            </foreignObject>
        </>
    );
}
