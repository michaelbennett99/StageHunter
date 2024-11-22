import Stage from '@/components/stage';
import { apiClient } from '@/api/getters';

export const revalidate = 3600; // 1 hour

export default async function Page(): Promise<JSX.Element> {
  const stageId = await apiClient.getDailyStageId();
  return (
    <Stage stageId={stageId} />
  );
}
