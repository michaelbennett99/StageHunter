import { Suspense } from 'react';

import Map from './map';
import Elevation from './elevation';
import Input from './input';
import {
  getTrack,
  getElevationData,
  getResultsData
} from '@/getters';

export default async function Stage({
  stageId
}: {
  stageId: string | number;
}): Promise<JSX.Element> {
  const [track, elevation, results] = await Promise.all([
    getTrack(stageId),
    getElevationData(stageId),
    getResultsData(stageId, 3)
  ]);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow flex flex-row" id="main-app-container">
        <Suspense fallback={<div>Loading...</div>}>
          <div
            className="flex flex-col flex-grow"
            id="route-data-container"
          >
            <Map track={track} />
            <Elevation data={elevation} />
          </div>
        </Suspense>
        <Input data={results} />
      </div>
    </div>
  );
}
