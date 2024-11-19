import { interpolateObject } from './math';

const data = [
    0, 3, 7, 10, 15, 20, 21, 27, 40, 50, 55, 57, 60, 61, 68, 73, 78, 79, 80
];

const interpolator = (low: number, high: number, value: number) => {
    return low + high + value;
}

const interpolatePoint = (value: number | null) => {
    return interpolateObject(
        data,
        (d) => d,
        value,
        interpolator
    );
}

test('interpolates correctly', () => {
    const point = interpolatePoint(12);

    expect(point).toBe(10 + 15 + 12);
});

test('returns null if value is null', () => {
    const point = interpolatePoint(null);

    expect(point).toBeNull();
});

test('returns exact value if it is in the data', () => {
    const point = interpolatePoint(10);

    expect(point).toBe(10);
});
