'use client';

import { useIncrement, useVariableIncrement } from './hooks';
import { InfoData, Options, ResultsData } from '@/api/types';
import {
  Header,
  BoxList,
  ScoreBug
} from './components';
import { getInputElements } from './data';

export default function Input(
  { stageId, infoData, resultsData, options }: {
    stageId: string | number;
    infoData: InfoData;
    resultsData: ResultsData;
    options: Options;
  }
): JSX.Element {
  // Hooks
  const [numCorrect, incrementNumCorrect] = useIncrement();
  const [score, incrementScore] = useVariableIncrement();

  // Get all the entries in the data object and list them
  // If the entry is an array, it's a group of entries, so we group them
  // in an InputBoxGroup
  const list_elements = getInputElements(
    stageId,
    infoData,
    resultsData,
    options,
    incrementNumCorrect,
    incrementScore
  ).map((element) => (
    <li
      key={element.props.name ?? 'noname'}
    >
      {element}
    </li>
  ));

  const numInfoBoxes = Object.keys(infoData).length;
  const numResultBoxes = Object.values(resultsData).reduce(
    (acc, curr) => acc + curr,
    0
  );
  const numBoxes = numInfoBoxes + numResultBoxes;

  return (
    <div className="w-80 flex flex-col h-full" id="input-container">
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <BoxList>{list_elements}</BoxList>
      </div>
    </div>
  );
}
