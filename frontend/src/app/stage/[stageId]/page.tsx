import React, { Suspense } from 'react';

import { Input, Map, Elevation } from '@/app/stage/[stageId]/components';
import { spoof_data } from '@/app/stage/data';
import { getTrack } from '@/app/(api)/getters';

export const dynamicParams = false;

export async function generateStaticParams() {
  return Array.from(
    { length: 200 },
    (_, i) => ({ stageId: (i + 1).toString() }),
  );
}

export default async function Page(
  {
    params,
    children
  }: {
    params: Promise<{ stageId: string }>;
    children: React.ReactNode;
  }
): Promise<JSX.Element> {
  const { stageId } = await params;
  const track = await getTrack(stageId);
  return (
    <div className="min-h-screen flex flex-col">
      {children}
      <div className="flex-grow flex flex-row" id="main-app-container">
        <Suspense fallback={<div>Loading...</div>}>
          <div
            className="flex flex-col flex-grow"
            id="route-data-container"
          >
            <Map track={track} />
            <Elevation />
          </div>
        </Suspense>
        <Input data={spoof_data} />
      </div>
    </div>
  );
}
