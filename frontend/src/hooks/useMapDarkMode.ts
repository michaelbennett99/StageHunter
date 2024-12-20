import { useEffect } from "react";
import { useTheme } from "next-themes";
import { MapboxStyleId } from "@/interfaces/mapboxStyles";
import { trySetMapConfig } from "@/lib/map";

export default function useMapDarkMode(
  mapRef: React.RefObject<mapboxgl.Map>,
  isMapReady: boolean,
  selectedStyle: MapboxStyleId
) {
  const { resolvedTheme } = useTheme();
  const lightPreset = resolvedTheme === 'dark' ? 'night' : 'day';
  const map = mapRef.current;

  useEffect(() => {
    if (!map || !isMapReady) return;

    trySetMapConfig(map, 'lightPreset', lightPreset);

    map.once('style.load', () => {
      trySetMapConfig(map, 'lightPreset', lightPreset);
    });
  }, [map, lightPreset, selectedStyle, isMapReady]);
}
