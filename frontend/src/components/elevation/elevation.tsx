'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { GradientData } from '@/api/types';

import { useResize } from '@/effects/resize';

import { getInterpolatedGradientPoint } from './data';


import { handleSVGMouseMove } from './interaction';


import { AreaGradientDef } from './gradient';
import { YAxis, XAxis } from './axes';
import { GradientLegend } from './gradient';

import * as d3 from 'd3';

export default function Elevation({
  data,
  distance,
  setDistance
}: {
  data: GradientData[];
  distance: number | null;
  setDistance: (distance: number | null) => void;
}): JSX.Element {
  return (
    <div
      className="h-1/4 max-h-64 min-h-16 bg-slate-100"
      id="elevation-container"
    >
      <ElevationChart
        data={data}
        distance={distance}
        setDistance={setDistance}
      />
    </div>
  );
}

function ElevationChart({
  data,
  distance,
  setDistance,
  margin = { top: 10, right: 70, bottom: 30, left: 50 },
}: {
  data: GradientData[];
  distance: number | null;
  setDistance: (distance: number | null) => void;
  margin?: { top: number; right: number; bottom: number; left: number };
}): JSX.Element {
  // Positioning state
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Positioning derived values
  const graphTop = margin.top;
  const graphLeft = margin.left;
  const graphWidth = width - margin.left - margin.right;
  const graphHeight = height - margin.top - margin.bottom;
  const graphBottom = graphHeight + graphTop;
  const graphRight = graphLeft + graphWidth;

  // Map position line state and dependent values
  const hoverPoint = useMemo(
    () => getInterpolatedGradientPoint(data, distance),
    [data, distance]
  );

  // Hook to handle resizing the SVG
  useResize(containerRef, setWidth, setHeight);
  // If the container is not yet rendered, return a placeholder
  if (width === 0 || height === 0) {
    return <div ref={containerRef} className="w-full h-full" />;
  }

  // Define scales, line and area objects

  // Scale for the distance axis
  const x = d3.scaleLinear()
    .domain(d3.extent(data, d => d.distance) as [number, number])
    .range([graphLeft, graphRight]);

  // Scale for the elevation axis
  const y = d3.scaleLinear()
    .domain(d3.extent(data, d => d.elevation) as [number, number])
    .range([graphBottom, graphTop]);

  // Line for the actual elevation line plot
  const line = d3.line<GradientData>()
    .x(d => x(d.distance))
    .y(d => y(d.elevation));

  // Area for the gradient fill under the elevation line
  const area = d3.area<GradientData>()
    .x(d => x(d.distance))
    .y0(graphBottom)
    .y1(d => y(d.elevation));

  // Event handlers

  // Handle mouse move over the chart
  const onMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {
    handleSVGMouseMove(event, (mouseX, mouseY) => {
      const inX = (mouseX >= graphLeft) && (mouseX <= graphRight);
      const inY = (mouseY >= graphTop) && (mouseY <= graphBottom);

      if (inX && inY) {
        const distance = x.invert(mouseX);
        setDistance(distance);
      } else {
        setDistance(null);
      }
    });
  }

  // Elements for the chart that we need to render
  const elevationLine = (
    <path
      fill="none"
      stroke="black"
      strokeWidth={2}
      d={line(data) || ''}
    />
  );

  const areaGradientFill = (
    <path
      fill="url(#areaGradient)"
      d={area(data) || ''}
    />
  );

  return (
    <div ref={containerRef} className="w-full h-full">
      <svg
        width="100%"
        height="100%"
        onMouseMove={onMouseMove}
        onMouseLeave={() => setDistance(null)}
      >
        <defs>
          <AreaGradientDef data={data} />
        </defs>
        <YAxis
          margin={margin}
          width={width}
          height={height}
          y={y}
          nTicks={5}
          labelFn={tick => tick.toFixed(0).toString() + 'm'}
        />
        {elevationLine}
        {areaGradientFill}
        <MouseOverLine
          hoverPoint={hoverPoint}
          margin={margin}
          dims={{ width, height }}
          x={x}
          y={y}
        />
        <XAxis
          margin={margin}
          width={width}
          height={height}
          x={x}
          nTicks={10}
          labelFn={tick => {
            const km = (tick / 1000).toFixed(2);
            const kmNum = km.endsWith('.00') ? km.slice(0, -3) : km;
            return kmNum + 'km';
          }}
        />
        <GradientLegend
          gradientData={data}
          margin={margin}
          dims={{ width, height }}
        />
      </svg>
    </div>
  );
}

function SVGTextBox(
  { xpos, ypos, text, textProps }: {
    xpos: number;
    ypos: number;
    text: string;
    textProps?: React.SVGProps<SVGTextElement>;
  }
): JSX.Element {
  return (
    <text
      x={xpos}
      y={ypos}
      {...textProps}
    >
      {text}
    </text>
  );
}

