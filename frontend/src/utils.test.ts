import { numToRank, deSnakeCase } from './utils';

describe('numToRank', () => {
  test('returns correct ordinal for 1st', () => {
    expect(numToRank(1)).toBe('1st');
  });

  test('returns correct ordinal for 2nd', () => {
    expect(numToRank(2)).toBe('2nd');
  });

  test('returns correct ordinal for 3rd', () => {
    expect(numToRank(3)).toBe('3rd');
  });

  test('returns correct ordinal for 4th', () => {
    expect(numToRank(4)).toBe('4th');
  });

  test('returns correct ordinal for 11th', () => {
    expect(numToRank(11)).toBe('11th');
  });

  test('returns correct ordinal for 12th', () => {
    expect(numToRank(12)).toBe('12th');
  });

  test('returns correct ordinal for 13th', () => {
    expect(numToRank(13)).toBe('13th');
  });

  test('returns correct ordinal for 21st', () => {
    expect(numToRank(21)).toBe('21st');
  });

  test('returns correct ordinal for 22nd', () => {
    expect(numToRank(22)).toBe('22nd');
  });

  test('returns correct ordinal for 23rd', () => {
    expect(numToRank(23)).toBe('23rd');
  });

  test('returns correct ordinal for 100th', () => {
    expect(numToRank(100)).toBe('100th');
  });

  test('returns correct ordinal for 101st', () => {
    expect(numToRank(101)).toBe('101st');
  });

  test('returns null for 0', () => {
    expect(numToRank(0)).toBeNull();
  });

  test('returns null for negative numbers', () => {
    expect(numToRank(-1)).toBeNull();
  });

  test('returns null for non-integer numbers', () => {
    expect(numToRank(1.5)).toBeNull();
  });
});

describe('deSnakeCase', () => {
  test('replaces underscores with spaces and capitalizes each word', () => {
    expect(deSnakeCase('hello_world')).toBe('Hello World');
  });

  test('handles multiple underscores', () => {
    expect(deSnakeCase('hello_world_test')).toBe('Hello World Test');
  });

  test('handles leading underscores', () => {
    expect(deSnakeCase('_hello_world_test')).toBe('Hello World Test');
  });

  test('handles trailing underscores', () => {
    expect(deSnakeCase('hello_world_test_')).toBe('Hello World Test');
  });

  test('handles empty string', () => {
    expect(deSnakeCase('')).toBe('');
  });

  test('handles string with no underscores', () => {
    expect(deSnakeCase('helloWorld')).toBe('HelloWorld');
  });
});
