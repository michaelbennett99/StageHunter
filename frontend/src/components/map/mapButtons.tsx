import { cn } from "@/lib/utils";

import MapResetButton, { MapResetButtonProps } from "./mapResetButton";
import MapStyleButton, { MapStyleButtonProps } from "./mapStyleButton";

export type MapButtonsProps = MapResetButtonProps

export default function MapButtons(props: MapButtonsProps): JSX.Element {
  const { mapRef, bounds, isMapReady } = props;

  return (
    <div
      className={cn(
        'absolute top-2 right-2 z-10 flex flex-row justify-end gap-2',
        'text-foreground'
      )}
    >
      <MapStyleButton isMapReady={isMapReady} />
      <MapResetButton
        mapRef={mapRef}
        bounds={bounds}
        isMapReady={isMapReady}
        id="map-reset-button"
      />
    </div>
  );
}
