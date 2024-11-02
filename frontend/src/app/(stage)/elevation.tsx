'use client';

import { useState, useEffect, useRef } from 'react';
import { ElevationData } from '@/types';

import * as d3 from 'd3';

export default function Elevation({
  data,
}: {
  data: ElevationData[];
}): JSX.Element {
  return (
    <div className="h-1/4 max-h-64 bg-slate-100" id="elevation-container">
      <ElevationChart data={data} />
    </div>
  );
}

function ElevationChart({
  data,
  margin = { top: 10, right: 10, bottom: 40, left: 40 },
}: {
  data: ElevationData[];
  margin?: { top: number; right: number; bottom: number; left: number };
}): JSX.Element {
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

  const area = d3.area<ElevationData>()
    .x(d => x(d.distance))
    .y0(height - margin.bottom)
    .y1(d => y(d.elevation));

  return (
    <div ref={containerRef} className="w-full h-full">
      <svg width="100%" height="100%">
        <path
          fill="red"
          stroke="black"
          strokeWidth={2}
          d={area(data) || ''}
        />
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
      </svg>
    </div>
  );
}
