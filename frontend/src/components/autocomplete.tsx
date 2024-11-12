import {
  ChangeEventHandler,
  KeyboardEvent,
  MouseEvent,
  MouseEventHandler,
  useState,
  useEffect,
  useRef,
  RefObject,
} from 'react';

export default function Autocomplete({
  value,
  options,
  onChange,
  maxResults = options.length,
  maxShownResults = 5,
  inputClassName =
    'h-full w-40 p-1 border-2 border-gray-300 text-black rounded-md',
  optionsClassName = 'text-white bg-black',
  selectedOptionClassName = 'bg-blue-500',
}: {
  value: string;
  options: string[];
  onChange: ChangeEventHandler<HTMLInputElement>;
  maxResults?: number;
  maxShownResults?: number;
  inputClassName?: string;
  optionsClassName?: string;
  selectedOptionClassName?: string;
}): JSX.Element {
  // State
  const [showOptions, setShowOptions] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [optionHeight, setOptionHeight] = useState<number>(0);

  // Refs
  // We get the ref of the input element so we can position the options menu
  const inputRef = useRef<HTMLInputElement>(null);
  const firstOptionRef = useRef<HTMLLIElement>(null);

  // Effects
  useEffect(() => {
    if (firstOptionRef.current) {
      setOptionHeight(firstOptionRef.current.offsetHeight);
    }
  }, [showOptions]);

  // Filtered options
  const shownOptions = options.filter((option, i) =>
    option.toLowerCase().includes(value.toLowerCase()) && i < maxResults
  );

  const firstOptionHeight = firstOptionRef.current?.offsetHeight;

  // Handlers
  // Show options only when focused
  function onFocus() {
    setShowOptions(true);
  }

  function onBlur() {
    setShowOptions(false);
    setSelectedOption(null);
  }

  // Highlight option on hover
  function onHover(e: MouseEvent<HTMLLIElement>) {
    // Get the key from the attribute
    const key = e.currentTarget.dataset.key;
    if (!key) return;
    setSelectedOption(parseInt(key));
  }

  function onClickOption(e: MouseEvent<HTMLLIElement>) {
    const target = e.target as HTMLLIElement;
    const newValue = target.innerText;
    // Call the parent's onChange with the new value
    const event = {
      target: {
        value: newValue,
      },
    } as React.ChangeEvent<HTMLInputElement>;
    onChange(event);
    inputRef.current?.blur();
  }

  // Switch between options on arrow key
  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (!showOptions) return;

    const downArrow = e.key === 'ArrowDown';
    const upArrow = e.key === 'ArrowUp';
    const enter = e.key === 'Enter';

    if (!(downArrow || upArrow || enter)) return;

    const noneSelected = selectedOption === null;
    const firstSelected = selectedOption === 0;
    const lastSelected = selectedOption === shownOptions.length - 1;

    if (downArrow) {
      if (noneSelected || lastSelected) {
        setSelectedOption(0);
        return;
      }
      setSelectedOption(selectedOption + 1);
      return;
    }

    if (upArrow) {
      if (noneSelected || firstSelected) {
        setSelectedOption(shownOptions.length - 1);
        return;
      }
      setSelectedOption(selectedOption - 1);
      return;
    }

    if (enter) {
      if (noneSelected) return;

      const newValue = shownOptions[selectedOption];
      const event = {
        target: {
          value: newValue,
        },
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(event);
      inputRef.current?.blur();
    }
  }

  return (
    <div
      onKeyDown={onKeyDown}
      className="relative"
      onFocus={onFocus}
      onBlur={onBlur}
    >
      <input
        type="text"
        value={value}
        onChange={onChange}
        ref={inputRef}
        className={inputClassName}
      />
      {showOptions && (
        <ul
          className={`${optionsClassName} absolute overflow-y-auto`}
          style={{
            width: inputRef.current?.offsetWidth,
            top: '100%',
            left: 0,
            height: Math.min(
              window.innerHeight
                - inputRef.current!.getBoundingClientRect().bottom
                - 10,
              maxShownResults * optionHeight
            ),
            zIndex: 1000,
          }}
          onMouseDown={(e) => e.preventDefault()}
        >
          {shownOptions.map((option, i) => (
            <AutocompleteOption
              key={i}
              index={i}
              option={option}
              selected={selectedOption === i}
              onHover={onHover}
              onClick={onClickOption}
              selectedOptionClassName={selectedOptionClassName}
              ref={i === 0 ? firstOptionRef : undefined}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function AutocompleteOption({
  index,
  option,
  selected,
  onHover,
  onClick,
  selectedOptionClassName,
  ref,
}: {
  index: number;
  option: string;
  selected: boolean;
  onHover: MouseEventHandler<HTMLLIElement>;
  onClick: MouseEventHandler<HTMLLIElement>;
  selectedOptionClassName?: string;
  ref?: RefObject<HTMLLIElement>;
}): JSX.Element {
  return (
    <li
      data-key={index}
      className={selected ? selectedOptionClassName : ''}
      onMouseEnter={onHover}
      onClick={onClick}
      ref={ref}
    >
      {option}
    </li>
  );
}
