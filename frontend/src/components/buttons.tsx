import { FaArrowsRotate } from 'react-icons/fa6';

export function MapResetButton(
  props: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    iconClassName?: string
  }
): JSX.Element {
  const { iconClassName, ...buttonProps } = props;
  return (
    <button {...buttonProps}>
      <FaArrowsRotate className={iconClassName} />
    </button>
  );
}
