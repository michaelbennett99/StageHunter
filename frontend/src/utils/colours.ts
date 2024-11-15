export function mapColour(
  input: number,
  interpolator: (input: number) => string,
  transformation: (input: number) => number
): string {
  return interpolator(transformation(input));
}
