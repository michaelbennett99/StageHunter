'use client';

import { useState, ChangeEventHandler } from 'react';

import { ResultsData, Result } from '@/app/(api)/types';
import { numToRank, deSnakeCase } from '@/utils';
import { spoof_data } from '../data';

export default function Input(
  { data }: { data?: ResultsData }
): JSX.Element {
  const list_elements = Object.entries(data ?? spoof_data)
    .map(([name, data]) => {
      const displayName = deSnakeCase(name);

      if (Array.isArray(data)) {
        return (
          <li key={name}>
            <InputBoxGroup name={displayName} data={data} />
          </li>
        );
      }
      return (
        <li key={name} className={`flex flex-row items-center`}>
          <InputBox name={displayName} truth={data} />
        </li>
      );
    });

  return (
    <div
      className="w-80 flex flex-col h-screen overflow-hidden"
      id="input-container"
    >
      <div className={`overflow-y-auto h-full pl-6 pr-6 bg-gray-100`}>
        <h2 className="font-semibold mt-4 mb-2 text-lg text-center">
          Guess the stage!
        </h2>
        <ul className="flex-grow flex flex-col">{list_elements}</ul>
        <div className="text-center mt-2 mb-4">Score: 0</div>
      </div>
    </div>
  );
}

function InputBoxGroup(
  { name, data }: { name: string; data: Result[] }
): JSX.Element {
  return (
    <>
      <h3 className="font-semibold mb-1">{name}</h3>
      <ul>
        {data.map((d) => (
          <li
            key={`${name}-${d.name}`}
            className="flex flex-row items-center ml-4"
          >
            <InputBox name={numToRank(d.rank) ?? ''} truth={d.name} />
          </li>
        ))}
      </ul>
    </>
  );
}

function compare(left: string, right: any): boolean {
  return left === String(right);
}

function InputBox(
  { name, truth }: { name: string; truth: string }
): JSX.Element {
  const [val, setVal] = useState('');

  const rightAnswer = compare(val, truth);

  return (
    <div className="flex items-center w-full">
      <div className="flex-grow">{name}</div>
      <TextInput
        value={val}
        onChange={(e) => setVal(e.target.value)}
        rightAnswer={rightAnswer}
      />
    </div>
  );
}

function TextInput( {
  value,
  onChange,
  rightAnswer,
  className,
}: {
  value: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  rightAnswer: boolean;
  className?: string;
}): JSX.Element {
  return (
    <input
      className={
        `w-40 m-0.5 ml-2 border-2 border-gray-300 rounded-md ${className}`
      }
      type="text"
      value={value}
      onChange={onChange}
      disabled={rightAnswer}
    />
  );
}
