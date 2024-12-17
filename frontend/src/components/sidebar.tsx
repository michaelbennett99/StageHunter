'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

type Props = {
  active?: boolean;
  children: React.ReactNode;
}

export default function Sidebar({ children }: Props): JSX.Element {
  const [active, setActive] = useState(true);

  return (
    <div
      className={cn(
        'absolute top-0 right-0 h-full md:hidden flex flex-col bg-background', 'z-40'
      )}
    >
      <div
        className={cn(
          'overflow-y-auto border-l px-2',
          active ? 'block' : 'hidden'
        )}
      >
        {children}
      </div>
    </div>
  );
}
