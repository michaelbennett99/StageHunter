import { FaArrowsRotate } from "react-icons/fa6";

import { cn } from "@/lib/utils";

import MapButton, { MapButtonProps } from "./mapButton";

type Props = Omit<MapButtonProps, 'Icon' | 'iconClassName' | 'className'> & {
  mapRef: React.RefObject<mapboxgl.Map>,
  bounds: mapboxgl.LngLatBounds
}

export default function MapResetButton(props: Props): JSX.Element {
  const { mapRef, bounds, ...buttonProps } = props;
  const handleClick = () => {
    mapRef.current?.fitBounds(bounds, {
      padding: 100
    });
  };
  return (
    <MapButton
      {...buttonProps}
      onClick={handleClick}
      Icon={FaArrowsRotate}
      className={cn(
        'absolute top-2 right-2 z-10',
        'p-2 rounded-md shadow-md',
        'bg-opacity-50 hover:bg-opacity-100 group',
        'bg-map-button-background text-map-button-foreground dark:invert'
      )}
      iconClassName="group-hover:animate-spin-once"
    />
  );
}
