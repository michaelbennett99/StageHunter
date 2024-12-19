type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  isMapReady: boolean
}

export type MapButtonProps = Props;

export default function MapButton(props: Props): JSX.Element {
  const { isMapReady, children, ...buttonProps } = props;

  if (!isMapReady) return <></>;

  return (
    <button {...buttonProps}>
      {children}
    </button>
  );
}
