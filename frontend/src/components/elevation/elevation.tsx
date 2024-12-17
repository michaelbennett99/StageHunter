'use client';

// Client Libraries
import * as d3 from 'd3';
import React, { useEffect, useState, useRef, useMemo } from 'react';

// Graph Data and Functions
import { GradientData } from '@/api/types';
import { useResize } from '@/hooks/resize';
import useBreakpoint from '@/hooks/useBreakpoint';
import { getInterpolatedGradientPoint } from './data';
import { handleSVGMouseMove } from './interaction';
// JSX Graph Components
import {
  AreaGradientDef,
  AreaGradientFill,
  ElevationLine
} from './graph';
import { GradientLegend } from './legend';
import { YAxis, XAxis } from './axes';
import { MouseOverLine } from './mouseOver';
import { twJoin } from 'tailwind-merge';

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
      className="h-1/4 max-h-64 min-h-16 rounded-md shadow-md border"
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
  margin = {
    top: 10,
    right: { default: 70, sm: 10 },
    bottom: 30,
    left: 50
  },
}: {
  data: GradientData[];
  distance: number | null;
  setDistance: (distance: number | null) => void;
  margin?: {
    top: number;
    right: { sm: number; default: number };
    bottom: number;
    left: number;
  };
}): JSX.Element {
  // Positioning state
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const smallScreen = useBreakpoint('sm');
  const effectiveMargin = {
    ...margin,
    right: smallScreen ? margin.right.sm : margin.right.default,
  };

  // Positioning derived values
  const graphTop = effectiveMargin.top;
  const graphLeft = effectiveMargin.left;
  const graphRight = width - effectiveMargin.right;
  const graphHeight = height - effectiveMargin.top - effectiveMargin.bottom;
  const graphBottom = graphHeight + graphTop;

  // Map position line state and dependent values
  const hoverPoint = useMemo(
    () => getInterpolatedGradientPoint(data, distance),
    [data, distance]
  );

  // Hook to handle resizing the SVG when the window size changes
  useEffect(() => {
    const handleResize = () => {
      // force re-render when window size changes
      setWidth(prev => prev);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

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

  function handlePointerMove(mouseX: number, mouseY: number) {
    const inX = (mouseX >= graphLeft) && (mouseX <= graphRight);
    const inY = (mouseY >= graphTop) && (mouseY <= graphBottom);

    if (inX && inY) {
      const distance = x.invert(mouseX);
      setDistance(distance);
    } else {
      setDistance(null);
    }
  }

  // Handle mouse move over the chart
  function onMouseMove(event: React.MouseEvent<SVGSVGElement>) {
    handleSVGMouseMove(event, handlePointerMove);
  }

  // Handle touch move over the chart
  function onTouchMove(event: React.TouchEvent<SVGSVGElement>) {
    event.preventDefault();
    const touch = event.touches[0];
    if (touch) {
      const svgElement = event.currentTarget
      const rect = svgElement.getBoundingClientRect();
      const mouseX = touch.clientX - rect.left;
      const mouseY = touch.clientY - rect.top;
      handlePointerMove(mouseX, mouseY);
    }
  }

  const areaGradientId = 'areaGradient';

  return (
    <div ref={containerRef} className="w-full h-full">
      <svg
        width="100%"
        height="100%"
        onMouseMove={onMouseMove}
        onMouseLeave={() => setDistance(null)}
        onTouchMove={onTouchMove}
        onTouchEnd={() => setDistance(null)}
      >
        <defs>
          <AreaGradientDef data={data} id={areaGradientId} />
        </defs>
        <YAxis
          margin={effectiveMargin}
          width={width}
          height={height}
          y={y}
          nTicks={5}
          labelFn={tick => tick.toFixed(0).toString() + 'm'}
        />
        <ElevationLine d={line(data) || ''} />
        <AreaGradientFill d={area(data) || ''} id={areaGradientId} />
        <MouseOverLine
          hoverPoint={hoverPoint}
          margin={effectiveMargin}
          dims={{ width, height }}
          x={x}
          y={y}
        />
        <XAxis
          margin={effectiveMargin}
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
          margin={effectiveMargin}
          dims={{ width, height }}
        />
      </svg>
    </div>
  );
}
