import { useEffect, useRef } from "react";

import { MapboxStyleId, mapboxStyleMap } from "@/interfaces/mapboxStyles";
import { MapboxStandardConfig } from "@/interfaces/mapboxStandardConfig";
import { trySetMapConfig } from "@/lib/map";

export default function useChangeMapStyle(
  mapRef: React.RefObject<mapboxgl.Map>,
  selectedStyle: MapboxStyleId,
  config: MapboxStandardConfig
) {
  // Map style will already be set on the first render, so we don't need to
  // set it again.
  const isFirstRender = useRef(true);
  const fullMapboxStyle = mapboxStyleMap[selectedStyle];

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const map = mapRef.current;
    if (!map) return;

    if (process.env.NEXT_PUBLIC_DEBUG === 'true') {
      console.info("changing map style");
    }

    map.once('style.load', () => {
      Object.entries(config).forEach(([key, value]) => {
        trySetMapConfig(map, key, value);
      });
    });

    map.setStyle(fullMapboxStyle.url);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStyle]);
}
