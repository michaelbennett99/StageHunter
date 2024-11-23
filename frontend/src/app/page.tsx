import Stage from '@/components/stage';
import { serverApiClient } from '@/api/api_client';

export const revalidate = 3600; // 1 hour

export default async function Page(): Promise<JSX.Element> {
  const stageId = await serverApiClient.getDailyStageId();
  return (
    <Stage stageId={stageId} />
  );
}
