import Stage from '@/components/stage';
import { serverApiClient } from '@/api/api_client';
import { HeaderInfoSetter } from '@/context/headerInfoContext';

export const revalidate = 3600; // 1 hour

export default async function Page(): Promise<JSX.Element> {
  const dailyStage = await serverApiClient.getDailyStage();

  const dateString = dailyStage.date.toLocaleDateString(
    undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    }
  );

  return (
    <main className="flex flex-col flex-1 min-h-0">
      <Stage stageId={dailyStage.stage_id} />
      <HeaderInfoSetter headerInfo={dateString} />
    </main>
  );
}
