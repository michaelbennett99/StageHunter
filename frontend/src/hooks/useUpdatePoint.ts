import { useEffect } from "react";

export default function useUpdatePoint(
  mapRef: React.RefObject<mapboxgl.Map>,
  isMapReady: boolean,
  point: GeoJSON.Feature<GeoJSON.Point> | null
) {
  useEffect(() => {
    if (!isMapReady || !mapRef.current) return;

    try {
      const source = mapRef
        .current
        ?.getSource('point') as mapboxgl.GeoJSONSource;

      source.setData({
        type: 'FeatureCollection',
        features: point ? [point] : []
      });
    } catch (error) {
      console.error('Error updating point:', error);
    }
  }, [point, isMapReady]);
}
