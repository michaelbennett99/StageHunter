import Stage from '@/components/stage';
import { serverApiClient } from '@/api/api_client';

export const revalidate = 3600; // 1 hour

export default async function Page(): Promise<JSX.Element> {
  const stageId = await serverApiClient.getDailyStageId();
  return (
    <main className="flex flex-col flex-1 min-h-0">
      <Stage stageId={stageId} />
    </main>
  );
}
