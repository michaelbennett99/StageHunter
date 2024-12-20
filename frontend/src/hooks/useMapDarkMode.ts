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
    if (!map || !isMapReady) return;

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
  }, [map, isMapReady, lightPreset, ]);
}
