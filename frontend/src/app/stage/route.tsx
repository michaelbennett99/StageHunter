import { Suspense } from 'react';

import Map from './map';
import Elevation from './elevation';
import { GradientData } from '@/types';
import { getTrack, getGradientData } from '@/getters';

async function TrackLoader({
  stageId,
  children
}: {
  stageId: string | number;
  children: (track: GeoJSON.LineString) => JSX.Element;
}): Promise<JSX.Element> {
  const track = await getTrack(stageId);
  return children(track);
}

async function ElevationLoader({
  stageId,
  children
}: {
  stageId: string | number;
  children: (elevation: GradientData[]) => JSX.Element;
}): Promise<JSX.Element> {
  const elevation = await getGradientData(stageId, 1000);
  return children(elevation);
}

export default async function Route({
  stageId
}: {
  stageId: string | number;
}): Promise<JSX.Element> {
  return (
    <div
      className="flex flex-col flex-grow"
      id="route-data-container"
    >
      <Suspense fallback={<div>Loading...</div>}>
        <TrackLoader stageId={stageId}>
          {(track: GeoJSON.LineString) => <Map track={track} />}
        </TrackLoader>
      </Suspense>
      <Suspense fallback={<div>Loading...</div>}>
        <ElevationLoader stageId={stageId}>
          {(elevation: GradientData[]) => <Elevation data={elevation} />}
        </ElevationLoader>
      </Suspense>
    </div>
  );
}
