import { useEffect, useState, ChangeEventHandler } from 'react';
import ReactDOM from 'react-dom';
import { FaCheck, FaPlus, FaSpinner, FaTimes } from 'react-icons/fa';
import { twMerge, twJoin } from 'tailwind-merge';

import AutoComplete from '@/components/autocomplete';
import { clientApiClient } from '@/api/api_client';
import {
  useCorrectAnswer,
  useBomb,
  useDecrement
} from '@/components/input/hooks';
import { numToRank } from '@/utils/utils';

export function Header(
  { text }: { text: string }
): JSX.Element {
  return (
    <h2
      className="font-semibold my-2 text-lg text-center"
    >
      {text}
    </h2>
  );
}

export function BoxList(
  { children }: { children: React.ReactNode }
): JSX.Element {
  return <ul
    className="flex flex-col gap-2 z-10"
  >
    {children}
  </ul>;
}

export function InputBoxGroup(
  { name,
    nBoxes,
    correctURL,
    validationURL,
    options,
    incrementNumCorrect = () => {},
    incrementScore = () => {}
  }: {
    name: string;
    nBoxes: number;
    correctURL: string;
    validationURL: string;
    options?: string[];
    incrementNumCorrect?: () => void;
    incrementScore?: () => void;
  }
): JSX.Element {
  // A group of input boxes for a single result type
  return (
    <div className="bg-background rounded-md p-2 shadow-md border">
      <h3 className="font-semibold mb-1">{name}</h3>
      <ul className="flex flex-col gap-1">
        {Array.from({ length: nBoxes }, (_, i) => (
          <li
            key={`${name}-${i}`}
            className="flex flex-row items-center ml-4"
          >
            <InputBox
              name={numToRank(i + 1) ?? ''}
              correctURL={`${correctURL}/${i+1}/name`}
              validationURL={`${validationURL}/${i+1}`}
              options={options}
              incrementNumCorrect={incrementNumCorrect}
              incrementScore={incrementScore}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function InputBox(
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
    // These hooks should not change and if they did, should not trigger
    // this effect
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCorrect]);

  // Handle an input box submission
  const handleSubmit = async () => {
    if (isCorrect || tries <= 0 || val === '') return;

    console.log('handleSubmit');

    setIsLoading(true);
    try {
      // Normal validation for non-final tries
      const isValid: boolean = await clientApiClient.fetchJSON(
        `${validationURL}?v=${val}`
      );

      console.log(isValid);

      const batchedUpdates = () => {
        console.log('batchedUpdates');
        if (tries === 1) exposeCorrectAnswer();
        if (isValid) setIsCorrect();
        decrementTries();
      };

      ReactDOM.flushSync(batchedUpdates);
    } catch (error) {
      console.error(error);
    } finally {
      console.log('finally');
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

export function ButtonText({ tries, isCorrect, isLoading }: {
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
export function TextInput({
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
    'h-full w-40 p-1 border-2 rounded-md',
    className
  );

  if (isCorrect) inputClassName = twMerge(
    inputClassName, 'border-green-500'
  );
  if (isIncorrect) inputClassName = twMerge(
    inputClassName, 'border-red-500'
  );

  const optionsListClassName = `
    border-2 rounded-md bg-popover text-popover-foreground cursor-default
  `;

  const optionClassName = `
    p-1 border-0 select-none
    outline outline-offset-0 outline-[0.5px] outline-dashed outline-accent
  `;

  const selectedOptionClassName = `
    bg-accent text-accent-foreground
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
          noMoreInput && (
            <span
              className={twMerge(
                inputClassName,
                twJoin(
                  'absolute inset-0 invisible group-hover:visible',
                  'text-nowrap z-50 flex items-center',
                  'select-none cursor-default overflow-x-auto scrollbar-hide',
                  'overflow-y-hidden',
                  `${isCorrect ? 'bg-green-100' : 'bg-red-100'}`
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

export function ScoreBug(
  { score, numCorrect, total }: {
    score: number;
    numCorrect: number;
    total: number;
  }
): JSX.Element {
  return (
    <div
      className="my-2 flex flex-row gap-2 justify-center"
    >
      <p>Correct: {numCorrect}/{total}</p>
      <p>Score: {score}</p>
    </div>
  );
}
