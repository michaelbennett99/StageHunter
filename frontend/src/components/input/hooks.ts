import { useEffect, useState } from 'react';
import useSWR from 'swr';

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

export function useVariableIncrement(
  start: number = 0,
): [number, (step: number) => void] {
  const [numCorrect, setNumCorrect] = useState(start);
  return [numCorrect, (step: number) => setNumCorrect(numCorrect + step)];
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

/**
 * A hook that fetches a value from a URL secretly. When the setter is called,
 * this value is exposed.
 * @param url the URL to fetch the value from
 * @returns the value (null when not exposed), a exposer, and an error
 */
export function useCorrectAnswer<T>(
  url: string
): [T | null, () => void, any] {
  const { data, error, isLoading } = useSWR<T>(
    url,
    async (url: string) => {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    }
  );

  const [value, setValue] = useState<T | null>(null);
  const [shouldSetValue, setShouldSetValue] = useState(false);

  useEffect(() => {
    if (shouldSetValue && !isLoading && data) {
      setValue(data);
    }
  }, [shouldSetValue, isLoading, data]);

  const expose = () => {
    setShouldSetValue(true);
  };

  return [value, expose, error];
}