function getTextWidth(text: string, fontSize: number): number {
  // Create temporary SVG element
  const svg = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'svg'
  );
  const textElement = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'text'
  );

  // Set the text and styling
  textElement.textContent = text;
  textElement.style.fontSize = `${fontSize}px`;

  // Add to DOM temporarily to measure
  svg.appendChild(textElement);
  document.body.appendChild(svg);

  // Get the width
  const width = textElement.getComputedTextLength();

  // Clean up
  document.body.removeChild(svg);

  return width;
}

function MouseOverLineText(
  { xpos, ypos, gradientPoint, dims, margin, fontSize = 10, textProps }: {
    xpos: number;
    ypos: number;
    gradientPoint: GradientData;
    dims: { width: number; height: number };
    margin: { top: number; right: number; bottom: number; left: number };
    fontSize?: number;
    textProps?: React.SVGProps<SVGTextElement>;
  }
): JSX.Element {
  // Set the padding values
  const boxPadding = 4;
  const needlePadding = 5;

  // Create the text content to measure
  const texts = [
    `${(gradientPoint.distance / 1000).toFixed(0).toString()}km`,
    `${gradientPoint.elevation.toFixed(0).toString()}m`,
    `${gradientPoint.gradient?.toFixed(0).toString() ?? '0'}%`
  ];

  const maxTextsLength = Math.max(...texts.map(text => text.length));

  // Calculate the maximum text width
  const [boxWidth, setBoxWidth] = useState(0);
  useEffect(() => {
    // Calculate the maximum text width
    const maxWidth = Math.max(
      ...texts.map(text => getTextWidth(text, fontSize))
    );
    setBoxWidth(maxWidth + (boxPadding * 2));
  }, [maxTextsLength, fontSize, boxPadding]);

  // Calculate the box dimensions
  const boxHeight = (fontSize * texts.length) + (boxPadding * 2);
  const boxTop = ypos - boxHeight / 2;
  const boxLeft = xpos + needlePadding;
  const boxRight = boxLeft + boxWidth;
  const boxBottom = boxTop + boxHeight;

  // Check if the box overflows any edges of the chart
  const overflowsRight = boxRight > dims.width - margin.right;
  const overflowsBottom = boxBottom > dims.height - margin.bottom;
  const overflowsTop = boxTop < margin.top;

  // Calculate the transform values to align the box in the correct position
  // Do not allow the box to overflow the edges of the chart
  const xTransform = overflowsRight
    ? boxLeft - boxWidth - (2 * needlePadding)
    : boxLeft;
  let yTransform = boxTop;
  if (overflowsBottom) {
    yTransform = dims.height - margin.bottom - boxHeight;
  } else if (overflowsTop) {
    yTransform = margin.top;
  }

  return (
    <g transform={`translate(${xTransform},${yTransform})`}>
      <rect
        x={0}
        y={0}
        width={boxWidth}
        height={boxHeight}
        fill="white"
        stroke="black"
        strokeWidth={1}
        opacity={0.8}
        rx={fontSize / 2}
      />
      {texts.map((text, i) => (
        <SVGTextBox
          key={i}
          xpos={boxPadding}
          ypos={boxPadding / 2 + ((i + 1) * fontSize)}
          text={text}
          textProps={textProps}
        />
      ))}
    </g>
  );
}

function MouseOverLine(
  {
    hoverPoint,
    margin,
    dims,
    x,
    y,
    lineProps,
    circleProps,
    textProps
  }: {
    hoverPoint: GradientData | null;
    margin: { top: number; right: number; bottom: number; left: number };
    dims: { width: number; height: number };
    x: d3.ScaleLinear<number, number>;
    y: d3.ScaleLinear<number, number>;
    lineProps?: React.SVGProps<SVGLineElement>;
    circleProps?: React.SVGProps<SVGCircleElement>;
    textProps?: React.SVGProps<SVGTextElement>;
  }
): JSX.Element {
  if (hoverPoint === null) return <></>;

  const distancePos = x(hoverPoint.distance);
  const elevationPos = y(hoverPoint.elevation);

  const circleRadius = 2.5;
  const circleFill = 'none';
  const strokeWidth = 2;
  const strokeColor = 'black';

  const textStyle = {
    fontSize: '10px',
    textAnchor: 'left',
  };

  const allTextProps = {
    ...textStyle,
    ...textProps
  };

  return (
    <g>
      <line
        x1={distancePos}
        x2={distancePos}
        y1={dims.height - margin.bottom}
        y2={elevationPos + circleRadius}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        {...lineProps}
      />
      <circle
        cx={distancePos}
        cy={elevationPos}
        r={circleRadius}
        fill={circleFill}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        {...circleProps}
      />
      <MouseOverLineText
        xpos={distancePos}
        ypos={elevationPos}
        dims={dims}
        margin={margin}
        gradientPoint={hoverPoint}
        textProps={allTextProps}
      />
    </g>
  );
}
