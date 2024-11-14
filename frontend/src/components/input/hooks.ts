import { useState } from 'react';

export function useDecrement(n: number): [number, () => void] {
  const [tries, setTries] = useState(n);
  return [tries, () => setTries(tries - 1)];
}
