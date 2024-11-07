import React from 'react';

import { GradientData } from '@/api/types';

import { makeColourMap } from './data';

export function ElevationLine({ d }: { d: string }): JSX.Element {
  return (
    <path fill="none" stroke="black" strokeWidth={2} d={d} />
  );
}

export function AreaGradientDef(
  { data, id }: { data: GradientData[], id: string }
): JSX.Element {
  const areaGradients = makeColourMap(data);
  return (
    <linearGradient id={id} x1="0" x2="1" y1="0" y2="0">
      {areaGradients.map((grad, i) => (
        <React.Fragment key={i}>
          <stop
            offset={grad.startOffset}
            stopColor={grad.color}
          />
          <stop
            key={`end-${i}`}
            offset={grad.endOffset}
            stopColor={grad.color}
          />
        </React.Fragment>
      ))}
    </linearGradient>
  );
}

export function AreaGradientFill(
  { d, id }: { d: string, id: string }
): JSX.Element {
  return (
    <path fill={`url(#${id})`} d={d} />
  );
}
