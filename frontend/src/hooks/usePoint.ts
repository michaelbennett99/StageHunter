import along from "@turf/along";
import { useMemo } from "react";

export default function usePoint(
  track: GeoJSON.LineString,
  distance: number | null
) {
  const point = useMemo(() => {
    if (distance === null) return null;
    return along(track, distance / 1000);
  }, [track, distance]);

  return point;
}
