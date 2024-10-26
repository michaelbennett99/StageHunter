import { Suspense } from 'react';

import { Input, Map, Elevation } from '@/app/(stage)/components';
import { spoof_data } from '@/app/(stage)/data';

export default function Layout(
  { children }: { children: React.ReactNode }
): JSX.Element {
  return (
    <div className="min-h-screen flex flex-col">
      {children}
      <div className="flex-grow flex flex-row">
        <Suspense fallback={<div>Loading...</div>}>
          <div className="flex flex-col flex-grow">
            <Map />
            <Elevation />
          </div>
        </Suspense>
        <div className="w-96 flex flex-col h-screen overflow-hidden">
          <Input data={spoof_data} className="overflow-y-auto" />
        </div>
      </div>
    </div>
  );
}
