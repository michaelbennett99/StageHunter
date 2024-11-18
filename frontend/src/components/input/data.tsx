import { InfoData, Options, ResultsData } from '@/api/types';
import { deSnakeCase } from '@/utils/utils';
import { InputBox, InputBoxGroup } from './components';

function InfoInputBoxGroup(
  {
    stageId,
    infoData,
    options,
    incrementNumCorrect,
    incrementScore
  }: {
    stageId: number | string;
    infoData: InfoData;
    options: Options;
    incrementNumCorrect: () => void;
    incrementScore: (score: number) => void;
  }
): JSX.Element {
  const correctInfoURL = `/api/stage/info/correct/${stageId}`;
  const infoValidationURL = `/api/stage/info/verify/${stageId}`;

  const inputElements: JSX.Element[] = Object.entries(infoData)
    .filter(([_, value]) => value)
    .map(([key, _]) => (
      <InputBox
        name={deSnakeCase(key)}
        correctURL={`${correctInfoURL}?f=${key}`}
        validationURL={`${infoValidationURL}?f=${key}`}
        options={key === 'grand_tour' ? options.grand_tours : undefined}
        incrementNumCorrect={incrementNumCorrect}
        incrementScore={() => incrementScore(10)}
      />
    ));

  return (
    <div className="flex flex-col gap-1">
      <h3 className="font-semibold mb-1">Stage Info</h3>
      {inputElements}
    </div>
  );
}

function getResultInputBoxGroups(
  stageId: number | string,
  resultsData: ResultsData,
  options: Options,
  incrementNumCorrect: () => void,
  incrementScore: (score: number) => void
): JSX.Element[] {
  const correctResultURL = `/api/stage/results/correct/${stageId}`;
  const resultsValidationURL = `/api/stage/results/verify/${stageId}`;

  return Object.entries(resultsData)
    .filter(([_, value]) => value > 0)
    .map(([key, value]) => (
      <InputBoxGroup
        name={deSnakeCase(key) + ' Classification'}
        nBoxes={value}
        correctURL={`${correctResultURL}?c=${key}`}
        validationURL={`${resultsValidationURL}?c=${key}`}
        options={key === 'teams' ? options.teams : options.riders}
        incrementNumCorrect={incrementNumCorrect}
        incrementScore={() => incrementScore(10)}
      />
    ));
}

export function getInputElements(
  stageId: number | string,
  infoData: InfoData,
  resultsData: ResultsData,
  options: Options,
  incrementNumCorrect: () => void,
  incrementScore: (score: number) => void
): JSX.Element[] {
  const infoInputBoxGroup = <InfoInputBoxGroup
    stageId={stageId}
    infoData={infoData}
    options={options}
    incrementNumCorrect={incrementNumCorrect}
    incrementScore={incrementScore}
  />;

  const resultInputBoxGroups = getResultInputBoxGroups(
    stageId,
    resultsData,
    options,
    incrementNumCorrect,
    incrementScore
  );

  return [infoInputBoxGroup, ...resultInputBoxGroups];
}
