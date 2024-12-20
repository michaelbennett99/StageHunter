import { useEffect, useCallback, useState } from "react";

export default function useTerrain(
  mapRef: React.RefObject<mapboxgl.Map>,
  isMapReady: boolean,
) {
  const map = mapRef.current;

  const [terrainExaggeration, setTerrainExaggeration] = useState(1);

  const updateTerrain = useCallback((value: number) => {
    if (!map) return;
    const terrain = map.getTerrain();
    console.log(terrain);

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
    if (!map || !isMapReady) return;

    updateTerrain(terrainExaggeration);

    map.on('style.load', () => {
      updateTerrain(terrainExaggeration);
    });
  }, [map, isMapReady, terrainExaggeration, updateTerrain]);

  return { terrainExaggeration, setTerrainExaggeration };
}
