import { Suspense } from 'react';

import Input, { Options } from './input';

const riders = [
  'Egan Bernal',
  'Jonas Vingegaard',
  'Tadej Pogacar',
  'Romain Bardet',
  'Mikel Landa',
  'Mikel Nieve',
  'Pello Bilbao',
  'Ion Izagirre',
  'Gorka Izagirre',
  'Enric Mas',
  'Alejandro Valverde',
  'Nairo Quintana',
  'Rigoberto Uran',
  'Mikel Landa',
  'Mikel Nieve',
  'Pello Bilbao',
  'Ion Izagirre',
  'Gorka Izagirre',
  'Enric Mas',
];

async function ResultsLoader({
  stageId,
  children
}: {
  stageId: string | number;
  children: (options: Options) => JSX.Element;
}): Promise<JSX.Element> {
  const options = {
    grand_tours: ['Tour de France', 'Giro d\'Italia', 'Vuelta a España'],
    riders: riders,
    teams: ['Team Sky', 'Team Jumbo-Visma', 'Team Astana']
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
