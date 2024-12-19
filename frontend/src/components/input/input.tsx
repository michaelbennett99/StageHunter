'use client';

import { InfoData, Options, ResultsData } from '@/api/types';
import { BoxList } from './components';
import { getInputElements } from './data';

type Props = {
  stageId: string | number;
  infoData: InfoData;
  resultsData: ResultsData;
  options: Options;
}

export default function Input({
  stageId,
  infoData,
  resultsData,
  options
}: Props): JSX.Element {
  // Get all the entries in the data object and list them
  // If the entry is an array, it's a group of entries, so we group them
  // in an InputBoxGroup
  const list_elements = getInputElements(
    stageId,
    infoData,
    resultsData,
    options
  ).map((element) => (
    <li
      key={element.props.name ?? 'noname'}
    >
      {element}
    </li>
  ));

  return (
    <div className="w-72 flex flex-col h-full" id="input-container">
      <div className="flex-1 overflow-y-auto scrollbar-hide py-2">
        <BoxList>{list_elements}</BoxList>
      </div>
    </div>
  );
}
