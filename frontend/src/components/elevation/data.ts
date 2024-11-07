import { GradientData } from '@/api/types';
import { interpolateObject } from '@/utils/math';

import { mapGradientColour } from './colour';

type ColourMap = { startOffset: number, endOffset: number, color: string };

export function getInterpolatedGradientPoint(
  data: GradientData[],
  distance: number | null
): GradientData | null {
  const interpolator = (
    point1: GradientData,
    point2: GradientData,
    distance: number
  ): GradientData => {
    const nGrad = point2.gradient! / 1000;

    const elevation =  point1.elevation + nGrad * (point2.distance - distance);
    return {
      distance: distance,
      elevation: elevation,
      gradient: point2.gradient
    };
  }

  return interpolateObject(data, d => d.distance, distance, interpolator);
}

export function makeColourMap(data: GradientData[]): ColourMap[] {
  const totalDistance = data[data.length - 1].distance;
  return data
    .slice(1)
    .map((d, i) => {
      const startOffset = data[i].distance / totalDistance;
      const endOffset = d.distance / totalDistance;
      const color = mapGradientColour(d.gradient || 0);
      return { startOffset, endOffset, color };
    });
}
