import { Suspense } from 'react';

import Input from './input';
import { ResultsData } from '@/api/types';
import { getResultsData } from '@/api/getters';

async function ResultsLoader({
  stageId,
  children
}: {
  stageId: string | number;
  children: (results: ResultsData) => JSX.Element;
}): Promise<JSX.Element> {
  const results = await getResultsData(stageId, 3);
  return children(results);
}

export default async function Results({
  stageId
}: {
  stageId: string | number;
}): Promise<JSX.Element> {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResultsLoader stageId={stageId}>
        {(results: ResultsData) => <Input data={results} />}
      </ResultsLoader>
    </Suspense>
  );
}
