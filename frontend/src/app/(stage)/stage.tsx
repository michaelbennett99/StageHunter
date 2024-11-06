import { Suspense } from 'react';

import Map from './map';
import Elevation from './elevation';
import Input from './input';
import { GradientData, ResultsData } from '@/types';
import {
  getTrack,
  getGradientData,
  getResultsData
} from '@/getters';

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

async function ResultsLoader({
  stageId,
  children
}: {
  stageId: string | number;
  children: (results: ResultsData) => JSX.Element;
}): Promise<JSX.Element> {
  const results = await getResultsData(stageId, 3);
  return children(results);
}

export default async function Stage({
  stageId
}: {
  stageId: string | number;
}): Promise<JSX.Element> {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow flex flex-row" id="main-app-container">
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
        <Suspense fallback={<div>Loading...</div>}>
          <ResultsLoader stageId={stageId}>
            {(results: ResultsData) => <Input data={results} />}
          </ResultsLoader>
        </Suspense>
      </div>
    </div>
  );
}
