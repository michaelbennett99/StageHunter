import { useEffect, useCallback } from "react";

export default function useTerrain(
  mapRef: React.RefObject<mapboxgl.Map>,
  isMapReady: boolean,
  exaggeration: number
) {
  const map = mapRef.current;

  const updateTerrain = useCallback((value: number) => {
    if (!map) return;
    const terrain = map.getTerrain();

    try {
      map.setTerrain({
        exaggeration: value,
        source: terrain?.source || 'mapbox-dem'
      });
    } catch (err) {
      console.error(err);
    }
  }, [map]);

  useEffect(() => {
    if (!map || !isMapReady) return;
    updateTerrain(exaggeration);
  }, [map, isMapReady, exaggeration, updateTerrain]);

  return { updateTerrain };
}
