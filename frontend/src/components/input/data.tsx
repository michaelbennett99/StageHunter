import { InfoData, Options, ResultsData } from '@/api/types';
import { deSnakeCase } from '@/utils/utils';
import { InputBox, InputBoxGroup } from './components';
import path from 'path';

function InfoInputBoxGroup(
  {
    stageId,
    infoData,
    options,
    incrementNumCorrect = () => {},
    incrementScore = () => {}
  }: {
    stageId: number | string;
    infoData: InfoData;
    options: Options;
    incrementNumCorrect?: () => void;
    incrementScore?: (score: number) => void;
  }
): JSX.Element {
  const correctInfoURL = path.join('stages', stageId.toString(), 'info');
  const infoValidationURL = path.join(
    'stages',
    stageId.toString(),
    'verify',
    'info'
  );

  const inputElements: JSX.Element[] = Object.entries(infoData)
    .filter(([,value]) => value)
    .map(([key,]) => (
      <InputBox
        key={key}
        name={deSnakeCase(key)}
        correctURL={`${correctInfoURL}/${key}`}
        validationURL={`${infoValidationURL}/${key}`}
        options={key === 'grand_tour' ? options.grand_tours : undefined}
        incrementNumCorrect={incrementNumCorrect}
        incrementScore={() => incrementScore?.(10)}
      />
    ));

  return (
    <div
      className="flex flex-col gap-1 bg-background rounded-md p-2 shadow-md border"
    >
      <h3 className="font-semibold mb-1">Stage Info</h3>
      {inputElements}
    </div>
  );
}

function getResultInputBoxGroups(
  stageId: number | string,
  resultsData: ResultsData,
  options: Options,
  incrementNumCorrect?: () => void,
  incrementScore?: (score: number) => void
): JSX.Element[] {
  const correctResultURL = path.join('stages', stageId.toString(), 'results');
  const resultsValidationURL = path.join(
    'stages',
    stageId.toString(),
    'verify',
    'results'
  );

  return Object.entries(resultsData)
    .filter(([,value]) => value > 0)
    .map(([key, value]) => (
      <InputBoxGroup
        key={key}
        name={deSnakeCase(key) + ' Classification'}
        nBoxes={value}
        correctURL={`${correctResultURL}/${key}`}
        validationURL={`${resultsValidationURL}/${key}`}
        options={key === 'teams' ? options.teams : options.riders}
        incrementNumCorrect={incrementNumCorrect}
        incrementScore={() => incrementScore?.(10)}
      />
    ));
}

export function getInputElements(
  stageId: number | string,
  infoData: InfoData,
  resultsData: ResultsData,
  options: Options,
  incrementNumCorrect?: () => void,
  incrementScore?: (score: number) => void
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
