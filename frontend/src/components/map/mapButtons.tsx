import { useState } from "react";

import { cn } from "@/lib/utils";

import MapResetButton, { MapResetButtonProps } from "./mapResetButton";
import { MapboxStyleId } from "@/interfaces/mapboxStyles";
import MapStyleButton, { MapStyleButtonProps } from "./mapStyleButton";
import MapConfigButton, { MapConfigButtonProps } from "./mapConfigButton";
import { MapboxStandardConfig } from "@/interfaces/mapboxStandardConfig";
import useMapDarkMode from "@/hooks/useMapDarkMode";
import useChangeMapStyle from "@/hooks/useChangeMapStyle";
import useChangeMapConfig from "@/hooks/useChangeMapConfig";

export type MapButtonsProps = MapResetButtonProps
  & Omit<MapConfigButtonProps, 'config' | 'setConfig'>
  & Omit<MapStyleButtonProps, 'selectedStyle' | 'setSelectedStyle'>
  & {
    defaultConfig: MapboxStandardConfig,
    defaultStyle: MapboxStyleId,
    terrainExaggeration: number,
    onTerrainExaggerationChange: (value: number) => void,
  };

export default function MapButtons(props: MapButtonsProps): JSX.Element {
  const {
    mapRef,
    bounds,
    isMapReady,
    defaultConfig,
    defaultStyle,
    terrainExaggeration,
    onTerrainExaggerationChange,
    ...buttonProps
  } = props;

  const [selectedStyle, setSelectedStyle] = useState(defaultStyle);
  const [config, setConfig] = useState(defaultConfig);

  const standardStyleSelected = selectedStyle.includes('standard');

  // Hooks to change the map style and implement dark mode
  useChangeMapStyle(mapRef, selectedStyle, config);
  useChangeMapConfig(mapRef, config);
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
      <div className="bg-background rounded-lg shadow-md p-2">
        <label className="text-sm font-medium">
          Terrain Exaggeration
          <input
            type="number"
            min={0}
            max={10}
            step={0.1}
            value={terrainExaggeration}
            onChange={(e) => onTerrainExaggerationChange(parseFloat(e.target.value))}
            className="w-full mt-1 h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
          />
        </label>
      </div>
    </div>
  );
}
