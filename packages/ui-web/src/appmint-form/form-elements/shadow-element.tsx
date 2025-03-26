import React, { useState, useEffect } from 'react';
import { StyledComponent } from './styling';
import { extractStylingFromSchema, getComponentPartStyling } from './styling/style-utils';
import { twMerge } from 'tailwind-merge';

export const ShadowElement = ({ change, blur, value, schema, theme }) => {
  const [shadowType, setShadowType] = useState('box-shadow');
  const [shadowColor, setShadowColor] = useState('#000000');
  const [shadowOpacity, setShadowOpacity] = useState(0.5);
  const [shadowBlur, setShadowBlur] = useState(10);
  const [shadowSpread, setShadowSpread] = useState(0);
  const [shadowX, setShadowX] = useState(10);
  const [shadowY, setShadowY] = useState(10);
  const [isInset, setIsInset] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [cssCode, setCssCode] = useState('');

  // Extract styling from schema
  const customStyling = schema ? extractStylingFromSchema(schema) : undefined;

  useEffect(() => {
    // setCssCode(value)
  }, []);

  useEffect(() => {
    const color = shadowColor + Math.round(shadowOpacity * 255).toString(16).padStart(2, '0');
    let shadowValue = '';

    if (shadowType === 'box-shadow') {
      shadowValue = `${shadowX}px ${shadowY}px ${shadowBlur}px ${shadowSpread}px ${color}${isInset ? ' inset' : ''}`;
    } else {
      shadowValue = `${shadowX}px ${shadowY}px ${shadowBlur}px ${color}`;
    }

    setCssCode(`${shadowType}: ${shadowValue};`);
    if(blur){
      blur(shadowValue);
    }
    
  }, [shadowType, shadowColor, shadowOpacity, shadowBlur, shadowSpread, shadowX, shadowY, isInset]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    const canvasRect = e.currentTarget.getBoundingClientRect();
    const centerX = canvasRect.width / 2;
    const centerY = canvasRect.height / 2;

    const mouseX = e.clientX - canvasRect.left;
    const mouseY = e.clientY - canvasRect.top;

    setShadowX(Math.round(mouseX - centerX));
    setShadowY(Math.round(mouseY - centerY));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const getRgbaColor = () => {
    const r = parseInt(shadowColor.slice(1, 3), 16);
    const g = parseInt(shadowColor.slice(3, 5), 16);
    const b = parseInt(shadowColor.slice(5, 7), 16);

    return `rgba(${r}, ${g}, ${b}, ${shadowOpacity})`;
  };

  return (
    <StyledComponent
      componentType="shadow"
      part="container"
      schema={schema}
      theme={theme}
      className="flex flex-col w-full max-w-xl p-2 gap-2 border border-gray-200 rounded-lg bg-white text-sm"
    >
      <StyledComponent
        componentType="shadow"
        part="header"
        schema={schema}
        theme={theme}
        className="flex justify-between items-center"
      >
        <div className="flex gap-2">
          <StyledComponent
            componentType="shadow"
            part="button"
            schema={schema}
            theme={theme}
            as="button"
            className={`px-2 py-0.5 text-xs rounded ${shadowType === 'box-shadow' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setShadowType('box-shadow')}
            aria-pressed={shadowType === 'box-shadow'}
          >
            Box
          </StyledComponent>
          <StyledComponent
            componentType="shadow"
            part="button"
            schema={schema}
            theme={theme}
            as="button"
            className={`px-2 py-0.5 text-xs rounded ${shadowType === 'text-shadow' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setShadowType('text-shadow')}
            aria-pressed={shadowType === 'text-shadow'}
          >
            Text
          </StyledComponent>
        </div>
        <div className="text-xs">
          <StyledComponent
            componentType="shadow"
            part="button"
            schema={schema}
            theme={theme}
            as="button"
            className="px-2 py-0.5 bg-blue-500 text-white rounded"
            onClick={() => navigator.clipboard && navigator.clipboard.writeText(cssCode)}
            aria-label="Copy CSS code to clipboard"
          >
            Copy CSS
          </StyledComponent>
        </div>
      </StyledComponent>

      <StyledComponent
        componentType="shadow"
        part="content"
        schema={schema}
        theme={theme}
        className="flex gap-2"
      >
        {/* Canvas for shadow positioning */}
        <StyledComponent
          componentType="shadow"
          part="canvas"
          schema={schema}
          theme={theme}
          className="relative w-32 h-32 bg-gray-100 border border-gray-300 rounded cursor-move flex-shrink-0"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {shadowType === 'box-shadow' ? (
            <div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded border border-gray-300"
              style={{
                boxShadow: `${shadowX}px ${shadowY}px ${shadowBlur}px ${shadowSpread}px ${getRgbaColor()}${isInset ? ' inset' : ''}`
              }}
            />
          ) : (
            <div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl font-bold"
              style={{
                textShadow: `${shadowX}px ${shadowY}px ${shadowBlur}px ${getRgbaColor()}`
              }}
            >
              T
            </div>
          )}

          <div className="absolute top-1/2 left-1/2 w-px h-px">
            <div className="absolute w-1.5 h-1.5 bg-red-500 rounded-full transform -translate-x-0.5 -translate-y-0.5" />
            <div
              className="absolute w-1.5 h-1.5 bg-blue-500 rounded-full transform -translate-x-0.5 -translate-y-0.5"
              style={{ left: shadowX, top: shadowY }}
            />
          </div>
        </StyledComponent>

        {/* Controls */}
        <StyledComponent
          componentType="shadow"
          part="controls"
          schema={schema}
          theme={theme}
          className="flex-1 flex flex-col gap-1.5 text-xs"
        >
          <div className="flex gap-1 items-center">
            <input
              id="shadow-color"
              type="color"
              value={shadowColor}
              onChange={(e) => setShadowColor(e.target.value)}
              className="w-6 h-6 border border-gray-300 rounded"
              aria-label="Shadow color"
            />
            <input
              type="text"
              value={shadowColor}
              onChange={(e) => setShadowColor(e.target.value)}
              className="w-16 px-1 py-0.5 border border-gray-300 rounded text-xs"
              aria-label="Shadow color hex value"
            />
            {shadowType === 'box-shadow' && (
              <div className="flex items-center ml-2">
                <input
                  type="checkbox"
                  id="inset"
                  checked={isInset}
                  onChange={(e) => setIsInset(e.target.checked)}
                  className="mr-1"
                  aria-label="Inset shadow"
                />
                <label htmlFor="inset" className="text-xs">Inset</label>
              </div>
            )}
          </div>
          <div className="flex gap-1 items-center">
            <label htmlFor="shadow-opacity" className="text-xs  w-12 truncate">Opacity:</label>
            <input
              id="shadow-opacity"
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={shadowOpacity}
              onChange={(e) => setShadowOpacity(parseFloat(e.target.value))}
              className="w-20"
              aria-label="Shadow opacity"
            />
            <span className="w-8 text-[9px] text-right">{Math.round(shadowOpacity * 100)}%</span>
          </div>

          <div className="flex gap-1 items-center">
            <label htmlFor="shadow-blur" className="text-xs  w-12 truncate">Blur:</label>
            <input
              id="shadow-blur"
              type="range"
              min="0"
              max="100"
              value={shadowBlur}
              onChange={(e) => setShadowBlur(parseInt(e.target.value))}
              className="w-20"
              aria-label="Shadow blur"
            />
            <span className="w-8 text-[9px] text-right">{shadowBlur}px</span>
          </div>

          {shadowType === 'box-shadow' && (
            <div className="flex gap-1 items-center">
              <label htmlFor="shadow-spread" className="text-xs w-12 truncate">Spread:</label>
              <input
                id="shadow-spread"
                type="range"
                min="-25"
                max="100"
                value={shadowSpread}
                onChange={(e) => setShadowSpread(parseInt(e.target.value))}
                className="w-20"
                aria-label="Shadow spread"
              />
              <span className="w-8 text-[9px] text-right">{shadowSpread}px</span>
            </div>
          )}

          <div className="">
            <label className="text-xs">Offset:</label>
            <div className="flex gap-1 items-center">
              <span className="text-xs">X:</span>
              <input
                id="shadow-x"
                type="number"
                value={shadowX}
                onChange={(e) => setShadowX(parseInt(e.target.value) || 0)}
                className="w-14 px-1 py-0.5 border border-gray-300 rounded text-xs mr-2"
                aria-label="Shadow X offset"
              />
              <span className="text-xs">Y:</span>
              <input
                id="shadow-y"
                type="number"
                value={shadowY}
                onChange={(e) => setShadowY(parseInt(e.target.value) || 0)}
                className="w-14 px-1 py-0.5 border border-gray-300 rounded text-xs mr-2"
                aria-label="Shadow Y offset"
              />
            </div>
          </div>
        </StyledComponent>
      </StyledComponent>
      <StyledComponent
        componentType="shadow"
        part="code"
        schema={schema}
        theme={theme}
        className="mt-1 text-xs"
      >
        <pre className="p-1 bg-gray-100 rounded font-mono overflow-x-auto border border-gray-200">
          {cssCode}
        </pre>
      </StyledComponent>
    </StyledComponent>
  );
};
