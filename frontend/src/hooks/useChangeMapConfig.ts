import { useEffect } from "react";
import { MapboxStandardConfig } from "@/interfaces/mapboxStandardConfig";
import { trySetMapConfig } from "@/lib/map";

export default function useChangeMapConfig(
  mapRef: React.RefObject<mapboxgl.Map>,
  isMapReady: boolean,
  config: MapboxStandardConfig
) {
  // Hook that watches for changes to the config and updates the map
  // Also updates when the map is ready
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isMapReady) return;

    if (process.env.NEXT_PUBLIC_DEBUG === 'true') {
      console.info("changing map config");
    }

    Object.entries(config).forEach(([key, value]) => {
      trySetMapConfig(map, key, value);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config, isMapReady]);
}
