export function sigmoid(x: number, a: number): number {
  return 1 / (1 + Math.exp(-a * x));
}

// Expects data to be pre-sorted by accessor
function findBoundsIndex<T>(
    data: T[], accessor: (object: T) => number, value: number
): [number, number] | null {
    let low = 0;
    let high = data.length - 1;

    // Handle edge cases
    if (value < accessor(data[0])) return null;
    if (value > accessor(data[high])) return null;

    while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        const midValue = accessor(data[mid]);

        if (midValue === value) {
            return [mid, mid];
        } else if (midValue < value) {
            if (accessor(data[mid + 1]) > value) {
                return [mid, mid + 1];
            }
            low = mid + 1;
        } else {
            if (accessor(data[mid - 1]) < value) {
                return [mid - 1, mid];
            }
            high = mid - 1;
        }
    }

    return [high, low];
}

// Expects data to be pre-sorted by accessor
export function interpolateObject<T>(
    data: T[],
    accessor: (object: T) => number,
    value: number | null,
    interpolator: (low: T, high: T, value: number) => T
): T | null {
    if (value === null) return null;

    // Get the closest data points
    const bounds = findBoundsIndex(data, accessor, value);
    if (bounds === null) return null;
    const [low, high] = bounds;

    // Skip interpolation if the value is exactly at a data point
    if (low === high) return data[low];

    // Interpolate between the two closest data points
    return interpolator(data[low], data[high], value);
}
