import * as d3 from 'd3';

import { useTheme } from 'next-themes'

export function XAxis(
  { margin, width, height, x, nTicks, labelFn }: {
    margin: { top: number; right: number; bottom: number; left: number };
    width: number;
    height: number;
    x: d3.ScaleLinear<number, number>;
    nTicks: number;
    labelFn: (tick: number) => string;
  }
): JSX.Element {
  const { resolvedTheme } = useTheme();

  return (
    <g
      transform={`translate(0,${height - margin.bottom})`}
      className="x-axis"
    >
      <line
        x1={margin.left}
        x2={width - margin.right}
        stroke="black"
      />
      {x.ticks(nTicks).map(tick => (
        <g key={tick} transform={`translate(${x(tick)},0)`}>
          <line y2={6} stroke={resolvedTheme === 'dark' ? 'white' : 'black'} />
          <TickLabel
            tick={tick}
            labelFn={labelFn}
            style={{
              fontSize: '10px',
              textAnchor: 'middle',
              transform: 'translateY(20px)'
            }}
          />
        </g>
      ))}
    </g>
  );
}

export function YAxis(
  { margin, width, height, y, nTicks, labelFn }: {
    margin: { top: number; right: number; bottom: number; left: number };
    width: number;
    height: number;
    y: d3.ScaleLinear<number, number>;
    nTicks: number;
    labelFn: (tick: number) => string;
  }
): JSX.Element {
  const { resolvedTheme } = useTheme();
  return (
    <g
      transform={`translate(${margin.left},0)`}
      className="y-axis"
    >
      <line
        y1={margin.top}
        y2={height - margin.bottom}
        stroke={resolvedTheme === 'dark' ? 'white' : 'black'}
      />
      {y.ticks(nTicks).map(tick => (
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
          <TickLabel
            tick={tick}
            labelFn={labelFn}
            style={{
              fontSize: '10px',
              textAnchor: 'end',
              transform: 'translateX(-8px)',
              alignmentBaseline: 'middle'
            }}
          />
        </g>
      ))}
    </g>
  );
}

export function TickLabel(
  { tick, labelFn, style }: {
    tick: number;
    labelFn: (tick: number) => string;
    style?: React.CSSProperties;
  }
): JSX.Element {
  return <text style={style}>{labelFn(tick)}</text>;
}
