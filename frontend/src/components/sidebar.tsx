'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { HiMiniChevronDoubleLeft } from 'react-icons/hi2';

type Props = {
  active?: boolean;
  children: React.ReactNode;
}

export default function Sidebar({ children }: Props): JSX.Element {
  const [active, setActive] = useState(true);

  return (
    <div
      className={cn(
        'absolute top-0 right-0 h-full md:hidden',
        'z-40 flex flex-row',
      )}
    >
      <button
        onClick={() => setActive(!active)}
        className="self-center px-1 py-8 rounded-md bg-background rounded-r-none"
      >
        <HiMiniChevronDoubleLeft />
      </button>
      <div
        className={cn(
          'pr-2',
          active ? 'block' : 'hidden'
        )}
      >
        {children}
      </div>
    </div>
  );
}
