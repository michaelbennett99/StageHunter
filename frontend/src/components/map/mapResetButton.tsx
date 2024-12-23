import { FaArrowsRotate } from "react-icons/fa6";

import MapButton, { MapButtonProps } from "./mapButton";

export type MapResetButtonProps = MapButtonProps & {
  mapRef: React.RefObject<mapboxgl.Map>,
  bounds: mapboxgl.LngLatBounds,
}

export default function MapResetButton(
  { mapRef, bounds, ...buttonProps }: MapResetButtonProps
): JSX.Element {

  const handleClick = () => {
    mapRef.current?.fitBounds(bounds, {
      padding: 100
    });
  };

  return (
    <MapButton
      {...buttonProps}
      onClick={handleClick}
      className="group"
    >
      <FaArrowsRotate className="group-hover:animate-spin-once" />
    </MapButton>
  );
}
