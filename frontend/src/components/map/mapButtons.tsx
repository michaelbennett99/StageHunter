import { cn } from "@/lib/utils";

import MapResetButton, { MapResetButtonProps } from "./mapResetButton";
import MapStyleButton, { MapStyleButtonProps } from "./mapStyleButton";
import MapConfigButton, { MapConfigButtonProps } from "./mapConfigButton";

export type MapButtonsProps = MapResetButtonProps
& MapConfigButtonProps
& MapStyleButtonProps;

export default function MapButtons(props: MapButtonsProps): JSX.Element {
  const {
    mapRef,
    bounds,
    isMapReady,
    defaultConfig,
    defaultStyle,
    ...buttonProps
  } = props;

  return (
    <div
      className={cn(
        'absolute top-2 right-2 z-10 flex flex-row justify-end gap-2',
        'text-foreground'
      )}
    >
      <MapConfigButton
        mapRef={mapRef}
        defaultConfig={defaultConfig}
        isMapReady={isMapReady}
        id="map-config-button"
        {...buttonProps}
      />
      <MapStyleButton
        mapRef={mapRef}
        isMapReady={isMapReady}
        id="map-style-button"
        defaultStyle={defaultStyle}
        {...buttonProps}
      />
      <MapResetButton
        mapRef={mapRef}
        bounds={bounds}
        isMapReady={isMapReady}
        id="map-reset-button"
        {...buttonProps}
      />
    </div>
  );
}
