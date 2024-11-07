import * as d3 from 'd3';

import { GradientData } from '@/api/types';

import { mapGradientColour } from './colour';
import { TickLabel } from './axes';
export function GradientLegend(
  {
    gradientData,
    margin,
    dims,
    nTicks = 5,
    width = 20,
  }: {
    gradientData: GradientData[];
    margin: { left: number; top: number; right: number; bottom: number };
    dims: { width: number; height: number };
    nTicks?: number;
    width?: number;
    height?: number;
  }
): JSX.Element {
  // Dimensions
  const padding = 10;
  const legendLeft = dims.width - margin.right + padding;
  const legendTop = margin.top;
  const legendHeight = dims.height - margin.top - margin.bottom;

  const maxAbsGradient = Math.max(
    ...gradientData.map(d => Math.abs(d.gradient || 0))
  );

  const g = d3.scaleLinear()
    .domain([-maxAbsGradient, maxAbsGradient])
    .range([legendHeight, 0]);

  const colourDomain = d3.range(
    -maxAbsGradient,
    maxAbsGradient,
    2 * maxAbsGradient / 100
  );
  const colourRange = colourDomain.map(mapGradientColour);

  const legendGradientDef = (
    <linearGradient id="legendGradient" x1="0" x2="0" y1="1" y2="0">
      {colourRange.map((colour, i) => (
        <stop key={i} offset={`${i / colourRange.length}`} stopColor={colour} />
      ))}
    </linearGradient>
  );
  return (
    <g transform={`translate(${legendLeft},${legendTop})`}>
      <defs>
        {legendGradientDef}
      </defs>
      <rect
        x={0}
        y={0}
        width={width}
        height={legendHeight}
        stroke="black"
        strokeWidth={1}
        fill="url(#legendGradient)"
      />
      {g.ticks(nTicks).map(tick => (
        <g
          key={tick}
          transform={`translate(${width},${g(tick)})`}
        >
          <line x2={6} stroke="black" />
          <TickLabel
            tick={tick}
            labelFn={tick => tick.toFixed(0).toString() + '%'}
            style={{
              fontSize: '10px',
              textAnchor: 'start',
              alignmentBaseline: 'middle',
              transform: 'translateX(8px)'
            }}
          />
        </g>
      ))}
    </g>
  );
}
