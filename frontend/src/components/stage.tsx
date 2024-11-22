import Route from './route';
import Results from './results';

import { apiClient } from '@/api/getters';
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
  const stageLength = await apiClient.getStageLength(stageId);
  const resolution = stageLength < 50 ? 50 : 200;
  const [track, gradientData] = await Promise.all([
    apiClient.getTrack(stageId),
    apiClient.getGradientData(stageId, resolution)
  ]);
  return (
    <div className="h-screen">
      <div
        className="flex-grow flex flex-row bg-slate-50 text-slate-950 gap-4"
        id="main-app-container"
      >
        <Route track={track} elevation={gradientData} />
        <Results stageId={stageId} />
      </div>
    </div>
  );
}
