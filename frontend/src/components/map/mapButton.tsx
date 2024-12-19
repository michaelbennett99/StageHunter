import { IconType } from "react-icons/lib";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  Icon: IconType
  iconClassName?: string
  isMapReady: boolean
}

export type MapButtonProps = Omit<
  Props,
  'Icon' | 'iconClassName' | 'className'
>;

export default function MapButton(props: Props): JSX.Element {
  const { Icon, iconClassName, isMapReady, ...buttonProps } = props;

  if (!isMapReady) return <></>;

  return (
    <button {...buttonProps}>
      <Icon className={iconClassName} />
    </button>
  );
}
