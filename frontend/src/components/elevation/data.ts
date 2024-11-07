import { GradientData } from '@/api/types';
import { interpolateObject } from '@/utils/math';

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
