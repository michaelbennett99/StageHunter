/**
 * This module defines the mapping from gradient to colour for the elevation
 * graph
 */

import { sigmoid } from '@/utils/math';
import { mapColour } from '@/utils/colours';

import * as d3 from 'd3';

const colourInterpolator = d3.scaleDiverging(
  d3.interpolateSpectral
).interpolator();

const flipColours = true;
const sigmoidSlope = 0.18;

function gradientTransformation(gradient: number): number {
  return sigmoid((flipColours ? -1 : 1) * gradient, sigmoidSlope);
}

/**
 * Map a gradient value to a colour
 * @param gradient - The gradient value to map
 * @returns The colour as a string
 */
export function mapGradientColour(gradient: number): string {
  return mapColour(
    gradient,
    colourInterpolator,
    gradientTransformation
  );
}
