import {
  ChangeEventHandler,
  KeyboardEvent,
  MouseEvent,
  MouseEventHandler,
  useState,
  useEffect,
  useRef,
  RefObject,
  useMemo,
} from 'react';
import { twMerge } from 'tailwind-merge';

interface AutocompleteProps extends React.InputHTMLAttributes<HTMLInputElement> {
  options?: string[];
  maxShownResults?: number;
  inputClassName?: string;
  optionsListClassName?: string;
  optionClassName?: string;
  selectedOptionClassName?: string;
};

/**
 * Autocomplete text input component. The component must be controlled.
 * @param value - Value to display in the input.
 * @param onChange - Function to call when the input value changes.
 * @param options - Array of options to display in the dropdown menu.
 * @param maxShownResults - Maximum number of results to display in the dropdown
 * menu, scroll to overflow.
 * Styling options.
 * @param inputClassName - Class name for the input element.
 * @param optionsListClassName - Class name for the options list element.
 * @param optionClassName - Class name for the option elements.
 * @param selectedOptionClassName - Class name for the selected option element.
 * @returns Autocomplete component.
 */
export default function AutoComplete({
  options,
  maxShownResults = 5,
  inputClassName,
  optionsListClassName,
  optionClassName,
  selectedOptionClassName,
  ...inputProps
}: AutocompleteProps): JSX.Element {
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
  const shownOptions = useMemo(() => (options ?? [])
    .filter(option =>
      option.toLowerCase().includes(value.toLowerCase())
      && option !== value
    ),
    [options, value]
  );

  // Determine if the options menu should be shown
  const optionsVisible = showOptions
    && shownOptions.length > 0
    && !inputProps.disabled;

  // Effects that depend on shownOptions and optionsVisible
  useEffect(() => {
    setSelectedOption(null);
  }, [value]);

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
        optionsListClassName={optionsListClassName}
        optionClassName={optionClassName}
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
  optionsListClassName,
  optionClassName,
  selectedOptionClassName,
}: {
  optionsVisible: boolean;
  shownOptions: string[];
  selectedOption: number | null;
  onHover: MouseEventHandler<HTMLLIElement>;
  onClick: MouseEventHandler<HTMLLIElement>;
  maxShownResults: number;
  inputRef: RefObject<HTMLInputElement>;
  optionsListClassName?: string;
  optionClassName?: string;
  selectedOptionClassName?: string;
}): JSX.Element {
  // Refs
  // firstOptionRef used for sizing and selectedOptionRef used for scrolling
  // If the first element is selected, then firstOptionRef is left undefined
  // and selectedOptionRef is used for both sizing and scrolling
  const firstOptionRef = useRef<HTMLLIElement>(null);
  const selectedOptionRef = useRef<HTMLLIElement>(null);

  // State
  const [optionHeight, setOptionHeight] = useState<number>(0);
  const [optionsHeight, setOptionsHeight] = useState<number>(0);

  // Effects
  // Set the height of an individual option
  useEffect(() => {
    const element = firstOptionRef.current || selectedOptionRef.current!;
    if (element) {
      setOptionHeight(element.getBoundingClientRect().height);
    }
  }, [optionsVisible]);

  // Scroll to the selected option
  useEffect(() => {
    if (selectedOption !== null) {
      selectedOptionRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [selectedOption]);

  // Set the height of the options list
  useEffect(() => {
    if (!inputRef.current) return;

    // Function to update options height
    const updateOptionsHeight = () => {
      const numOptions = Math.min(maxShownResults, shownOptions.length);
      setOptionsHeight(Math.min(
        window.innerHeight
          - inputRef.current!.getBoundingClientRect().bottom
          - 10,
        numOptions * optionHeight
      ));
    };

    // Initial calculation
    updateOptionsHeight();

    // Add scroll event listener
    window.addEventListener('scroll', updateOptionsHeight, true);

    // Cleanup
    return () => {
      window.removeEventListener('scroll', updateOptionsHeight, true);
    };
  }, [
    shownOptions.length,
    optionHeight,
    maxShownResults,
    inputRef,
  ]);

  // Function body
  if (!optionsVisible) return <></>;

  const optionsDims = {
    width: inputRef.current?.clientWidth,
    height: optionsHeight,
  }

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
    boxSizing: 'content-box' as const,
    ...optionsDims,
  }

  return (
    <ul
      className={optionsListClassName}
      style={requiredOptionsListStyle}
      onMouseDown={handleMouseDownOnOptions}
    >
      {shownOptions.map((option, i) => {
        const isFirst = i === 0;
        const isSelected = selectedOption === i;

        let ref = undefined;
        if (isSelected) ref = selectedOptionRef;
        else if (isFirst) ref = firstOptionRef;

        return (
          <AutocompleteOption
            key={i}
            index={i}
            option={option}
            selected={isSelected}
            onHover={onHover}
            onClick={onClick}
            optionClassName={optionClassName}
            selectedOptionClassName={selectedOptionClassName}
            ref={ref}
          />
        );
      })}
    </ul>
  );
}

function AutocompleteOption({
  index,
  option,
  selected,
  onHover,
  onClick,
  optionClassName,
  selectedOptionClassName,
  ref,
}: {
  index: number;
  option: string;
  selected: boolean;
  onHover: MouseEventHandler<HTMLLIElement>;
  onClick: MouseEventHandler<HTMLLIElement>;
  optionClassName?: string;
  selectedOptionClassName?: string;
  ref?: RefObject<HTMLLIElement>;
}): JSX.Element {
  const defaultStyle =  {
    boxSizing: 'content-box' as const,
  };

  const selectedOptionFullClassName = twMerge(
    optionClassName,
    selectedOptionClassName
  );

  return (
    <li
      data-key={index}
      className={selected ? selectedOptionFullClassName : optionClassName}
      style={defaultStyle}
      onMouseEnter={onHover}
      onClick={onClick}
      ref={ref}
    >
      {option}
    </li>
  );
}
