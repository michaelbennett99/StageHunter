import Stage from '@/app/stage/stage';
import { getDailyStageId } from '@/getters';

export default async function Page(): Promise<JSX.Element> {
  const stageId = await getDailyStageId();
  return (
    <Stage stageId={stageId} />
  );
}
