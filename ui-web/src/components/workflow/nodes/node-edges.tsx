'use client';

import React, { useState } from 'react';
import HandleRenderComponent from './handle-render-component';

interface NodeEdgesProps {
    processedInputs: any[];
    processedOutputs: any[];
    id: string;
    data: any;
    connectionState: any;
};

export const NodeEdges: React.FC<NodeEdgesProps> = ({ processedInputs, processedOutputs, id, data, connectionState }) => {
    return (
        <>
            {processedInputs.length > 0 && (
                <div className="mt-2 pt-2 border-t">
                    <div className="text-xs font-medium text-gray-500 mb-1">Inputs</div>
                    {processedInputs.map((input, index) => (
                        <div key={input.name} className="flex items-center justify-between py-1">
                            <div className="flex items-center">
                                <HandleRenderComponent
                                    left={true}
                                    tooltipTitle={input.type}
                                    id={{
                                        input_types: [input.type],
                                        id: id,
                                        fieldName: input.name
                                    }}
                                    title={input.label}
                                    nodeId={id}
                                    colorName={['primary']}
                                    connectionState={connectionState}
                                    position={input.position}
                                />
                                <span className="text-xs ml-4">{input.label}</span>
                                {input.required && <span className="text-red-500 ml-1">*</span>}
                            </div>
                            <span className="text-xs text-gray-400">{input.type}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Output handles */}
            {processedOutputs.length > 0 && (
                <div className="mt-2 pt-2 border-t relative">
                    <div className="text-xs font-medium text-gray-500 mb-1">Outputs</div>
                    {processedOutputs.map((output, index) => {
                        // Find dynamic position for this output if available
                        const dynamicPosition = data.dynamicHandlePositions?.find(
                            pos => pos.id === `${id}-${output.name}`
                        );

                        return (
                            <div key={output.name} className="flex items-center justify-between py-1 relative">
                                <span className="text-xs">{output.label}</span>
                                <div className="flex items-center">
                                    <span className="text-xs text-gray-400 mr-4">{output.type}</span>
                                    <HandleRenderComponent
                                        left={false}
                                        tooltipTitle={output.type}
                                        id={{
                                            output_types: [output.type],
                                            id: id,
                                            fieldName: output.name
                                        }}
                                        title={output.label}
                                        nodeId={id}
                                        colorName={['secondary']}
                                        connectionState={connectionState}
                                        position={dynamicPosition ? {
                                            position: dynamicPosition.calculatedPosition,
                                            offsetX: dynamicPosition.offsetX,
                                            offsetY: dynamicPosition.offsetY
                                        } : output.position}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </>
    );
};
