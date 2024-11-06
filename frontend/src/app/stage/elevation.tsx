'use client';

import { useState, useEffect, useRef } from 'react';
import { GradientData } from '@/types';

import * as d3 from 'd3';

function mapColour(
  gradient: number,
): string {
  const max = 20;
  const scaled = (gradient + max) / (2 * max);
  const normalised = Math.cbrt((scaled - 0.5)/4) + 0.5;
  return d3.interpolateTurbo(normalised);
}

function getElevation(
  data: GradientData[],
  distance: number | null
): number | null {
  if (distance === null) return null;

  const index = data.findIndex(d => d.distance > distance);
  if (index === -1) return null; // distance further than the end of the track
  if (index === 0) return data[0].elevation; // distance before start of track

  const point1 = data[index - 1];
  const point2 = data[index];

  const nGrad = point2.gradient! / 1000;

  return point1.elevation + nGrad * (point2.distance - distance);
}

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
  margin = { top: 10, right: 10, bottom: 40, left: 40 },
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

  // Map position line state and dependent values
  const elevation = getElevation(data, distance);

  // Effect to handle resizing the SVG
  useEffect(() => {
    const parent = containerRef.current;
    if (parent) {
      setWidth(parent.clientWidth);
      setHeight(parent.clientHeight);
    }

    const handleResize = () => {
      if (parent) {
        setWidth(parent.clientWidth);
        setHeight(parent.clientHeight);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  // If the container is not yet rendered, return a placeholder
  if (width === 0 || height === 0) {
    return <div ref={containerRef} className="w-full h-full" />;
  }

  // Define scales, line and area objects

  // Scale for the distance axis
  const x = d3.scaleLinear()
    .domain(d3.extent(data, d => d.distance) as [number, number])
    .range([margin.left, width - margin.right]);

  // Scale for the elevation axis
  const y = d3.scaleLinear()
    .domain(d3.extent(data, d => d.elevation) as [number, number])
    .range([height - margin.bottom, margin.top]);

  // Line for the actual elevation line plot
  const line = d3.line<GradientData>()
    .x(d => x(d.distance))
    .y(d => y(d.elevation));

  // Area for the gradient fill under the elevation line
  const area = d3.area<GradientData>()
    .x(d => x(d.distance))
    .y0(height - margin.bottom)
    .y1(d => y(d.elevation));

  // Create the gradient fill for the area under the line
  const areaGradients = data.map((d, i) => ({
    offset: `${(i / (data.length - 1)) * 100}%`,
    color: mapColour(d.gradient || 0)
  }));

  // Event handlers

  // Handle mouse move over the chart
  const handleMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {
    const svgElement = event.currentTarget;
    const rect = svgElement.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const inX = mouseX >= margin.left && mouseX <= width - margin.right;
    const inY = mouseY >= margin.top && mouseY <= height - margin.bottom;

    if (inX && inY) {
      const value = x.invert(mouseX);
      setDistance(value);
    } else {
      setDistance(null);
    }
  }

  const elevationLine = (
    <path
      fill="none"
      stroke="black"
      strokeWidth={2}
      d={line(data) || ''}
    />
  );

  const areaGradientDef = (
    <linearGradient id="areaGradient" x1="0" x2="1" y1="0" y2="0">
      {areaGradients.map((grad, i) => (
        <stop
          key={i}
          offset={grad.offset}
          stopColor={grad.color}
        />
      ))}
    </linearGradient>
  );

  const areaGradientFill = (
    <path
      fill="url(#areaGradient)"
      d={area(data) || ''}
    />
  );

  const mouseOverLine = distance !== null && (
    <g>
      <line
        x1={x(distance)}
        x2={x(distance)}
        y1={height - margin.bottom}
        y2={elevation !== null ? y(elevation) + 5 : height - margin.bottom}
        stroke="black"
        strokeWidth={2}
      />
      <circle
        cx={x(distance)}
        cy={elevation !== null ? y(elevation) : height - margin.bottom}
        r={5}
        fill="none"
        stroke="black"
        strokeWidth={2}
      />
    </g>
  );

  const xAxis = (
    <g
      transform={`translate(0,${height - margin.bottom})`}
      className="x-axis"
    >
      <line
        x1={margin.left}
        x2={width - margin.right}
        stroke="black"
      />
      {x.ticks(10).map(tick => (
        <g key={tick} transform={`translate(${x(tick)},0)`}>
          <line y2={6} stroke="black" />
          <text
            style={{
            fontSize: '10px',
              textAnchor: 'middle',
              transform: 'translateY(20px)'
            }}
          >
            {(tick / 1000).toFixed(0).toString() + 'km'}
          </text>
        </g>
      ))}
    </g>
  );

  const yAxis = (
    <g
      transform={`translate(${margin.left},0)`}
      className="y-axis"
    >
      <line
        y1={margin.top}
        y2={height - margin.bottom}
        stroke="black"
      />
      {y.ticks(5).map(tick => (
        <g key={tick} transform={`translate(0,${y(tick)})`}>
          <line
            x1={0}
            x2={width - margin.left - margin.right}
            stroke="grey"
            strokeWidth={1}
            strokeOpacity={0.5}
            strokeDasharray="2,2"
          />
          <line x2={-6} stroke="black" />
          <text
            style={{
              fontSize: '10px',
              textAnchor: 'end',
              transform: 'translateX(-8px)',
              alignmentBaseline: 'middle'
            }}
          >
            {tick.toFixed(0).toString() + 'm'}
          </text>
        </g>
      ))}
    </g>
  );

  return (
    <div ref={containerRef} className="w-full h-full">
      <svg width="100%" height="100%" onMouseMove={handleMouseMove}>
        <defs>
          {areaGradientDef}
        </defs>
        {xAxis}
        {yAxis}
        {elevationLine}
        {areaGradientFill}
        {mouseOverLine}
      </svg>
    </div>
  );
}
