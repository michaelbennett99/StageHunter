type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  isMapReady: boolean
  asChild?: boolean
}

export type MapButtonProps = Props;

export default function MapButton(props: Props): JSX.Element {
  const { isMapReady, asChild, children, ...buttonProps } = props;

  if (!isMapReady) return <></>;

  if (asChild) {
    return <>{children}</>;
  }

  return (
    <button {...buttonProps}>
      {children}
    </button>
  );
}
