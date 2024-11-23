import { useCallback, useEffect, useState } from 'react';
import useSWR from 'swr';

import { clientApiClient } from '@/api/api_client';

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
  const increment = useCallback(
    () => setNumCorrect(prev => prev + step),
    [step]
  );
  return [numCorrect, increment];
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
  const increment = useCallback(
    (step: number) => setNumCorrect(prev => prev + step),
    []
  );
  return [numCorrect, increment];
}

/**
 * A hook that returns a boolean and a function to set it to be true. Once
 * the boolean bomb is set to true, it can never be unset.
 * @returns a boolean and a function to set it to true
 */
export function useBomb(): [boolean, () => void] {
  const [value, setValue] = useState(false);
  const setTrue = useCallback(() => setValue(true), []);
  return [value, setTrue];
}

/**
 * A hook that fetches a value from a URL secretly. When the setter is called,
 * this value is exposed.
 * @param url the URL to fetch the value from
 * @returns the value (null when not exposed), a exposer, and an error
 */
export function useCorrectAnswer<T>(
  url: string
): [T | null, () => void, Error | null] {
  const { data, error, isLoading } = useSWR<T>(
    url,
    async (arg: string) => clientApiClient.fetchJSON<T>(arg)
  );

  const [value, setValue] = useState<T | null>(null);
  const [shouldSetValue, setShouldSetValue] = useState(false);

  useEffect(() => {
    if (shouldSetValue && !isLoading && data) {
      setValue(data);
    }
  }, [shouldSetValue, isLoading, data]);

  const expose = useCallback(() => {
    setShouldSetValue(true);
  }, []);

  return [value, expose, error];
}
