import { Suspense } from 'react';

import Input from './input/input';
import { serverApiClient } from '@/api/api_client';
import { InfoData, Options, ResultsData } from '@/api/types';

async function ResultsLoader({
  stageId,
  children
}: {
  stageId: string | number;
  children: (
    infoData: InfoData,
    resultsData: ResultsData,
    options: Options
  ) => JSX.Element;
}): Promise<JSX.Element> {
  const [riders, teams, {info, results}] = await Promise.all([
    serverApiClient.getRiders(stageId),
    serverApiClient.getTeams(stageId),
    serverApiClient.getStageData(stageId)
  ]);
  const options = {
    grand_tours: ['Tour de France', 'Giro d\'Italia', 'Vuelta a España'],
    riders: riders,
    teams: teams
  };
  return children(info, results, options);
}

export default async function Results({
  stageId
}: {
  stageId: string | number;
}): Promise<JSX.Element> {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResultsLoader stageId={stageId}>
        {(infoData: InfoData, resultsData: ResultsData, options: Options) => (
          <Input
            stageId={stageId}
            infoData={infoData}
            resultsData={resultsData}
            options={options}
          />
        )}
      </ResultsLoader>
    </Suspense>
  );
}
