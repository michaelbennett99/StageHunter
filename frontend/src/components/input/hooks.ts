import { useState } from 'react';

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
