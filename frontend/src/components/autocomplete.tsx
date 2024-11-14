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
  options,
  maxShownResults = 5,
  inputClassName,
  optionsClassName,
  selectedOptionClassName,
  ...inputProps
}: {
  options: string[];
  maxShownResults?: number;
  inputClassName?: string;
  optionsClassName?: string;
  selectedOptionClassName?: string;
} & React.InputHTMLAttributes<HTMLInputElement>
): JSX.Element {
  // Refs
  // We get the ref of the input element for horizontal sizing
  const inputRef = useRef<HTMLInputElement>(null);

  // State
  const [showOptions, setShowOptions] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  // Functions
  /**
   * Creates a dummy event to change the value of the input using the passed
   * onChange function without needing the parent's setValue function.
   */
  function setValue(newValue: string) {
    const event = {
      target: {
        value: newValue,
      },
    } as React.ChangeEvent<HTMLInputElement>;
    onChange(event);
  }

  // Handlers
  // Show options only when focused
  function handleFocusOnInput() {
    setShowOptions(true);
  }

  // Hide options and reset selected option when blurred
  function handleBlurOnInput() {
    setShowOptions(false);
    setSelectedOption(null);
  }

  // Highlight option on hover
  function handleMouseEnterOnOption(e: MouseEvent<HTMLLIElement>) {
    // Get the key from the attribute
    const key = e.currentTarget.dataset.key;
    if (!key) return;
    setSelectedOption(parseInt(key));
  }

  function handleClickOnOption(e: MouseEvent<HTMLLIElement>) {
    const target = e.target as HTMLLIElement;
    const newValue = target.innerText;
    setValue(newValue);
  }

  /**
   * Handles keyboard navigation of the options menu.
   * Arrow keys switch between options, Enter selects the current option.
   * When options are visible and an option is selected, Enter's default
   * behavior (including form submission) is suppressed.
   */
  function handleKeyPressOnInput(e: KeyboardEvent<HTMLInputElement>) {
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
      e.preventDefault();
      if (noneSelected || lastSelected) {
        setSelectedOption(0);
        return;
      }
      setSelectedOption(selectedOption + 1);
      return;
    }

    if (upArrow) {
      e.preventDefault();
      if (noneSelected || firstSelected) {
        setSelectedOption(shownOptions.length - 1);
        return;
      }
      setSelectedOption(selectedOption - 1);
      return;
    }

    if (escape) {
      e.preventDefault();
      if (noneSelected) {
        inputRef.current?.blur();
        return;
      }
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

  // Component body
  // Extract required props from inputProps
  const value = inputProps.value as string;
  const onChange = inputProps.onChange as ChangeEventHandler<HTMLInputElement>;

  // Filter options to show
  const shownOptions = options.filter(option =>
    option.toLowerCase().includes(value.toLowerCase())
    && option !== value
  );

  // Determine if the options menu should be shown
  const optionsVisible = showOptions && shownOptions.length > 0;

  // Define required styles
  const requiredContainerStyle = {
    position: 'relative' as const,
  }
  const requiredInputStyle = {}

  return (
    <div
      onKeyDown={handleKeyPressOnInput}
      style={requiredContainerStyle}
      onFocus={handleFocusOnInput}
      onBlur={handleBlurOnInput}
    >
      <input
        type="text"
        value={value}
        onChange={onChange}
        ref={inputRef}
        style={requiredInputStyle}
        className={inputClassName}
        {...inputProps}
      />
      <AutocompleteOptions
        optionsVisible={optionsVisible}
        shownOptions={shownOptions}
        selectedOption={selectedOption}
        onHover={handleMouseEnterOnOption}
        onClick={handleClickOnOption}
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

  const requiredOptionsListStyle = {
    position: 'absolute' as const,
    top: '100%',
    left: 0,
    zIndex: 1000,
    overflowY: 'auto' as const,
    ...optionsDims,
  }

  return (
    <ul
      className={optionsClassName}
      style={requiredOptionsListStyle}
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
  const optionDefaultStyle = {
    color: 'black',
    backgroundColor: 'white',
    paddingLeft: '0.2rem',
  };
  const selectedDefaultStyle = {
    ...optionDefaultStyle,
    backgroundColor: 'blue',
  }

  return (
    <li
      data-key={index}
      style={selected ? selectedDefaultStyle : optionDefaultStyle}
      className={selected ? selectedOptionClassName : ''}
      onMouseEnter={onHover}
      onClick={onClick}
      ref={ref}
    >
      {option}
    </li>
  );
}
