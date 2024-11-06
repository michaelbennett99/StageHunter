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

  if (width === 0 || height === 0) {
    return <div ref={containerRef} className="w-full h-full" />;
  }

  const x = d3.scaleLinear()
    .domain(d3.extent(data, d => d.distance) as [number, number])
    .range([margin.left, width - margin.right]);

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

  return (
    <div ref={containerRef} className="w-full h-full">
      <svg width="100%" height="100%">
        <defs>
          {/* Create the gradient fill for the area under the line */}
          <linearGradient id="areaGradient" x1="0" x2="1" y1="0" y2="0">
            {areaGradients.map((grad, i) => (
              <stop
                key={i}
                offset={grad.offset}
                stopColor={grad.color}
              />
            ))}
          </linearGradient>
        </defs>

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

        {/* Black elevation line */}
        <path
          fill="none"
          stroke="black"
          strokeWidth={2}
          d={line(data) || ''}
        />
        {/* Gradient fill under the line */}
        <path
          fill="url(#areaGradient)"
          d={area(data) || ''}
        />
      </svg>
    </div>
  );
}
