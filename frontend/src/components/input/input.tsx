'use client';

import { useState, ChangeEventHandler } from 'react';
import { FaCheck, FaTimes, FaPlus, FaSpinner } from 'react-icons/fa';

import { numToRank } from '@/utils/utils';
import Autocomplete from '@/components/autocomplete';
import { useDecrement } from './hooks';

export interface Options {
  grand_tours: string[];
  riders: string[];
  teams: string[];
}

export default function Input(
  { stageId, options }: { stageId: string | number; options: Options }
): JSX.Element {
  const infoValidationURL = `/api/stage/info/verify/${stageId}`;
  const resultsValidationURL = `/api/stage/results/verify/${stageId}`;

  // Get all the entries in the data object and list them
  // If the entry is an array, it's a group of entries, so we group them
  // in an InputBoxGroup
  const list_elements = [
    <InputBox
      name="Grand Tour"
      validationURL={`${infoValidationURL}?f=grand_tour`}
      options={options.grand_tours}
    />,
    <InputBox
      name="Year"
      validationURL={`${infoValidationURL}?f=year`}
    />,
    <InputBox
      name="Number"
      validationURL={`${resultsValidationURL}?f=stage_no`}
    />,
    <InputBox
      name="Start"
      validationURL={`${infoValidationURL}?f=stage_start`}
    />,
    <InputBox
      name="End"
      validationURL={`${infoValidationURL}?f=stage_end`}
    />,
    <InputBoxGroup
      name="Stage Results"
      nBoxes={3}
      validationURL={`${resultsValidationURL}?c=stage`}
      options={options.riders}
    />,
    <InputBoxGroup
      name="GC Results"
      nBoxes={3}
      validationURL={`${resultsValidationURL}?c=general`}
      options={options.riders}
    />,
    <InputBoxGroup
      name="Points Results"
      nBoxes={3}
      validationURL={`${resultsValidationURL}?c=points`}
      options={options.riders}
    />,
    <InputBoxGroup
      name="KOM Results"
      nBoxes={3}
      validationURL={`${resultsValidationURL}?c=mountains`}
      options={options.riders}
    />,
    <InputBoxGroup
      name="Youth Results"
      nBoxes={3}
      validationURL={`${resultsValidationURL}?c=youth`}
      options={options.riders}
    />,
    <InputBoxGroup
      name="Teams Results"
      nBoxes={3}
      validationURL={`${resultsValidationURL}?c=teams`}
      options={options.teams}
    />,
  ].map((element) => (
    <li key={element.props.name}>{element}</li>
  ));

  return (
    <div
      className="w-80 flex flex-col h-screen overflow-hidden"
      id="input-container"
    >
      <div className="overflow-y-auto h-full pl-6 pr-6 bg-slate-100">
        <Header text="Guess the stage!" />
        <BoxList>{list_elements}</BoxList>
        <ScoreBug score={0} />
      </div>
    </div>
  );
}

function Header(
  { text }: { text: string }
): JSX.Element {
  return (
    <h2
      className="font-semibold mt-4 mb-2 text-lg text-center text-black"
    >
      {text}
    </h2>
  );
}

function BoxList(
  { children }: { children: React.ReactNode }
): JSX.Element {
  return <ul className="flex flex-col gap-1">{children}</ul>;
}

function InputBoxGroup(
  { name, nBoxes, validationURL, options }: {
    name: string;
    nBoxes: number;
    validationURL: string;
    options?: string[];
  }
): JSX.Element {
  // A group of input boxes for a single result type
  return (
    <>
      <h3 className="font-semibold mb-1 text-black">{name}</h3>
      <ul className="flex flex-col gap-1">
        {Array.from({ length: nBoxes }, (_, i) => (
          <li
            key={`${name}-${i}`}
            className="flex flex-row items-center ml-4"
          >
            <InputBox
              name={numToRank(i + 1) ?? ''}
              validationURL={`${validationURL}&r=${i+1}`}
              options={options}
            />
          </li>
        ))}
      </ul>
    </>
  );
}

function InputBox(
  { name, validationURL, options }: {
    name: string;
    validationURL: string;
    options?: string[];
  }
): JSX.Element {
  const [val, setVal] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [tries, decrementTries] = useDecrement(1);

  const handleSubmit = async () => {
    if (isCorrect || tries <= 0 || val === '') return;

    setIsLoading(true);
    try {
      const response = await fetch(`${validationURL}&v=${val}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const data: boolean = await response.json();
      setIsCorrect(data);
      decrementTries();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex items-center w-full h-full gap-1">
      <div className="flex-grow text-black text-sm">{name}</div>
      <TextInput
        value={val}
        tries={tries}
        isLoading={isLoading}
        isCorrect={isCorrect}
        onChange={(e) => setVal(e.target.value)}
        onSubmit={handleSubmit}
        options={options}

      />
    </div>
  );
}

function ButtonText({ tries, isCorrect, isLoading }: {
  tries: number;
  isCorrect: boolean;
  isLoading: boolean;
}): JSX.Element {
  if (isLoading) return <FaSpinner className="h-full w-full animate-spin" />;
  if (tries <= 0 && !isCorrect) return <FaTimes className="h-full w-full" />;
  if (isCorrect) return <FaCheck className="h-full w-full" />;
  return <FaPlus className="h-full w-full" />;
}

// A text input box that checks if the input is correct and disables
// itself if it is
function TextInput({
  value,
  tries,
  isLoading,
  isCorrect,
  onChange,
  onSubmit,
  options,
  className,
}: {
  value: string;
  tries: number;
  isLoading: boolean;
  isCorrect: boolean;
  onChange: ChangeEventHandler<HTMLInputElement>;
  onSubmit: () => Promise<void>;
  options?: string[];
  className?: string;
}): JSX.Element {
  // Handler functions
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit();
  }

  const inputClassName = `
    h-full w-40 p-1 border-2 border-gray-300 text-black rounded-md
    ${className}
  `;

  const noMoreInput = isCorrect || tries <= 0;
  const isIncorrect = !isCorrect && tries <= 0;

  return (
    <form
      className="flex items-center h-full gap-1"
      onSubmit={handleSubmit}
    >
      {options ? (
        <Autocomplete
          value={value}
          onChange={onChange}
          options={options}
          inputClassName={inputClassName}
          disabled={noMoreInput}
        />
      ) : (
        <input
          className={inputClassName}
          type="text"
          value={value}
          onChange={onChange}
          disabled={noMoreInput}
        />
      )}
      <button
        type="submit"
        className={`
          bg-blue-500 text-white p-1 rounded-md h-full w-full
          ${!noMoreInput ? 'hover:bg-blue-700' : ''}
          ${isCorrect ? 'bg-green-500' : ''}
          ${isIncorrect ? 'bg-red-500' : ''}
        `}
        disabled={noMoreInput}
        tabIndex={-1}
      >
        <ButtonText tries={tries} isCorrect={isCorrect} isLoading={isLoading} />
      </button>
    </form>
  );
}

function ScoreBug(
  { score }: { score: number }
): JSX.Element {
  return <div className="text-center mt-2 mb-4 text-black">Score: {score}</div>;
}
