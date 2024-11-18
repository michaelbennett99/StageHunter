'use client';

import { useEffect, useState, ChangeEventHandler } from 'react';
import { FaCheck, FaTimes, FaPlus, FaSpinner } from 'react-icons/fa';
import ReactDOM from 'react-dom';

import { numToRank } from '@/utils/utils';
import AutoComplete from '@/components/autocomplete';
import { useIncrement, useDecrement, useBomb, useCorrectAnswer } from './hooks';
import { twJoin, twMerge } from 'tailwind-merge';

export interface Options {
  grand_tours: string[];
  riders: string[];
  teams: string[];
}

export default function Input(
  { stageId, options }: { stageId: string | number; options: Options }
): JSX.Element {
  const [numCorrect, incrementNumCorrect] = useIncrement();
  const [score, setScore] = useState(0);

  const correctInfoURL = `/api/stage/info/correct/${stageId}`;
  const correctResultURL = `/api/stage/results/correct/${stageId}`;
  const infoValidationURL = `/api/stage/info/verify/${stageId}`;
  const resultsValidationURL = `/api/stage/results/verify/${stageId}`;

  // Get all the entries in the data object and list them
  // If the entry is an array, it's a group of entries, so we group them
  // in an InputBoxGroup
  const list_elements = [
    <div className="flex flex-col gap-1">
      <h3 className="font-semibold mb-1">Stage Info</h3>
      <InputBox
        name="Grand Tour"
        correctURL={`${correctInfoURL}?f=grand_tour`}
        validationURL={`${infoValidationURL}?f=grand_tour`}
        options={options.grand_tours}
        incrementNumCorrect={incrementNumCorrect}
        incrementScore={() => setScore(score + 10)}
      />
      <InputBox
        name="Year"
        correctURL={`${correctInfoURL}?f=year`}
        validationURL={`${infoValidationURL}?f=year`}
        incrementNumCorrect={incrementNumCorrect}
        incrementScore={() => setScore(score + 10)}
      />
      <InputBox
        name="Number"
        correctURL={`${correctInfoURL}?f=stage_no`}
        validationURL={`${infoValidationURL}?f=stage_no`}
        incrementNumCorrect={incrementNumCorrect}
        incrementScore={() => setScore(score + 10)}
      />
      <InputBox
        name="Start"
        correctURL={`${correctInfoURL}?f=stage_start`}
        validationURL={`${infoValidationURL}?f=stage_start`}
        incrementNumCorrect={incrementNumCorrect}
        incrementScore={() => setScore(score + 10)}
      />
      <InputBox
        name="End"
        correctURL={`${correctInfoURL}?f=stage_end`}
        validationURL={`${infoValidationURL}?f=stage_end`}
        incrementNumCorrect={incrementNumCorrect}
        incrementScore={() => setScore(score + 10)}
      />
    </div>,
    <InputBoxGroup
      name="Stage Results"
      nBoxes={3}
      correctURL={`${correctResultURL}?c=stage`}
      validationURL={`${resultsValidationURL}?c=stage`}
      options={options.riders}
      incrementNumCorrect={incrementNumCorrect}
      incrementScore={() => setScore(score + 10)}
    />,
    <InputBoxGroup
      name="GC Results"
      nBoxes={3}
      correctURL={`${correctResultURL}?c=general`}
      validationURL={`${resultsValidationURL}?c=general`}
      options={options.riders}
      incrementNumCorrect={incrementNumCorrect}
      incrementScore={() => setScore(score + 10)}
    />,
    <InputBoxGroup
      name="Points Results"
      nBoxes={3}
      correctURL={`${correctResultURL}?c=points`}
      validationURL={`${resultsValidationURL}?c=points`}
      options={options.riders}
      incrementNumCorrect={incrementNumCorrect}
      incrementScore={() => setScore(score + 10)}
    />,
    <InputBoxGroup
      name="KOM Results"
      nBoxes={3}
      correctURL={`${correctResultURL}?c=mountains`}
      validationURL={`${resultsValidationURL}?c=mountains`}
      options={options.riders}
      incrementNumCorrect={incrementNumCorrect}
      incrementScore={() => setScore(score + 10)}
    />,
    <InputBoxGroup
      name="Youth Results"
      nBoxes={3}
      correctURL={`${correctResultURL}?c=youth`}
      validationURL={`${resultsValidationURL}?c=youth`}
      options={options.riders}
      incrementNumCorrect={incrementNumCorrect}
      incrementScore={() => setScore(score + 10)}
    />,
    <InputBoxGroup
      name="Teams Results"
      nBoxes={3}
      correctURL={`${correctResultURL}?c=teams`}
      validationURL={`${resultsValidationURL}?c=teams`}
      options={options.teams}
      incrementNumCorrect={incrementNumCorrect}
      incrementScore={() => setScore(score + 10)}
    />,
  ].map((element) => (
    <li
      key={element.props.name ?? 'noname'}
      className="text-slate-900 bg-slate-100 rounded-md p-2 shadow-md"
    >
      {element}
    </li>
  ));

  const numBoxes = list_elements.reduce(
    (acc, curr) => {
      const nElements = curr.props.children.props.nBoxes || 1;
      return acc + nElements;
    },
    0
  );

  return (
    <div
      className="w-80 flex flex-col h-screen overflow-hidden"
      id="input-container"
    >
      <div className="overflow-y-auto h-full ml-2 pr-2">
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

function Header(
  { text }: { text: string }
): JSX.Element {
  return (
    <h2
      className="font-semibold mt-4 mb-2 text-lg text-center"
    >
      {text}
    </h2>
  );
}

function BoxList(
  { children }: { children: React.ReactNode }
): JSX.Element {
  return <ul className="flex flex-col gap-2">{children}</ul>;
}

function InputBoxGroup(
  { name,
    nBoxes,
    correctURL,
    validationURL,
    options,
    incrementNumCorrect,
    incrementScore
  }: {
    name: string;
    nBoxes: number;
    correctURL: string;
    validationURL: string;
    options?: string[];
    incrementNumCorrect: () => void;
    incrementScore: () => void;
  }
): JSX.Element {
  // A group of input boxes for a single result type
  return (
    <>
      <h3 className="font-semibold mb-1">{name}</h3>
      <ul className="flex flex-col gap-1">
        {Array.from({ length: nBoxes }, (_, i) => (
          <li
            key={`${name}-${i}`}
            className="flex flex-row items-center ml-4"
          >
            <InputBox
              name={numToRank(i + 1) ?? ''}
              correctURL={`${correctURL}&r=${i+1}`}
              validationURL={`${validationURL}&r=${i+1}`}
              options={options}
              incrementNumCorrect={incrementNumCorrect}
              incrementScore={incrementScore}
            />
          </li>
        ))}
      </ul>
    </>
  );
}

function InputBox(
  {
    name,
    correctURL,
    validationURL,
    options,
    incrementNumCorrect,
    incrementScore
  }: {
    name: string;
    correctURL: string;
    validationURL: string;
    options?: string[];
    incrementNumCorrect: () => void;
    incrementScore: () => void;
  }
): JSX.Element {
  const [val, setVal] = useState('');
  const [
    correctAnswer,
    exposeCorrectAnswer
  ] = useCorrectAnswer<string>(correctURL);
  const [isCorrect, setIsCorrect] = useBomb();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [tries, decrementTries] = useDecrement(1);

  // IsCorrect can only be set to true once, so we use a useEffect to
  // increment the number of correct guesses and the score
  // Relies on isCorrect using the useBomb custom hook
  useEffect(() => {
    if (isCorrect) {
      incrementNumCorrect();
      incrementScore();
    }
  }, [isCorrect]);

  // Handle an input box submission
  const handleSubmit = async () => {
    if (isCorrect || tries <= 0 || val === '') return;

    setIsLoading(true);
    try {
      // Normal validation for non-final tries
      const response = await fetch(`${validationURL}&v=${val}`);
      const isValid = await response.json();

      const batchedUpdates = () => {
        if (tries === 1) exposeCorrectAnswer();
        if (isValid) setIsCorrect();
        decrementTries();
      };

      ReactDOM.flushSync(batchedUpdates);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex items-center w-full h-full gap-1">
      <div className="flex-grow text-sm">{name}</div>
      <TextInput
        value={val}
        correctAnswer={correctAnswer}
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
  correctAnswer,
  tries,
  isLoading,
  isCorrect,
  onChange,
  onSubmit,
  options,
  className,
}: {
  value: string;
  correctAnswer: string | null;
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

  const noMoreInput = isCorrect || tries <= 0;
  const isIncorrect = !isCorrect && tries <= 0;

  let inputClassName = twMerge(
    'h-full w-40 p-1 border-2 border-gray-300 rounded-md disabled:bg-slate-50',
    className
  );

  if (isCorrect) inputClassName = twMerge(
    inputClassName, 'border-green-500'
  );
  if (isIncorrect) inputClassName = twMerge(
    inputClassName, 'border-red-500'
  );

  const optionsListClassName = `
    border-2 rounded-md bg-popover text-popover-foreground
  `;

  const optionClassName = `
    p-1 border-0
    outline outline-offset-0 outline-[0.5px] outline-gray-300 outline-dashed
  `;

  const selectedOptionClassName = optionClassName + `
    bg-accent text-accent-foreground outline-gray-300
  `;

  return (
    <form
      className="flex items-center h-full gap-1 text-sm"
      onSubmit={handleSubmit}
    >
      <div className="relative flex-grow group">
        <AutoComplete
          value={value}
          maxShownResults={10}
          onChange={onChange}
          options={options}
          inputClassName={inputClassName}
          disabled={noMoreInput}
          optionsListClassName={optionsListClassName}
          optionClassName={optionClassName}
          selectedOptionClassName={selectedOptionClassName}
        />
        {
          isIncorrect && (
            <span
              className={twMerge(
                inputClassName,
                twJoin(
                  'absolute inset-0 invisible group-hover:visible',
                  'text-nowrap overflow-x-auto z-50 pointer-events-none',
                  'flex items-center bg-red-100'
                )
              )}
            >
              {correctAnswer}
            </span>
          )
        }
      </div>
      <button
        type="submit"
        className={`
          bg-blue-500 text-white p-1 rounded-md h-full w-full z-10
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
  { score, numCorrect, total }: {
    score: number;
    numCorrect: number;
    total: number;
  }
): JSX.Element {
  return (
    <div
      className="mt-2 mb-4 text-black flex flex-row gap-2 justify-center"
    >
      <p>Correct: {numCorrect}/{total}</p>
      <p>Score: {score}</p>
    </div>
  );
}
