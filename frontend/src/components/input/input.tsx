'use client';

import { useEffect } from 'react';
import { twJoin } from 'tailwind-merge';

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

  useEffect(() => {
    console.log(infoData);
    console.log(resultsData);
  }, []);

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
      className={twJoin(
        'text-slate-900 bg-slate-100 rounded-md p-2 shadow-md',
        'border-slate-300 border',
      )}
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
    <div
      className="w-80 h-screen mr-2"
      id="input-container"
    >
      <div className="overflow-y-auto h-full">
        <Header text="Guess the stage!" />
        <BoxList>{list_elements}</BoxList>
        <ScoreBug
          score={score}
          numCorrect={numCorrect}
          total={numBoxes}
        />
      </div>
    </div>
  );
}
