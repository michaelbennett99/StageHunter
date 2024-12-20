import { useEffect } from "react";
import { MapboxStandardConfig } from "@/interfaces/mapboxStandardConfig";
import { trySetMapConfig } from "@/lib/map";

export default function useChangeMapConfig(
  mapRef: React.RefObject<mapboxgl.Map>,
  isMapReady: boolean,
  config: MapboxStandardConfig
) {
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isMapReady) return;

    Object.entries(config).forEach(([key, value]) => {
      trySetMapConfig(map, key, value);
    });
  }, [config, isMapReady]);
}
