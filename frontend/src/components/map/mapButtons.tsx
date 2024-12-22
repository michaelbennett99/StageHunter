import { useState } from "react";
import { cn } from "@/lib/utils";

import MapResetButton, { MapResetButtonProps } from "./mapResetButton";
import MapStyleButton, { MapStyleButtonProps } from "./mapStyleButton";
import MapConfigButton, { MapConfigButtonProps } from "./mapConfigButton";
import MapTerrainButton, { MapTerrainButtonProps } from "./mapTerrainButton";

export type MapButtonsProps = MapResetButtonProps
  & MapConfigButtonProps
  & MapStyleButtonProps
  & MapTerrainButtonProps
  & {
    isMapReady: boolean;
  };

export default function MapButtons({
  mapRef,
  bounds,
  isMapReady,
  config,
  setConfig,
  selectedStyle,
  setSelectedStyle,
  terrainExaggeration,
  onTerrainExaggerationChange,
}: MapButtonsProps): JSX.Element {
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
            />
            <MapConfigButton
              config={config}
              setConfig={setConfig}
              mapRef={mapRef}
            />
          </>
        )}
        <MapStyleButton
          selectedStyle={selectedStyle}
          setSelectedStyle={setSelectedStyle}
          mapRef={mapRef}
        />
        <MapResetButton
          mapRef={mapRef}
          bounds={bounds}
        />
      </div>
    ) : <></>
  );
}
