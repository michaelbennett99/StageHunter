import { Suspense } from 'react';

import { Input, Map, Elevation } from '@/app/(stage)/components';

export default function Layout(
  { children }: { children: React.ReactNode }
): JSX.Element {
  return (
    <div className="min-h-screen flex flex-col">
      {children}
      <div className="flex-grow flex flex-row">
        <Suspense fallback={<div>Loading...</div>}>
          <div className="flex-grow flex flex-col">
            <Map />
            <Elevation />
          </div>
        </Suspense>
        <div className="flex-none">
          <Input />
        </div>
      </div>
    </div>
  );
}
