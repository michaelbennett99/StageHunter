import { useEffect } from "react";

export default function useTerrain(
  mapRef: React.RefObject<mapboxgl.Map>,
  isMapReady: boolean,
  exaggeration: number
) {
  const map = mapRef.current;

  useEffect(() => {
    if (!map || !isMapReady) return;

    const terrain = map.getTerrain();

    try {
      map.setTerrain({
        exaggeration,
        source: terrain!.source
      });
    } catch (err) {
      console.error(err);
    }
  }, [map, isMapReady, exaggeration]);
}
