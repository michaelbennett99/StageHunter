import { IconType } from "react-icons/lib";

export type MapButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  Icon: IconType
  iconClassName?: string
}

export default function MapButton(props: MapButtonProps): JSX.Element {
  const { Icon, iconClassName, ...buttonProps } = props;
  return (
    <button {...buttonProps}>
      <Icon className={iconClassName} />
    </button>
  );
}
