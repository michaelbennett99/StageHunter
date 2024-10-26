'use client';

import { useState } from 'react';

import { ResultsData } from '@/app/(api)/resultsData';

export default function Input(
  { className, data }: { className?: string; data?: ResultsData }
): JSX.Element {
  return (
    <>
      <h2>Input</h2>
      <ul>
        {Object.entries(data ?? {}).map(([name, truth]) => {
          if (Array.isArray(truth)) {
            return truth.map((t, i) => (
              <li key={i}>
                <InputBox name={name} truth={t.name} />
              </li>
            ));
          }
          return (
            <li key={name}>
              <InputBox name={name} truth={truth} />
            </li>
          );
        })}
      </ul>
    </>
  );
}

function InputBox(
  { name, truth }: { name: string; truth: string }
): JSX.Element {
  const [val, setVal] = useState('');

  const rightAnswer = val === truth;

  return (
    <div className="flex flex-row">
      <h3>{name}</h3>
      <input
        type="text"
        value={val ?? ''}
        onChange={(e) => setVal(e.target.value)}
        disabled={rightAnswer}
      />
    </div>
  );
}
