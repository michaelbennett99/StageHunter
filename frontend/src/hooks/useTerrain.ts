import { useEffect, useCallback, useState } from "react";
import { MapboxStyleId } from "@/interfaces/mapboxStyles";

export default function useTerrain(
  mapRef: React.RefObject<mapboxgl.Map>,
  isMapReady: boolean,
  currentStyle: MapboxStyleId
) {
  const map = mapRef.current;

  const [terrainExaggeration, setTerrainExaggeration] = useState(1);

  const canUpdateTerrain = useCallback(() => {
    return map && isMapReady && currentStyle.includes('standard');
  }, [map, isMapReady, currentStyle]);

  const updateTerrain = useCallback((value: number) => {
    if (!canUpdateTerrain()) return;
    const terrain = map!.getTerrain();

    try {
      map!.setTerrain({
        exaggeration: value,
        source: terrain!.source
      });
    } catch (err) {
      console.error(err);
    }
  }, [canUpdateTerrain, terrainExaggeration, map]);

  useEffect(() => {
    if (!canUpdateTerrain()) return;

    updateTerrain(terrainExaggeration);

    map!.on('style.load', () => {
      updateTerrain(terrainExaggeration);
    });

    return () => {
      map!.off('style.load', () => {
        updateTerrain(terrainExaggeration);
      });
    };
  }, [canUpdateTerrain, terrainExaggeration, updateTerrain, map]);

  return { terrainExaggeration, setTerrainExaggeration };
}
