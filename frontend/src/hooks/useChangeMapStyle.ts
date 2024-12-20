import { useEffect } from "react";

import { MapboxStyleId, mapboxStyleMap } from "@/interfaces/mapboxStyles";
import { MapboxStandardConfig } from "@/interfaces/mapboxStandardConfig";
import { trySetMapConfig } from "@/lib/map";

export default function useChangeMapStyle(
  mapRef: React.RefObject<mapboxgl.Map>,
  selectedStyle: MapboxStyleId,
  config: MapboxStandardConfig
) {
  const fullMapboxStyle = mapboxStyleMap[selectedStyle];

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    map.once('style.load', () => {
      Object.entries(config).forEach(([key, value]) => {
        trySetMapConfig(map, key, value);
      });
    });

    map.setStyle(fullMapboxStyle.url);
  }, [selectedStyle]);
}
