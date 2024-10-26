import { ReactElement } from "react";

export const dynamicParams = false;

export async function generateStaticParams() {
  return Array.from(
    { length: 10 },
    (_, i) => ({ stageId: (i + 1).toString() }),
  );
}

export default async function Page({
  params,
}: {
  params: Promise<{ stageId: string }>;
}): Promise<ReactElement> {
  const { stageId } = await params;
  return <h1>Stage {stageId}</h1>;
}
