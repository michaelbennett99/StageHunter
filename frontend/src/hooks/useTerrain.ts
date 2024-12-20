import { useEffect, useCallback, useState } from "react";
import { MapboxStyleId } from "@/interfaces/mapboxStyles";

export default function useTerrain(
  mapRef: React.RefObject<mapboxgl.Map>,
  isMapReady: boolean,
  currentStyle: MapboxStyleId
) {
  const map = mapRef.current;

  const [terrainExaggeration, setTerrainExaggeration] = useState(1);

  const updateTerrain = useCallback((value: number) => {
    if (!map) return;
    const terrain = map.getTerrain();

    try {
      map.setTerrain({
        exaggeration: value,
        source: terrain!.source
      });
    } catch (err) {
      console.error(err);
    }
  }, [map]);

  useEffect(() => {
    if (!map || !isMapReady || !currentStyle.includes('standard')) return;

    updateTerrain(terrainExaggeration);

    map.on('style.load', () => {
      updateTerrain(terrainExaggeration);
    });
  }, [map, isMapReady, terrainExaggeration, updateTerrain, currentStyle]);

  return { terrainExaggeration, setTerrainExaggeration };
}
