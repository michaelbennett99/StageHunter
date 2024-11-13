'use client';

import { useState, ChangeEventHandler } from 'react';
import { FaCheck } from 'react-icons/fa';

import { numToRank } from '@/utils/utils';
import Autocomplete from '@/components/autocomplete';

export interface Options {
  grand_tours: string[];
  riders: string[];
  teams: string[];
}

export default function Input(
  { options }: { options: Options }
): JSX.Element {
  // Get all the entries in the data object and list them
  // If the entry is an array, it's a group of entries, so we group them
  // in an InputBoxGroup
  const list_elements = [
    <InputBox name="Grand Tour" options={options.grand_tours} />,
    <InputBox name="Year" />,
    <InputBox name="Number" />,
    <InputBox name="Start" />,
    <InputBox name="End" />,
    <InputBoxGroup name="Stage Results" nBoxes={3} options={options.riders} />,
    <InputBoxGroup name="GC Results" nBoxes={3} options={options.riders} />,
    <InputBoxGroup name="Points Results" nBoxes={3} options={options.riders} />,
    <InputBoxGroup name="KOM Results" nBoxes={3} options={options.riders} />,
    <InputBoxGroup name="Youth Results" nBoxes={3} options={options.riders} />,
    <InputBoxGroup name="Teams Results" nBoxes={3} options={options.teams} />,
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
  { name, nBoxes, options }: {
    name: string;
    nBoxes: number;
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
              options={options}
            />
          </li>
        ))}
      </ul>
    </>
  );
}

function InputBox(
  { name, options, inputType }: {
    name: string;
    options?: string[];
    inputType?: 'text' | 'number';
  }
): JSX.Element {
  const [val, setVal] = useState('');

  return (
    <div className="flex items-center w-full h-full gap-1">
      <div className="flex-grow text-black text-sm">{name}</div>
      <TextInput
        name={name}
        value={val}
        onChange={(e) => setVal(e.target.value)}
        options={options}
        inputType={inputType}
      />
    </div>
  );
}

// A text input box that checks if the input is correct and disables
// itself if it is
function TextInput( {
  name,
  value,
  onChange,
  options,
  inputType = 'text',
  className,
}: {
  name: string;
  value: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  options?: string[];
  inputType?: 'text' | 'number';
  className?: string;
}): JSX.Element {
  const listId = `options-${name}`;
  return (
    <form
      className="flex items-center h-full gap-1"
      onSubmit={(e) => e.preventDefault()}
    >
      {options ? (
        <Autocomplete
          value={value}
          onChange={onChange}
          options={options}
        />
      ) : (
        <input
          className={
            `h-full w-40 p-1 border-2
            border-gray-300 text-black rounded-md
            ${className}`
          }
          type={inputType}
          value={value}
          onChange={onChange}
          list={listId}
        />
      )}
      <button
        type="button"
        className="
          bg-blue-500 text-white p-1 rounded-md h-full w-full
          hover:bg-blue-700
        "
      >
        <FaCheck className="h-full w-full" />
      </button>
    </form>
  );
}

function ScoreBug(
  { score }: { score: number }
): JSX.Element {
  return <div className="text-center mt-2 mb-4 text-black">Score: {score}</div>;
}
