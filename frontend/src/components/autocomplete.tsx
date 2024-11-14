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
  maxShownResults = 5,
  inputClassName =
    'h-full w-40 p-1 border-2 border-gray-300 text-black rounded-md',
  optionsClassName = 'text-white bg-black',
  selectedOptionClassName = 'bg-blue-500',
}: {
  value: string;
  options: string[];
  onChange: ChangeEventHandler<HTMLInputElement>;
  maxShownResults?: number;
  inputClassName?: string;
  optionsClassName?: string;
  selectedOptionClassName?: string;
}): JSX.Element {
  // Refs
  // We get the ref of the input element for horizontal sizing
  const inputRef = useRef<HTMLInputElement>(null);

  // State
  const [showOptions, setShowOptions] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  // Filter options to show
  const shownOptions = options.filter(option =>
    option.toLowerCase().includes(value.toLowerCase())
    && option !== value
  );

  // Options menu calculated quantities
  const optionsVisible = showOptions && shownOptions.length > 0;

  // Handlers
  // Show options only when focused
  function onFocus() {
    setShowOptions(true);
  }

  // Hide options and reset selected option when blurred
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

  function setValue(newValue: string) {
    const event = {
      target: {
        value: newValue,
      },
    } as React.ChangeEvent<HTMLInputElement>;
    onChange(event);
  }

  function onClickOption(e: MouseEvent<HTMLLIElement>) {
    const target = e.target as HTMLLIElement;
    const newValue = target.innerText;
    // Call the parent's onChange with the new value
    setValue(newValue);
  }

  // Switch between options on arrow key and choose an option on enter
  // Suppress default behaviour for enter, including form submission, when
  // the options menu is visible and an option is selected
  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (!optionsVisible) return;

    const downArrow = e.key === 'ArrowDown';
    const upArrow = e.key === 'ArrowUp';
    const enter = e.key === 'Enter';
    const escape = e.key === 'Escape';

    if (!(downArrow || upArrow || enter || escape)) return;

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

    if (escape) {
      setSelectedOption(null);
      return;
    }

    if (enter && !noneSelected) {
      // Disable default enter behaviour, including form submission
      e.preventDefault();
      // Set the value to the selected option and reset the selected option
      const newValue = shownOptions[selectedOption];
      setValue(newValue);
      setSelectedOption(null);
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
      <AutocompleteOptions
        optionsVisible={optionsVisible}
        shownOptions={shownOptions}
        selectedOption={selectedOption}
        onHover={onHover}
        onClick={onClickOption}
        maxShownResults={maxShownResults}
        inputRef={inputRef}
        optionsClassName={optionsClassName}
        selectedOptionClassName={selectedOptionClassName}
      />
    </div>
  );
}

function AutocompleteOptions({
  optionsVisible,
  shownOptions,
  selectedOption,
  onHover,
  onClick,
  maxShownResults,
  inputRef,
  optionsClassName,
  selectedOptionClassName,
}: {
  optionsVisible: boolean;
  shownOptions: string[];
  selectedOption: number | null;
  onHover: MouseEventHandler<HTMLLIElement>;
  onClick: MouseEventHandler<HTMLLIElement>;
  maxShownResults: number;
  inputRef: RefObject<HTMLInputElement>;
  optionsClassName?: string;
  selectedOptionClassName?: string;
}): JSX.Element {
  // Refs
  const firstOrSelectedOptionRef = useRef<HTMLLIElement>(null);

  // State
  const [optionHeight, setOptionHeight] = useState<number>(0);

  // Effects
  // Set the height of an individual option
  useEffect(() => {
    if (firstOrSelectedOptionRef.current) {
      setOptionHeight(firstOrSelectedOptionRef.current.offsetHeight);
    }
  }, [shownOptions]);

  // Scroll to the selected option
  useEffect(() => {
    if (selectedOption !== null) {
      firstOrSelectedOptionRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [selectedOption]);

  // Function body
  if (!optionsVisible) return <></>;

  const optionsDims = {
    width: inputRef.current?.offsetWidth,
    height: Math.min(
      window.innerHeight
        - inputRef.current!.getBoundingClientRect().bottom
        - 10,
      Math.min(maxShownResults, shownOptions.length) * optionHeight
    ),
  };

  // Suppress default behaviour for mouse down on options to prevent blurring
  // the input
  function handleMouseDownOnOptions(e: MouseEvent<HTMLUListElement>) {
    e.preventDefault();
  }

  return (
    <ul
      className={`${optionsClassName} absolute overflow-y-auto`}
      style={{ ...optionsDims, top: '100%', left: 0, zIndex: 1000 }}
      onMouseDown={handleMouseDownOnOptions}
    >
      {shownOptions.map((option, i) => (
        <AutocompleteOption
          key={i}
          index={i}
          option={option}
          selected={selectedOption === i}
          onHover={onHover}
          onClick={onClick}
          selectedOptionClassName={selectedOptionClassName}
          ref={
            (selectedOption === i || (selectedOption === null && i === 0))
              ? firstOrSelectedOptionRef
              : undefined
          }
        />
      ))}
    </ul>
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
