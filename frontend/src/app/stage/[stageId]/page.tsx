import Stage from '@/components/stage';
import { apiClient } from '@/api/getters';

export const dynamicParams = false;

export async function generateStaticParams() {
  const stages = await apiClient.getAllStageIDs();
  return stages.map((stage) => ({ stageId: stage.toString() }));
}

export default async function Page({
  params
}: {
  params: Promise<{ stageId: string }>;
}): Promise<JSX.Element> {
  const { stageId } = await params;
  return (
    <Stage stageId={stageId} />
  );
}
