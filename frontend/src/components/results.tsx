import { Suspense } from 'react';

import Input, { Options } from './input';
import { BACKEND_URL } from '@/api/constants';
import { fetchJSON } from '@/api/getters';

async function ResultsLoader({
  stageId,
  children
}: {
  stageId: string | number;
  children: (options: Options) => JSX.Element;
}): Promise<JSX.Element> {
  const [riders, teams] = await Promise.all([
    fetchJSON(`${BACKEND_URL}/stage/riders/${stageId}`),
    fetchJSON(`${BACKEND_URL}/stage/teams/${stageId}`)
  ]);
  const options = {
    grand_tours: ['Tour de France', 'Giro d\'Italia', 'Vuelta a España'],
    riders: riders,
    teams: teams
  };
  return children(options);
}

export default async function Results({
  stageId
}: {
  stageId: string | number;
}): Promise<JSX.Element> {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResultsLoader stageId={stageId}>
        {(options: Options) => <Input options={options} />}
      </ResultsLoader>
    </Suspense>
  );
}
