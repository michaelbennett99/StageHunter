import { useMemo } from "react";
import mapboxgl from "mapbox-gl";

export default function useBounds(track: GeoJSON.LineString) {
  const bounds = useMemo(() => {
    const track_coords = track.coordinates as [number, number][];
    const bounds = new mapboxgl.LngLatBounds();
    track_coords.forEach(coord => bounds.extend(coord));
    return bounds;
  }, [track]);

  return bounds;
}
