import { useState } from "react";
import { cn } from "@/lib/utils";

import MapResetButton, { MapResetButtonProps } from "./mapResetButton";
import MapStyleButton, { MapStyleButtonProps } from "./mapStyleButton";
import MapConfigButton, { MapConfigButtonProps } from "./mapConfigButton";
import MapTerrainButton, { MapTerrainButtonProps } from "./mapTerrainButton";

export type MapButtonsProps = MapResetButtonProps
  & MapConfigButtonProps
  & MapStyleButtonProps
  & MapTerrainButtonProps;

export default function MapButtons(props: MapButtonsProps): JSX.Element {
  const {
    mapRef,
    bounds,
    isMapReady,
    config,
    setConfig,
    selectedStyle,
    setSelectedStyle,
    terrainExaggeration,
    onTerrainExaggerationChange,
    ...buttonProps
  } = props;

  const standardStyleSelected = selectedStyle.includes('standard');

  return (
    isMapReady ? (
      <div
        className={cn(
          'absolute top-2 right-2 z-10 flex flex-row justify-end gap-2',
          'text-foreground'
        )}
      >
        {standardStyleSelected && (
          <>
            <MapTerrainButton
              terrainExaggeration={terrainExaggeration}
              onTerrainExaggerationChange={onTerrainExaggerationChange}
              id="map-terrain-button"
            />
            <MapConfigButton
              mapRef={mapRef}
              config={config}
              setConfig={setConfig}
              isMapReady={isMapReady}
              id="map-config-button"
              {...buttonProps}
            />
          </>
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
    ) : <></>
  );
}
