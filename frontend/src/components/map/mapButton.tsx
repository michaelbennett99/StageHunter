import { IconType } from "react-icons/lib";

export type MapButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  Icon: IconType
  iconClassName?: string
  isMapReady: boolean
}

export default function MapButton(props: MapButtonProps): JSX.Element {
  const { Icon, iconClassName, isMapReady, ...buttonProps } = props;

  if (!isMapReady) return <></>;

  return (
    <button {...buttonProps}>
      <Icon className={iconClassName} />
    </button>
  );
}
