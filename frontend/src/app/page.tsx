import Stage from '@/components/stage';
import { getDailyStageId } from '@/api/getters';

export const revalidate = 3600; // 1 hour

export default async function Page(): Promise<JSX.Element> {
  const stageId = await getDailyStageId();
  return (
    <Stage stageId={stageId} />
  );
}
