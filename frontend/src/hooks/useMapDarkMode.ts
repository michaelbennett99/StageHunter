import { useEffect } from "react";
import { useTheme } from "next-themes";

export default function useMapDarkMode(
    mapRef: React.RefObject<mapboxgl.Map>,
    isMapReady: boolean
) {
  const { resolvedTheme } = useTheme();
  const lightPreset = resolvedTheme === 'dark' ? 'night' : 'day';
  const map = mapRef.current;
  useEffect(() => {
    if (map && isMapReady) {
      map.setConfigProperty(
        'basemap', 'lightPreset', lightPreset);
    }
  }, [map, isMapReady, lightPreset]);
}
