import { useEffect, useCallback, useState } from "react";
import { MapboxStyleId } from "@/interfaces/mapboxStyles";

export default function useTerrain(
  mapRef: React.RefObject<mapboxgl.Map>,
  isMapReady: boolean,
  currentStyle: MapboxStyleId
) {
  const [terrainExaggeration, setTerrainExaggeration] = useState(1);

  const canUpdateTerrain = isMapReady && currentStyle.includes('standard');

  const updateTerrain = useCallback((value: number) => {
    const map = mapRef.current;
    if (!canUpdateTerrain || !map) return;

    const terrain = map.getTerrain();
    if (!terrain) return;

    try {
      map.setTerrain({
        exaggeration: value,
        source: terrain.source
      });
    } catch (err) {
      console.error('Failed to update terrain:', err);
    }
  }, [canUpdateTerrain, mapRef]);

  useEffect(() => {
    const map = mapRef.current;
    if (!canUpdateTerrain || !map) return;

    // Initial terrain update
    updateTerrain(terrainExaggeration);

    // Create a single listener function
    const handleStyleLoad = () => {
      updateTerrain(terrainExaggeration);
    };

    // Add the listener
    map.on('style.load', handleStyleLoad);

    // Cleanup with the same function reference
    return () => {
      map.off('style.load', handleStyleLoad);
    };
  }, [canUpdateTerrain, terrainExaggeration, updateTerrain, mapRef]);

  return { terrainExaggeration, setTerrainExaggeration };
}
