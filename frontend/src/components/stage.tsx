import Route from './route';
import Results from './results';
import Sidebar from './sidebar';

import { serverApiClient } from '@/api/api_client';
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
  const stageLength = await serverApiClient.getStageLength(stageId);
  const resolution = stageLength < 50 ? 50 : 200;
  const [track, gradientData] = await Promise.all([
    serverApiClient.getTrack(stageId),
    serverApiClient.getGradientData(stageId, resolution)
  ]);
  return (
    <div className="relative h-full w-full flex flex-col overflow-hidden">
      <div
        className="flex flex-row h-full bg-background text-foreground gap-4 px-2"
        id="main-app-container"
      >
        <Route track={track} elevation={gradientData} />
        <div className="hidden md:block">
          <Results stageId={stageId} />
        </div>
      </div>
      <Sidebar>
        <Results stageId={stageId} />
      </Sidebar>
    </div>
  );
}
