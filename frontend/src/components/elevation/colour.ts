import { sigmoid } from '@/utils/math';
import { mapColour } from '@/utils/colours';

import * as d3 from 'd3';

// Define the gradient colour mapping
const colourInterpolator = d3.scaleDiverging(
  d3.interpolateSpectral
).interpolator();

const flipColours = true;
const sigmoidSlope = 0.18;

function gradientTransformation(gradient: number): number {
  return sigmoid((flipColours ? -1 : 1) * gradient, sigmoidSlope);
}

export function mapGradientColour(gradient: number): string {
  return mapColour(
    gradient,
    colourInterpolator,
    gradientTransformation
  );
}
