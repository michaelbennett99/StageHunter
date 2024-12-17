import { useEffect, useState } from 'react';
import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfig from '@/../tailwind.config';

const fullConfig = resolveConfig(tailwindConfig);
const screens = fullConfig.theme.screens;

export default function useBreakpoint(breakpoint: keyof typeof screens) {
  const [isBelow, setIsBelow] = useState(false);

  useEffect(() => {
    const checkSize = () => {
      const breakpointValue = parseInt(screens[breakpoint].replace('px', ''));
      setIsBelow(window.innerWidth < breakpointValue);
    }

    checkSize();
    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, [breakpoint]);

  return isBelow;
}
