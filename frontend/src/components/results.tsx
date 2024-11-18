import { Suspense } from 'react';

import Input from './input/input';
import { BACKEND_URL } from '@/api/constants';
import { fetchJSON, getStageData } from '@/api/getters';
import { InfoData, Options, ResultsData, StageData } from '@/api/types';

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
    fetchJSON(`${BACKEND_URL}/stage/riders/${stageId}`),
    fetchJSON(`${BACKEND_URL}/stage/teams/${stageId}`),
    getStageData(stageId)
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
