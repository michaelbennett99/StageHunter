import { useEffect } from "react";

export default function useUpdatePoint(
  mapRef: React.RefObject<mapboxgl.Map>,
  isMapReady: boolean,
  point: GeoJSON.Feature<GeoJSON.Point> | null
) {
  useEffect(() => {
    if (!isMapReady || !mapRef.current) return;

    const updateSource = () => {
      try {
        const source = mapRef
          .current?.getSource('point') as mapboxgl.GeoJSONSource;
        if (!source) {
          console.warn('Point source not found');
          return;
        }

        source.setData({
          type: 'FeatureCollection',
          features: point ? [point] : []
        });
      } catch (error) {
        console.error('Error updating point:', error);
      }
    };

    // If point is null, delay the update
    if (!point) {
      const timeoutId = setTimeout(updateSource, 50); // Adjust delay as needed
      return () => clearTimeout(timeoutId);
    }

    // Otherwise update immediately
    updateSource();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [point, isMapReady]);
}
