import { useState } from "react";

import { cn } from "@/lib/utils";

import MapResetButton, { MapResetButtonProps } from "./mapResetButton";
import { MapboxStyleId } from "@/interfaces/mapboxStyles";
import MapStyleButton, { MapStyleButtonProps } from "./mapStyleButton";
import MapConfigButton, { MapConfigButtonProps } from "./mapConfigButton";
import { MapboxStandardConfig } from "@/interfaces/mapboxStandardConfig";
import useMapDarkMode from "@/hooks/useMapDarkMode";
import useChangeMapStyle from "@/hooks/useChangeMapStyle";

export type MapButtonsProps = MapResetButtonProps
  & Omit<MapConfigButtonProps, 'config' | 'setConfig'>
  & Omit<MapStyleButtonProps, 'selectedStyle' | 'setSelectedStyle'>
  & {
    defaultConfig: MapboxStandardConfig,
    defaultStyle: MapboxStyleId,
  };

export default function MapButtons(props: MapButtonsProps): JSX.Element {
  const {
    mapRef,
    bounds,
    isMapReady,
    defaultConfig,
    defaultStyle,
    ...buttonProps
  } = props;

  const [selectedStyle, setSelectedStyle] = useState(defaultStyle);
  const [config, setConfig] = useState(defaultConfig);

  const standardStyleSelected = selectedStyle.includes('standard');

  // Hooks to change the map style and implement dark mode
  useChangeMapStyle(mapRef, selectedStyle, config);
  useMapDarkMode(mapRef, isMapReady, selectedStyle);

  return (
    <div
      className={cn(
        'absolute top-2 right-2 z-10 flex flex-row justify-end gap-2',
        'text-foreground'
      )}
    >
      {standardStyleSelected && (
        <MapConfigButton
          mapRef={mapRef}
          config={config}
          setConfig={setConfig}
          isMapReady={isMapReady}
          id="map-config-button"
          {...buttonProps}
        />
      )}
      <MapStyleButton
        mapRef={mapRef}
        isMapReady={isMapReady}
        id="map-style-button"
        selectedStyle={selectedStyle}
        setSelectedStyle={setSelectedStyle}
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
