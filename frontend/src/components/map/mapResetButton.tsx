import { FaArrowsRotate } from "react-icons/fa6";

import { cn } from "@/lib/utils";

import MapButton, { MapButtonProps } from "./mapButton";

export type MapResetButtonProps = MapButtonProps & {
  mapRef: React.RefObject<mapboxgl.Map>,
  bounds: mapboxgl.LngLatBounds,
}

export default function MapResetButton(
  props: MapResetButtonProps
): JSX.Element {
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
      className={cn(
        'p-2 rounded-md shadow-md',
        'bg-opacity-50 hover:bg-opacity-100 group',
        'bg-background'
      )}
    >
      <FaArrowsRotate className="group-hover:animate-spin-once" />
    </MapButton>
  );
}
