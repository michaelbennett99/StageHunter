import { useState } from 'react';

/**
 * A hook that returns a number and a function to increment it.
 * @param start the starting number
 * @param step the amount to increment by
 * @returns a number and a function to increment it
 */
export function useIncrement(
  start: number = 0, step: number = 1
): [number, () => void] {
  const [numCorrect, setNumCorrect] = useState(start);
  return [numCorrect, () => setNumCorrect(numCorrect + step)];
}

export function useDecrement(
  start: number = 0, step: number = 1
): [number, () => void] {
  return useIncrement(start, -step);
}

/**
 * A hook that returns a boolean and a function to set it to be true. Once
 * the boolean bomb is set to true, it can never be unset.
 * @returns a boolean and a function to set it to true
 */
export function useBomb(): [boolean, () => void] {
  const [value, setValue] = useState(false);
  return [value, () => setValue(true)];
}
