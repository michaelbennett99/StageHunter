import { useEffect } from 'react';

export function useResize(
  containerRef: React.MutableRefObject<HTMLElement | null>,
  setWidth: (width: number) => void,
  setHeight: (height: number) => void
) {
  useEffect(() => {
    const parent = containerRef.current;
    if (!parent) {
      return () => {};
    };

    // Initial size
    setWidth(parent.clientWidth);
    setHeight(parent.clientHeight);

    // Handle both window resize and container resize
    const resizeObserver = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setWidth(width);
      setHeight(height);
    });

    resizeObserver.observe(parent);

    // Clean up
    return () => {
      resizeObserver.disconnect();
    };
  }, [containerRef, setWidth, setHeight]); // Include all dependencies
}
