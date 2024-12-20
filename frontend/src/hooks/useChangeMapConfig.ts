import { useEffect } from "react";
import { MapboxStandardConfig } from "@/interfaces/mapboxStandardConfig";
import { trySetMapConfig } from "@/lib/map";

export default function useChangeMapConfig(
  mapRef: React.RefObject<mapboxgl.Map>,
  config: MapboxStandardConfig
) {
  useEffect(() => {
    if (!mapRef.current) return;

    Object.entries(config).forEach(([key, value]) => {
      trySetMapConfig(mapRef.current!, key, value);
    });
  }, [config]);
}
