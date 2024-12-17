'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { HiMiniChevronDoubleLeft } from 'react-icons/hi2';

type Props = {
  active?: boolean;
  children: React.ReactNode;
}

export default function Sidebar({ children }: Props): JSX.Element {
  const [active, setActive] = useState(false);

  return (
    <div
      className={cn(
        'absolute top-0 right-0 h-full md:hidden',
        'z-40 flex flex-row',
        'transition-all duration-300 ease-in-out',
        active
          ? 'translate-x-0'
          : 'translate-x-[calc(100%-1.5rem)]'
      )}
    >
      <button
        onClick={() => setActive(!active)}
        className={cn(
          'self-center px-1 py-8 rounded-md bg-background rounded-r-none'
        )}
      >
        <HiMiniChevronDoubleLeft
          className={cn(
            'transition-transform duration-300',
            active ? 'rotate-180' : 'rotate-0'
          )}
        />
      </button>
      <div
        className={cn(
          'px-2 bg-background/80 border-l',
          active
            ? ''
            : 'pointer-events-none'
        )}
      >
        {children}
      </div>
    </div>
  );
}
