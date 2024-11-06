import Route from './route';
import Results from './results';

import { getTrack, getGradientData } from '@/getters';
// import { GradientData } from '@/types';

// async function TrackLoader({
//   stageId,
//   children
// }: {
//   stageId: string | number;
//   children: (track: GeoJSON.LineString) => JSX.Element;
// }): Promise<JSX.Element> {
//   const track = await getTrack(stageId);
//   return children(track);
// }

// async function ElevationLoader({
//   stageId,
//   children
// }: {
//   stageId: string | number;
//   children: (elevation: GradientData[]) => JSX.Element;
// }): Promise<JSX.Element> {
//   const elevation = await getGradientData(stageId, 1000);
//   return children(elevation);
// }

export default async function Stage({
  stageId
}: {
  stageId: string | number;
}): Promise<JSX.Element> {
  const [track, gradientData] = await Promise.all([
    getTrack(stageId),
    getGradientData(stageId, 100)
  ]);
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow flex flex-row" id="main-app-container">
        <Route track={track} elevation={gradientData} />
        <Results stageId={stageId} />
      </div>
    </div>
  );
}
