import { Suspense } from 'react';

import { Input, Map, Elevation } from '@/app/(stage)/components';
import { spoof_data } from '@/app/(stage)/data';

export default function Layout(
  { children }: { children: React.ReactNode }
): JSX.Element {
  return (
    <div className="min-h-screen flex flex-col">
      {children}
      <div className="flex-grow flex flex-row" id="main-app-container">
        <Suspense fallback={<div>Loading...</div>}>
          <div
            className="flex flex-col flex-grow"
            id="route-data-container"
          >
            <Map />
            <Elevation />
          </div>
        </Suspense>
        <Input data={spoof_data} />
      </div>
    </div>
  );
}
