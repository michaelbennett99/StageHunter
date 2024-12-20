import { useEffect } from "react";
import { useTheme } from "next-themes";
import { MapboxStyleId } from "@/interfaces/mapboxStyles";

export default function useMapDarkMode(
  mapRef: React.RefObject<mapboxgl.Map>,
  selectedStyle: MapboxStyleId
) {
  const { resolvedTheme } = useTheme();
  const lightPreset = resolvedTheme === 'dark' ? 'night' : 'day';
  const map = mapRef.current;

  useEffect(() => {
    if (!map) return;

    map.once('style.load', () => {
      try {
        console.log('Setting light preset:', lightPreset);
        map.setConfigProperty(
          'basemap', 'lightPreset', lightPreset);
      } catch (error) {
        console.error('Error setting light preset:', error);
      }
    });
    return () => {}
  }, [map, lightPreset, selectedStyle]);
}
